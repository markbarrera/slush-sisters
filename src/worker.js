/*
  Slush Sisters — edge Worker (one Worker, three jobs)
  ====================================================

  A site can only have one `main` Worker, so the three things that need to run
  in front of the static site live here together:

    1. LOG every request server-side to Analytics Engine — who fetched what,
       which crawler, what status, which country. Crawler visibility + a check
       on whether outside traffic leaks into the orphaned pages. (Binding
       currently paused in wrangler.jsonc until Analytics Engine is enabled.)

    2. MARKDOWN for agents — when an agent asks for markdown (Accept:
       text/markdown or ?format=md) a page returns a compact markdown version.

    3. BOOKING — POST /api/book validates a booking and emails it to the
       business inbox via Cloudflare Email Routing. Nothing is stored; the email
       is the record. (send_email binding paused in wrangler.jsonc until Email
       Routing is verified — see docs/booking-worker.md. Until then the handler
       reports "not configured" and the form at /book stays on its honest
       "not turned on" notice.)

  Everything else is handed straight back to the static assets, unchanged.

  COPPA note: the logging is server-side operational logging — NO cookies, NO
  IP, NO personal data — so it is safe even on game/orphan paths (unlike the
  PostHog beacon, which stays off them). The booking handler is the only place
  that touches personal data, and it only ever emails one verified inbox; it
  never stores anything.
*/

import { EmailMessage } from "cloudflare:email";

// --- Bot / crawler classification ------------------------------------------
const BOTS = [
  ["Googlebot", "search", /Googlebot/i],
  ["Google-Extended", "ai", /Google-Extended/i],
  ["Bingbot", "search", /bingbot/i],
  ["DuckDuckBot", "search", /DuckDuckBot/i],
  ["Applebot", "search", /Applebot(?!-Extended)/i],
  ["Applebot-Extended", "ai", /Applebot-Extended/i],
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
  for (const [name, category, re] of BOTS) if (re.test(ua)) return [name, category];
  return ["human-or-other", "human"];
}

function isPagePath(pathname) {
  if (pathname === "/" || pathname.endsWith("/")) return true;
  return !/\.[a-z0-9]+$/i.test(pathname);
}

function wantsMarkdown(request, url) {
  if (request.method !== "GET") return false;
  if (url.searchParams.get("format") === "md") return true;
  return /text\/markdown/i.test(request.headers.get("accept") || "");
}

// --- Booking config --------------------------------------------------------
// From must be on a domain with Email Routing enabled (slushsisters.com). To
// must match the send_email binding's destination_address in wrangler.jsonc —
// the binding refuses anything else, so this Worker can only email one inbox.
const SENDER = "bookings@slushsisters.com";
const SENDER_NAME = "Slush Sisters Bookings";
const RECIPIENT = "mark@markbarrera.com";
const MAX_BODY_BYTES = 16 * 1024;
const REQUIRED = ["name", "event_date", "tier", "address", "contact", "heard_from"];
const FIELDS = [
  ["name", "Name"],
  ["event_date", "Event date"],
  ["guest_count", "Guest count"],
  ["tier", "Recipe"],
  ["flavor_1", "Flavor 1"],
  ["flavor_2", "Flavor 2"],
  ["address", "Event address"],
  ["contact", "Phone or email"],
  ["heard_from", "Heard about us"],
  ["heard_from_detail", "…in their words"],
  ["notes", "Notes"],
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Canonical host: 301 www -> apex, preserving path + query. www is a
    // separate hostname routed to this Worker; the bare domain is canonical.
    if (url.hostname === "www.slushsisters.com") {
      url.hostname = "slushsisters.com";
      return Response.redirect(url.toString(), 301);
    }

    // Always log first (never blocks, never throws upward). No PII, no body.
    ctx.waitUntil(logRequest(request, url, env));

    // Job 3: booking endpoint.
    if (url.pathname === "/api/book") {
      return handleBooking(request, env);
    }

    // Job 4: dashboard data for /dashboard. Server-side so API tokens never
    // reach the browser; each returns a placeholder when its secret is unset.
    if (url.pathname === "/api/stats/traffic") return handleTrafficStats(env);
    if (url.pathname === "/api/stats/content") return handleContentStats(env);
    if (url.pathname === "/api/stats/search") return handleSearchStats(env);

    // Job 2: markdown negotiation for agents.
    if (wantsMarkdown(request, url) && isPagePath(url.pathname)) {
      try {
        const md = await renderMarkdown(request, url, env);
        if (md) return md;
      } catch (_) {
        // fall through to HTML
      }
    }

    // Default: serve the static asset, add a Link header pointing at llms.txt.
    const res = await env.ASSETS.fetch(request);
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html")) {
      const out = new Response(res.body, res);
      out.headers.append("Link", '</llms.txt>; rel="describedby"; type="text/markdown"');
      return out;
    }
    return res;
  },
};

