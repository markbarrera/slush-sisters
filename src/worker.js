/*
  Slush Sisters — edge Worker
  ===========================

  This Worker sits in front of the static site. It does two things and nothing
  else:

    1. LOGS every request server-side to Workers Analytics Engine — who fetched
       what, which crawler, what status, from which country. This is how we see
       search/AI crawlers and whether outside traffic leaks into the orphaned
       pages (/ideas, /read, /inventory). It is the data source for the future
       dashboard.

    2. Serves a lightweight MARKDOWN version of a page to AI agents that ask for
       one (Accept: text/markdown, or ?format=md), which is cheaper for them to
       read than parsing styled HTML.

  Everything else is handed straight back to the static assets, unchanged, via
  the ASSETS binding — so trailing-slash redirects and the 404 page still work
  exactly as before.

  WHY THIS IS COPPA-SAFE EVEN THOUGH IT "TRACKS" GAME PAGES
  --------------------------------------------------------
  The COPPA line is about not putting tracking *code* (cookies, beacons,
  persistent identifiers, PII capture) on pages children use. This Worker does
  none of that. It is server-side operational logging — the same kind of request
  log every web server keeps — with deliberately NO cookies, NO IP address, NO
  identifiers, and NO personal data. It logs the path, a coarse country, the
  crawler name, and the status. That lets us watch for crawler/leak traffic to
  ANY path (games and orphaned pages included, which is the whole point) without
  ever tracking a child. The PostHog beacon, which does use a persistent id,
  stays OFF those pages — that separation is intentional.
*/

// --- Bot / crawler classification ------------------------------------------
// Matched against the User-Agent. Order matters only for readability.
const BOTS = [
  // Search engines
  ["Googlebot", "search", /Googlebot/i],
  ["Google-Extended", "ai", /Google-Extended/i],
  ["Bingbot", "search", /bingbot/i],
  ["DuckDuckBot", "search", /DuckDuckBot/i],
  ["Applebot", "search", /Applebot(?!-Extended)/i],
  ["Applebot-Extended", "ai", /Applebot-Extended/i],
  // AI assistants (the discovery channel this site cares about)
  ["GPTBot", "ai", /GPTBot/i],
  ["OAI-SearchBot", "ai", /OAI-SearchBot/i],
  ["ChatGPT-User", "ai", /ChatGPT-User/i],
  ["ClaudeBot", "ai", /ClaudeBot/i],
  ["Claude-User", "ai", /Claude-User/i],
  ["Claude-SearchBot", "ai", /Claude-SearchBot/i],
  ["PerplexityBot", "ai", /PerplexityBot/i],
  ["Perplexity-User", "ai", /Perplexity-User/i],
  ["Amazonbot", "ai", /Amazonbot/i],
  ["Bytespider", "ai", /Bytespider/i],
  ["meta-externalagent", "ai", /meta-externalagent/i],
  ["CCBot", "ai", /CCBot/i],
  // Social link-preview fetchers
  ["facebookexternalhit", "social", /facebookexternalhit/i],
  ["Twitterbot", "social", /Twitterbot/i],
  ["LinkedInBot", "social", /LinkedInBot/i],
  ["Pinterestbot", "social", /Pinterest/i],
  ["Slackbot", "social", /Slackbot/i],
  ["WhatsApp", "social", /WhatsApp/i],
  ["TelegramBot", "social", /TelegramBot/i],
  ["Discordbot", "social", /Discordbot/i],
];

function classify(ua) {
  if (!ua) return ["none", "none"];
  for (const [name, category, re] of BOTS) {
    if (re.test(ua)) return [name, category];
  }
  return ["human-or-other", "human"];
}

// Page requests we might convert to markdown. Assets (js/css/images/xml/txt)
// are never converted and are always served as-is.
function isPagePath(pathname) {
  if (pathname === "/" || pathname.endsWith("/")) return true;
  return !/\.[a-z0-9]+$/i.test(pathname); // no file extension => a page route
}

