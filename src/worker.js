/*
  Slush Sisters — edge Worker (one Worker, four jobs)
  ===================================================

  A site can only have one `main` Worker, so the four things that need to run
  in front of the static site live here together:

    1. LOG every request server-side to Analytics Engine — who fetched what,
       which crawler, what status, which country. Crawler visibility + a check
       on whether outside traffic leaks into the orphaned pages.

    2. MARKDOWN for agents — when an agent asks for markdown (Accept:
       text/markdown or ?format=md) a page returns a compact markdown version.

    3. BOOKING — POST /api/book validates a booking, emails it to the business
       inbox via Cloudflare Email Routing, and writes it to D1 so the Cockpit
       and /ledger have it from day one.

    4. COCKPIT + LEDGER API — read/write endpoints for the business dashboard:
       list/update bookings, add costs, add learnings, get ledger totals and
       jar balances. All backed by the slush_business D1 database.

  Everything else is handed straight back to the static assets, unchanged.

  COPPA note: the logging is server-side operational logging — NO cookies, NO
  IP, NO personal data — so it is safe even on game/orphan paths.
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
  ["booking_ref", "Booking ref"],
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
      return handleBooking(request, env, ctx);
    }

    // Job 4: Cockpit + Ledger API.
    if (url.pathname.startsWith("/api/")) {
      const apiRes = await handleAPI(request, url, env);
      if (apiRes) return apiRes;
    }

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
async function handleBooking(request, env, ctx) {
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

  // Write the booking to D1 alongside the email, so the Cockpit and /ledger
  // have it from day one. Non-blocking: the customer already has their
  // confirmation, so a D1 hiccup must never surface as a booking failure.
  ctx.waitUntil(saveBookingToD1(data, env));

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

// --- Job 3b: D1 persistence ------------------------------------------------
async function saveBookingToD1(data, env) {
  if (!env.DB) return;
  try {
    const ref = field(data, "booking_ref") || "bk_" + Date.now().toString(36);
    const tier = field(data, "tier");
    const priceCents = tier === "Fresh Press" ? 37500 : 25000;
    await env.DB.prepare(
      `INSERT OR IGNORE INTO bookings
         (ref, created_at, status, name, address, contact,
          event_date, tier, flavor_1, flavor_2, guest_count, notes,
          heard_from, heard_from_detail, utm_source, utm_campaign,
          price_cents, paid_cents)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)`
    ).bind(
      ref,
      field(data, "submitted_at") || new Date().toISOString(),
      "new",
      field(data, "name"),
      field(data, "address"),
      field(data, "contact"),
      field(data, "event_date"),
      tier,
      field(data, "flavor_1"),
      field(data, "flavor_2"),
      parseInt(field(data, "guest_count"), 10) || null,
      field(data, "notes"),
      field(data, "heard_from"),
      field(data, "heard_from_detail"),
      field(data, "utm_source"),
      field(data, "utm_campaign"),
      priceCents
    ).run();
  } catch (err) {
    console.error("D1 booking insert failed:", err && err.stack ? err.stack : err);
  }
}

// --- Job 4: Cockpit + Ledger API -------------------------------------------
// Read-only APIs that the future Cockpit page and auto-generated /ledger will
// call. All responses are JSON with CORS restricted to the same origin (the
// Worker serves both the API and the pages, so same-origin fetch just works).

async function handleAPI(request, url, env) {
  if (!env.DB) return json({ ok: false, error: "Database not configured." }, 503);

  // GET /api/bookings — list bookings (Cockpit)
  if (url.pathname === "/api/bookings" && request.method === "GET") {
    const status = url.searchParams.get("status");
    let q = "SELECT ref, created_at, status, name, event_date, tier, flavor_1, flavor_2, guest_count, heard_from, price_cents, paid_cents, delivered_at FROM bookings";
    const params = [];
    if (status) { q += " WHERE status = ?"; params.push(status); }
    q += " ORDER BY created_at DESC LIMIT 200";
    const { results } = await env.DB.prepare(q).bind(...params).all();
    return json({ ok: true, bookings: results });
  }

  // GET /api/bookings/:ref — single booking with its costs
  if (url.pathname.startsWith("/api/bookings/") && request.method === "GET") {
    const ref = url.pathname.split("/")[3];
    if (!ref) return json({ ok: false, error: "Missing ref." }, 400);
    const booking = await env.DB.prepare(
      "SELECT * FROM bookings WHERE ref = ?"
    ).bind(ref).first();
    if (!booking) return json({ ok: false, error: "Not found." }, 404);
    const { results: costs } = await env.DB.prepare(
      "SELECT * FROM costs WHERE booking_ref = ? ORDER BY created_at"
    ).bind(ref).all();
    const { results: learnings } = await env.DB.prepare(
      "SELECT * FROM learnings WHERE booking_ref = ? ORDER BY created_at"
    ).bind(ref).all();
    return json({ ok: true, booking, costs, learnings });
  }

  // PATCH /api/bookings/:ref — update booking status/paid
  if (url.pathname.startsWith("/api/bookings/") && request.method === "PATCH") {
    const ref = url.pathname.split("/")[3];
    if (!ref) return json({ ok: false, error: "Missing ref." }, 400);
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "Bad JSON." }, 400); }
    const allowed = ["status", "paid_cents", "delivered_at", "price_cents"];
    const sets = [], vals = [];
    for (const k of allowed) {
      if (body[k] !== undefined) { sets.push(`${k} = ?`); vals.push(body[k]); }
    }
    if (!sets.length) return json({ ok: false, error: "Nothing to update." }, 400);
    vals.push(ref);
    await env.DB.prepare(`UPDATE bookings SET ${sets.join(", ")} WHERE ref = ?`).bind(...vals).run();
    return json({ ok: true });
  }

  // POST /api/costs — add a cost line
  if (url.pathname === "/api/costs" && request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "Bad JSON." }, 400); }
    const cat = (body.category || "").trim();
    const amt = parseInt(body.amount_cents, 10);
    if (!cat || isNaN(amt)) return json({ ok: false, error: "category and amount_cents required." }, 400);
    await env.DB.prepare(
      `INSERT INTO costs (booking_ref, created_at, category, label, amount_cents, is_estimate, note)
       VALUES (?,?,?,?,?,?,?)`
    ).bind(
      body.booking_ref || null,
      new Date().toISOString(),
      cat,
      body.label || null,
      amt,
      body.is_estimate ? 1 : 0,
      body.note || null
    ).run();
    return json({ ok: true });
  }

  // POST /api/learnings — add a learning
  if (url.pathname === "/api/learnings" && request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "Bad JSON." }, 400); }
    const text = (body.body || "").trim();
    if (!text) return json({ ok: false, error: "body is required." }, 400);
    await env.DB.prepare(
      `INSERT INTO learnings (created_at, booking_ref, body, tag) VALUES (?,?,?,?)`
    ).bind(new Date().toISOString(), body.booking_ref || null, text, body.tag || null).run();
    return json({ ok: true });
  }

  // GET /api/ledger — the numbers the public /ledger page needs
  if (url.pathname === "/api/ledger" && request.method === "GET") {
    const totals = await env.DB.prepare(`
      SELECT
        COUNT(*) AS parties,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN paid_cents ELSE 0 END), 0) AS revenue_cents,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN price_cents ELSE 0 END), 0) AS billed_cents
      FROM bookings WHERE status != 'canceled'
    `).first();
    const { results: costRows } = await env.DB.prepare(`
      SELECT category, COALESCE(SUM(amount_cents), 0) AS total_cents, MAX(is_estimate) AS has_estimates
      FROM costs GROUP BY category ORDER BY total_cents DESC
    `).all();
    const totalCostCents = costRows.reduce((s, r) => s + r.total_cents, 0);
    const { results: jarRows } = await env.DB.prepare(`
      SELECT jar, COALESCE(SUM(amount_cents), 0) AS balance_cents
      FROM jar_entries GROUP BY jar
    `).all();
    const settings = {};
    const { results: settingRows } = await env.DB.prepare(
      "SELECT key, value FROM settings"
    ).all();
    for (const r of settingRows) settings[r.key] = r.value;
    return json({
      ok: true,
      parties: totals.parties,
      revenue_cents: totals.revenue_cents,
      billed_cents: totals.billed_cents,
      cost_cents: totalCostCents,
      profit_cents: totals.revenue_cents - totalCostCents,
      costs_by_category: costRows,
      jars: jarRows,
      settings
    });
  }

  // GET /api/settings — all settings
  if (url.pathname === "/api/settings" && request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT key, value FROM settings").all();
    const obj = {};
    for (const r of results) obj[r.key] = r.value;
    return json({ ok: true, settings: obj });
  }

  return null;
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