// --- Job 3: booking --------------------------------------------------------
async function handleBooking(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }
  // send_email binding not wired yet (Email Routing not verified). Report it
  // honestly rather than pretending a booking was sent. The form at /book stays
  // on its "not turned on" notice until this is enabled, so this is a backstop.
  if (!env.BOOKING_EMAIL) {
    return json({ ok: false, error: "Booking email is not configured yet." }, 503);
  }

  let data;
  try {
    const buf = await request.arrayBuffer();
    if (buf.byteLength > MAX_BODY_BYTES) return json({ ok: false, error: "Request too large." }, 413);
    data = JSON.parse(new TextDecoder().decode(buf));
  } catch {
    return json({ ok: false, error: "Could not read your request." }, 400);
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return json({ ok: false, error: "Could not read your request." }, 400);
  }

  // Honeypot: real people leave the hidden `website` field empty. If filled,
  // accept quietly without emailing so the bot thinks it worked.
  if (field(data, "website")) return json({ ok: true });

  const missing = REQUIRED.filter((k) => !field(data, k));
  if (missing.length) return json({ ok: false, error: "Missing required fields.", missing }, 400);

  const contact = field(data, "contact");
  const raw = buildMime({
    fromName: SENDER_NAME,
    from: SENDER,
    to: RECIPIENT,
    replyTo: contact.includes("@") ? contact : "",
    subject: subjectLine(data),
    body: renderBooking(data),
  });

  try {
    await env.BOOKING_EMAIL.send(new EmailMessage(SENDER, RECIPIENT, raw));
  } catch (err) {
    console.error("booking email failed:", err && err.stack ? err.stack : err);
    return json({ ok: false, error: "Could not send your request. Please try again." }, 502);
  }
  return json({ ok: true });
}