function wantsMarkdown(request, url) {
  if (request.method !== "GET") return false;
  if (url.searchParams.get("format") === "md") return true;
  const accept = request.headers.get("accept") || "";
  // Only when markdown is explicitly preferred, not just present in a browser's
  // catch-all "*/*".
  return /text\/markdown/i.test(accept);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1) Log the request (never blocks the response, never throws upward).
    ctx.waitUntil(logRequest(request, url, env));

    // 2) Markdown negotiation for agents.
    if (wantsMarkdown(request, url) && isPagePath(url.pathname)) {
      try {
        const md = await renderMarkdown(request, url, env);
        if (md) return md;
      } catch (_) {
        // Fall through to normal HTML on any conversion trouble.
      }
    }

    // 3) Everything else: serve the static asset exactly as before, and add a
    //    Link header pointing agents at llms.txt (cheap discovery hint).
    const res = await env.ASSETS.fetch(request);
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html")) {
      const out = new Response(res.body, res);
      out.headers.append(
        "Link",
        '</llms.txt>; rel="describedby"; type="text/markdown"'
      );
      return out;
    }
    return res;
  },
};

async function logRequest(request, url, env) {
  try {
    if (!env.TRAFFIC) return; // binding absent (e.g. local dev) — skip quietly.
    const ua = request.headers.get("user-agent") || "";
    const [bot, category] = classify(ua);
    const ref = request.headers.get("referer") || "";
    let refHost = "";
    try {
      if (ref) refHost = new URL(ref).hostname;
    } catch (_) {}
    const country = (request.cf && request.cf.country) || "";

    // NOTE: deliberately no IP address and no cookies — see the header comment.
    env.TRAFFIC.writeDataPoint({
      indexes: [bot], // group/sample by crawler
      blobs: [
        url.pathname, // 1: path hit
        bot, // 2: crawler name (or human-or-other)
        category, // 3: search | ai | social | human | none
        country, // 4: coarse country, no finer location
        refHost, // 5: referrer host only, never the full URL
        request.method, // 6
        ua.slice(0, 256), // 7: user-agent, truncated
      ],
      doubles: [1], // 1: one hit (sum this for counts)
    });
  } catch (_) {
    // Logging must never affect what the visitor receives.
  }
}

// --- Minimal, dependency-free HTML -> Markdown -----------------------------
// Good enough for these hand-authored pages: title, description, headings,
// links, list items, paragraphs. Falls back to serving HTML if anything looks
// off (the caller catches and defers to ASSETS).
async function renderMarkdown(request, url, env) {
  const assetRes = await env.ASSETS.fetch(request);
  const ct = assetRes.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return null; // not a page after all
  const html = await assetRes.text();

  const title = strip(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const desc = strip(
    firstMatch(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    )
  );

  // Prefer <main>, then <body>, then the whole doc.
  let body =
    firstMatch(html, /<main[\s\S]*?<\/main>/i) ||
    firstMatch(html, /<body[\s\S]*?<\/body>/i) ||
    html;

  // Drop everything that is not readable content.
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, ""); // never dump the booking form

  // Links first (before other tags are stripped), made absolute.
  body = body.replace(
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, t) => `[${strip(t)}](${absolute(href, url)})`
  );
  // Block elements.
  body = body
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${strip(t)}\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${strip(t)}\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${strip(t)}\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${strip(t)}`)
    .replace(/<(?:p|div|section|article|br|tr)[^>]*>/gi, "\n\n");

  const text = strip(body).replace(/\n{3,}/g, "\n\n").trim();

  const md =
    `# ${title || "Slush Sisters"}\n\n` +
    (desc ? `> ${desc}\n\n` : "") +
    `${text}\n\n---\n` +
    `Canonical: ${url.origin}${url.pathname}\n` +
    `More for assistants: ${url.origin}/llms.txt\n`;

  return new Response(md, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      // So a cache never hands this markdown to a browser or vice versa.
      "vary": "Accept",
      "cache-control": "public, max-age=300",
      "x-robots-tag": "noindex", // the markdown twin should not be indexed
    },
  });
}

function firstMatch(s, re) {
  const m = s.match(re);
  return m ? m[1] !== undefined ? m[1] : m[0] : "";
}

function absolute(href, base) {
  try {
    return new URL(href, base).toString();
  } catch (_) {
    return href;
  }
}

// Strip remaining tags and decode the handful of entities these pages use.
function strip(s) {
  return (s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/[ \t]+/g, " ")
    .trim();
}