function field(data, key) {
  const v = data[key];
  return v == null ? "" : String(v).trim();
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function subjectLine(data) {
  const name = field(data, "name");
  const date = field(data, "event_date");
  return `New booking — ${name}${date ? " — " + date : ""}`;
}

function renderBooking(data) {
  const lines = ["New booking request from slushsisters.com", ""];
  for (const [key, label] of FIELDS) {
    const val = field(data, key);
    if (val) lines.push(`${label}: ${val}`);
  }
  lines.push("", `Submitted: ${field(data, "submitted_at") || "(time not recorded)"}`, "");
  lines.push("Reply to this email to answer the customer, if they left an email address.");
  return lines.join("\n");
}

// Minimal, correct RFC 5322 / MIME message; UTF-8 base64 body so accents and
// "Piña Colada" survive; subject RFC 2047 encoded only when non-ASCII.
function buildMime({ fromName, from, to, replyTo, subject, body }) {
  const CRLF = "\r\n";
  const headers = [
    `From: ${fromName ? `${encodeHeaderWord(fromName)} <${from}>` : from}`,
    `To: ${to}`,
  ];
  if (replyTo) headers.push(`Reply-To: ${replyTo}`);
  headers.push(
    `Message-ID: <${crypto.randomUUID()}@slushsisters.com>`,
    `Date: ${new Date().toUTCString()}`,
    `Subject: ${encodeHeaderWord(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64"
  );
  const b64 = (base64Utf8(body).match(/.{1,76}/g) || [""]).join(CRLF);
  return headers.join(CRLF) + CRLF + CRLF + b64 + CRLF;
}

function encodeHeaderWord(s) {
  // eslint-disable-next-line no-control-regex
  if (/^[\x20-\x7E]*$/.test(s)) return s;
  return `=?utf-8?B?${base64Utf8(s)}?=`;
}

function base64Utf8(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// --- Job 1: logging --------------------------------------------------------
async function logRequest(request, url, env) {
  try {
    if (!env.TRAFFIC) return; // binding paused / local dev — skip quietly.
    const ua = request.headers.get("user-agent") || "";
    const [bot, category] = classify(ua);
    let refHost = "";
    try {
      const ref = request.headers.get("referer") || "";
      if (ref) refHost = new URL(ref).hostname;
    } catch (_) {}
    const country = (request.cf && request.cf.country) || "";
    // Deliberately no IP and no cookies.
    env.TRAFFIC.writeDataPoint({
      indexes: [bot],
      blobs: [url.pathname, bot, category, country, refHost, request.method, ua.slice(0, 256)],
      doubles: [1],
    });
  } catch (_) {
    // logging must never affect the response
  }
}

// --- Job 4: dashboard data -------------------------------------------------
// Read-only summaries for /dashboard. Tokens live as Worker secrets and never
// reach the browser. Every path returns 200 with a { status } field: a missing
// secret gives { status: "not_configured" }, an upstream failure gives
// { status: "error" } — never a thrown 500 — so the page degrades gracefully.
// The data is aggregate and non-personal (path counts, crawler names, referrer
// domains); if it should ever be private, gate these two routes behind a token.

const CF_ACCOUNT_ID_FALLBACK = "e1c0408b82c4364eb726c9c040aa85dd";

async function aeQuery(env, sql) {
  const account = env.CF_ACCOUNT_ID || CF_ACCOUNT_ID_FALLBACK;
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/analytics_engine/sql`,
    { method: "POST", headers: { Authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}` }, body: sql }
  );
  if (!res.ok) throw new Error(`AE HTTP ${res.status}`);
  return (await res.json()).data || [];
}

async function handleTrafficStats(env) {
  if (!env.CF_ANALYTICS_TOKEN) {
    return json({ status: "not_configured", need: "CF_ANALYTICS_TOKEN" });
  }
  // Human page requests only (exclude bots, assets, and API posts).
  const PAGE = "blob3 = 'human' AND blob6 = 'GET' AND blob1 NOT LIKE '%.%' AND blob1 NOT LIKE '/api/%'";
  const WIN = "timestamp > NOW() - INTERVAL '7' DAY";
  try {
    const [visits, crawlers, pages] = await Promise.all([
      aeQuery(env, `SELECT sum(_sample_interval) AS n FROM slush_traffic WHERE ${WIN} AND ${PAGE}`),
      aeQuery(env, `SELECT blob2 AS crawler, blob3 AS kind, sum(_sample_interval) AS n FROM slush_traffic WHERE ${WIN} AND blob3 IN ('search','ai','social') GROUP BY crawler, kind ORDER BY n DESC LIMIT 12`),
      aeQuery(env, `SELECT blob1 AS path, sum(_sample_interval) AS n FROM slush_traffic WHERE ${WIN} AND ${PAGE} GROUP BY path ORDER BY n DESC LIMIT 10`),
    ]);
    return json({
      status: "ok",
      window_days: 7,
      page_views: num(visits[0] && visits[0].n),
      crawlers: crawlers.map((r) => ({ name: r.crawler, kind: r.kind, hits: num(r.n) })),
      top_pages: pages.map((r) => ({ path: r.path, hits: num(r.n) })),
    });
  } catch (err) {
    return json({ status: "error", message: String((err && err.message) || err) });
  }
}

async function handleContentStats(env) {
  if (!env.POSTHOG_API_KEY || !env.POSTHOG_PROJECT_ID) {
    return json({ status: "not_configured", need: "POSTHOG_API_KEY + POSTHOG_PROJECT_ID" });
  }
  const host = env.POSTHOG_HOST || "https://us.posthog.com";
  async function hog(q) {
    const res = await fetch(`${host}/api/projects/${env.POSTHOG_PROJECT_ID}/query/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.POSTHOG_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query: q } }),
    });
    if (!res.ok) throw new Error(`PostHog HTTP ${res.status}`);
    return (await res.json()).results || [];
  }
  try {
    const [views, pages, refs] = await Promise.all([
      hog(`SELECT count() FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY`),
      hog(`SELECT properties.$pathname AS path, count() AS n FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY GROUP BY path ORDER BY n DESC LIMIT 10`),
      hog(`SELECT coalesce(nullIf(properties.$referring_domain, ''), 'direct / typed in') AS src, count() AS n FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY GROUP BY src ORDER BY n DESC LIMIT 8`),
    ]);
    return json({
      status: "ok",
      window_days: 7,
      pageviews: num(views[0] && views[0][0]),
      top_pages: pages.map((r) => ({ path: r[0], views: num(r[1]) })),
      sources: refs.map((r) => ({ source: r[0], views: num(r[1]) })),
    });
  } catch (err) {
    return json({ status: "error", message: String((err && err.message) || err) });
  }
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

// Search Console (top queries) via a service account. Needs GSC_SA_EMAIL +
// GSC_SA_KEY (the PEM private key) as Worker secrets, and the service account
// added as a read-only user on the property. GSC_SITE defaults to the domain.
async function handleSearchStats(env) {
  if (!env.GSC_SA_EMAIL || !env.GSC_SA_KEY) {
    return json({ status: "not_configured", need: "GSC_SA_EMAIL + GSC_SA_KEY" });
  }
  try {
    const token = await gscAccessToken(env);
    const site = env.GSC_SITE || "sc-domain:slushsisters.com";
    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: isoDaysAgo(28),
          endDate: isoDaysAgo(1),
          dimensions: ["query"],
          rowLimit: 12,
        }),
      }
    );
    if (!res.ok) throw new Error(`GSC HTTP ${res.status}`);
    const out = await res.json();
    const queries = (out.rows || []).map((r) => ({
      query: (r.keys && r.keys[0]) || "",
      clicks: num(r.clicks),
      impressions: num(r.impressions),
    }));
    return json({ status: "ok", window_days: 28, queries });
  } catch (err) {
    return json({ status: "error", message: String((err && err.message) || err) });
  }
}

async function gscAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const enc = (o) => gscB64url(new TextEncoder().encode(JSON.stringify(o)));
  const signingInput =
    enc({ alg: "RS256", typ: "JWT" }) +
    "." +
    enc({
      iss: env.GSC_SA_EMAIL,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    });
  const key = await importPkcs8(env.GSC_SA_KEY);
  const sig = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(signingInput)
  );
  const jwt = signingInput + "." + gscB64url(new Uint8Array(sig));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" +
      encodeURIComponent(jwt),
  });
  if (!res.ok) throw new Error(`GSC token HTTP ${res.status}`);
  return (await res.json()).access_token;
}

function gscB64url(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importPkcs8(pem) {
  const body = pem
    .replace(/-----BEGIN[^-]+-----/, "")
    .replace(/-----END[^-]+-----/, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    der.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function isoDaysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}

// --- Job 2: minimal HTML -> Markdown ---------------------------------------
async function renderMarkdown(request, url, env) {
  const assetRes = await env.ASSETS.fetch(request);
  const ct = assetRes.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return null;
  const html = await assetRes.text();

  const title = strip(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const desc = strip(
    firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
  );

  let body =
    firstMatch(html, /<main[\s\S]*?<\/main>/i) ||
    firstMatch(html, /<body[\s\S]*?<\/body>/i) ||
    html;

  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "");

  body = body.replace(
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, t) => `[${strip(t)}](${absolute(href, url)})`
  );
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
      "vary": "Accept",
      "cache-control": "public, max-age=300",
      "x-robots-tag": "noindex",
    },
  });
}

function firstMatch(s, re) {
  const m = s.match(re);
  return m ? (m[1] !== undefined ? m[1] : m[0]) : "";
}

function absolute(href, base) {
  try {
    return new URL(href, base).toString();
  } catch (_) {
    return href;
  }
}

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
