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
  ["AhrefsBot", "scraper", /AhrefsBot/i],
  ["SEMrushBot", "scraper", /SemrushBot/i],
  ["MJ12bot", "scraper", /MJ12bot/i],
  ["DotBot", "scraper", /DotBot/i],
  ["YandexBot", "search", /YandexBot/i],
  ["Baiduspider", "search", /Baiduspider/i],
  ["python-requests", "scraper", /python-requests/i],
  ["curl", "scraper", /\bcurl\//i],
  ["Go-http-client", "scraper", /Go-http-client/i],
  ["wget", "scraper", /\bWget\//i],
  ["Scrapy", "scraper", /Scrapy/i],
  ["Java", "scraper", /\bJava\/\d/i],
  ["Headless browser", "scraper", /HeadlessChrome|PhantomJS|Puppeteer/i],
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

    // Job 4: dashboard data for /dashboard. Server-side so API tokens never
    // reach the browser; each returns a placeholder when its secret is unset.
    if (url.pathname === "/api/stats/traffic") return handleTrafficStats(env);
    if (url.pathname === "/api/stats/content") return handleContentStats(env);
    if (url.pathname === "/api/stats/search") return handleSearchStats(env);
    if (url.pathname === "/api/stats/games") return handleGameStats(env);

    // Game telemetry beacon — lightweight, first-party, no cookies, no PII.
    if (url.pathname === "/api/game-event" && request.method === "POST") {
      return handleGameEvent(request, env);
    }

    // Short links: /go/fb → /?utm_source=facebook&utm_medium=social etc.
    // Memorable URLs for the girls to paste into Facebook groups, Instagram
    // bios, text messages, QR codes. Each 301s with UTM params so the
    // dashboard can show which sharing channels actually drive traffic.
    if (url.pathname.startsWith("/go/")) {
      return handleGoRedirect(url);
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
      out.headers.append("Link", '</llms.txt>; rel="describedby"; type="text/markdown", </llms-full.txt>; rel="describedby"; type="text/markdown"');
      out.headers.set("Content-Signal", "search=yes, ai-input=yes, ai-train=yes");
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
    body: renderBooking(data, request, env),
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

function renderBooking(data, request, env) {
  const lines = ["New booking request from slushsisters.com", ""];
  for (const [key, label] of FIELDS) {
    const val = field(data, key);
    if (val) lines.push(`${label}: ${val}`);
  }
  lines.push("", `Submitted: ${field(data, "submitted_at") || "(time not recorded)"}`);

  // --- How this booking reached us (attribution) ---------------------------
  // First-party marketing context, plus coarse location Cloudflare derives from
  // the IP. The raw IP is NOT included or stored — only city/region/country.
  const attr = [];
  const src = (data && typeof data._source === "object" && data._source) || {};
  const cap = (v, n) => String(v == null ? "" : v).slice(0, n);
  if (src.referrer) attr.push(`Came from: ${cap(src.referrer, 300)}`);
  const utm = [src.utm_source, src.utm_medium, src.utm_campaign].filter(Boolean).map((s) => cap(s, 120));
  if (utm.length) attr.push(`Campaign: ${utm.join(" / ")}`);
  if (src.landing) attr.push(`Landed on: ${cap(src.landing, 200)}`);
  if (Array.isArray(src.pages) && src.pages.length) {
    attr.push(`Pages this visit (${src.pages.length}): ${src.pages.map((p) => cap(p, 80)).join(" -> ").slice(0, 1200)}`);
  }
  if (src.started) attr.push(`Visit started: ${cap(src.started, 40)}`);
  const cf = (request && request.cf) || {};
  const loc = [cf.city, cf.region, cf.country].filter(Boolean).join(", ");
  if (loc) attr.push(`Approx. location (from Cloudflare, no IP stored): ${cap(loc, 120)}`);
  if (cf.timezone) attr.push(`Timezone: ${cap(cf.timezone, 60)}`);
  const ua = request && request.headers && request.headers.get("user-agent");
  if (ua) attr.push(`Device: ${cap(ua, 256)}`);
  const sid = field(data, "_ph_session");
  const pid = env && env.POSTHOG_PROJECT_ID;
  if (sid && pid) {
    attr.push(`Watch their visit (masked recording): https://us.posthog.com/project/${pid}/replay/${cap(sid, 80)}`);
  }
  if (attr.length) lines.push("", "— How this booking reached us —", ...attr);

  lines.push("", "Reply to this email to answer the customer, if they left an email address.");
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
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AE HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()).data || [];
}

async function handleTrafficStats(env) {
  if (!env.CF_ANALYTICS_TOKEN) {
    return json({ status: "not_configured", need: "CF_ANALYTICS_TOKEN" });
  }
  const PAGE = "blob6 = 'GET' AND blob1 NOT LIKE '%.%' AND blob1 NOT LIKE '/api/%'";
  const WIN = "timestamp > NOW() - INTERVAL '7' DAY";
  try {
    const [humanViews, allReqs, crawlers, split] = await Promise.all([
      aeQuery(env, `SELECT sum(_sample_interval) AS n FROM slush_traffic WHERE ${WIN} AND ${PAGE} AND blob3 = 'human'`),
      aeQuery(env, `SELECT sum(_sample_interval) AS n FROM slush_traffic WHERE ${WIN} AND ${PAGE}`),
      aeQuery(env, `SELECT blob2 AS crawler, blob3 AS kind, sum(_sample_interval) AS n FROM slush_traffic WHERE ${WIN} AND blob3 IN ('search','ai','social','scraper') GROUP BY crawler, kind ORDER BY n DESC LIMIT 20`),
      aeQuery(env, `SELECT blob3 AS category, sum(_sample_interval) AS n FROM slush_traffic WHERE ${WIN} AND ${PAGE} GROUP BY category ORDER BY n DESC`),
    ]);
    return json({
      status: "ok",
      window_days: 7,
      page_views: num(humanViews[0] && humanViews[0].n),
      total_page_requests: num(allReqs[0] && allReqs[0].n),
      crawlers: crawlers.map((r) => ({ name: r.crawler, kind: r.kind, hits: num(r.n) })),
      traffic_split: split.map((r) => ({ category: r.category, requests: num(r.n) })),
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
  const WIN = "timestamp > now() - INTERVAL 7 DAY";
  const PV = "event = '$pageview' AND " + WIN;
  try {
    const [overview, pages, refs, devices, clicks, scroll, funnelBook, funnelSubmit, geo, exits, entryPages, newVsReturn, outbound, duration, utmSources, utmMediums, utmCampaigns] = await Promise.all([
      hog("SELECT count() AS pv, count(DISTINCT distinct_id) AS vis, count(DISTINCT \"$session_id\") AS sess FROM events WHERE " + PV),
      hog("SELECT properties.$pathname AS p, count() AS n FROM events WHERE " + PV + " GROUP BY p ORDER BY n DESC LIMIT 10"),
      hog("SELECT coalesce(nullIf(properties.$referring_domain, ''), 'direct / typed in') AS src, count() AS n FROM events WHERE " + PV + " GROUP BY src ORDER BY n DESC LIMIT 8"),
      hog("SELECT properties.$device_type AS d, count(DISTINCT distinct_id) AS n FROM events WHERE " + PV + " GROUP BY d ORDER BY n DESC"),
      hog("SELECT CASE WHEN elements_chain LIKE '%nav%' THEN 'nav' WHEN elements_chain LIKE '%footer%' THEN 'footer' ELSE 'content' END AS loc, properties.$el_text AS t, count() AS n FROM events WHERE event = '$autocapture' AND properties.$event_type = 'click' AND " + WIN + " AND properties.$el_text != '' AND length(properties.$el_text) > 1 GROUP BY loc, t ORDER BY n DESC LIMIT 20"),
      hog("SELECT properties.$prev_pageview_pathname AS p, avg(toFloat64OrNull(toString(properties.$prev_pageview_max_scroll_percentage))) AS s FROM events WHERE event = '$pageleave' AND " + WIN + " AND properties.$prev_pageview_pathname IS NOT NULL GROUP BY p ORDER BY s ASC LIMIT 10"),
      hog("SELECT count(DISTINCT \"$session_id\") AS n FROM events WHERE " + PV + " AND properties.$pathname IN ('/book', '/book.html')"),
      hog("SELECT count() AS n FROM events WHERE event = 'booking_submitted' AND " + WIN),
      hog("SELECT properties.$geoip_city_name AS city, properties.$geoip_subdivision_1_name AS region, count(DISTINCT distinct_id) AS n FROM events WHERE " + PV + " AND properties.$geoip_city_name IS NOT NULL AND properties.$geoip_city_name != '' GROUP BY city, region ORDER BY n DESC LIMIT 10"),
      hog("SELECT properties.$prev_pageview_pathname AS p, count() AS n FROM events WHERE event = '$pageleave' AND " + WIN + " AND properties.$prev_pageview_pathname IS NOT NULL GROUP BY p ORDER BY n DESC LIMIT 8"),
      hog("SELECT properties.$pathname AS p, count(DISTINCT \"$session_id\") AS n FROM events WHERE " + PV + " AND properties.$is_initial_page_view = true GROUP BY p ORDER BY n DESC LIMIT 8"),
      hog("SELECT CASE WHEN count() > 1 THEN 'returning' ELSE 'new' END AS kind, count(DISTINCT sub.did) AS n FROM (SELECT distinct_id AS did, count(DISTINCT toDate(timestamp)) AS day_count FROM events WHERE " + PV + " GROUP BY did HAVING day_count >= 1) AS sub GROUP BY CASE WHEN sub.day_count > 1 THEN 'returning' ELSE 'new' END"),
      hog("SELECT properties.$external_click_url AS url, count() AS n FROM events WHERE event = '$autocapture' AND " + WIN + " AND properties.$external_click_url IS NOT NULL AND properties.$external_click_url != '' GROUP BY url ORDER BY n DESC LIMIT 8"),
      hog("SELECT avg(dateDiff('second', min_ts, max_ts)) AS avg_sec FROM (SELECT \"$session_id\" AS sid, min(timestamp) AS min_ts, max(timestamp) AS max_ts FROM events WHERE " + PV + " GROUP BY sid HAVING sid IS NOT NULL AND sid != '')"),
      hog("SELECT properties.$utm_source AS src, count() AS n, count(DISTINCT distinct_id) AS vis FROM events WHERE " + PV + " AND properties.$utm_source IS NOT NULL AND properties.$utm_source != '' GROUP BY src ORDER BY n DESC LIMIT 10"),
      hog("SELECT properties.$utm_medium AS med, count() AS n, count(DISTINCT distinct_id) AS vis FROM events WHERE " + PV + " AND properties.$utm_medium IS NOT NULL AND properties.$utm_medium != '' GROUP BY med ORDER BY n DESC LIMIT 10"),
      hog("SELECT properties.$utm_campaign AS cam, count() AS n, count(DISTINCT distinct_id) AS vis FROM events WHERE " + PV + " AND properties.$utm_campaign IS NOT NULL AND properties.$utm_campaign != '' GROUP BY cam ORDER BY n DESC LIMIT 10"),
    ]);
    const scrollPct = (v) => { const n = Number(v) || 0; return n <= 1 ? Math.round(n * 100) : Math.round(n); };
    const avgDur = num(duration[0] && duration[0][0]);
    const durMin = Math.floor(avgDur / 60);
    const durSec = avgDur % 60;
    return json({
      status: "ok",
      window_days: 7,
      visitors: num(overview[0] && overview[0][1]),
      pageviews: num(overview[0] && overview[0][0]),
      sessions: num(overview[0] && overview[0][2]),
      top_pages: pages.map((r) => ({ path: r[0], views: num(r[1]) })),
      sources: refs.map((r) => ({ source: r[0], views: num(r[1]) })),
      devices: devices.map((r) => ({ type: r[0] || "Unknown", visitors: num(r[1]) })),
      clicks: clicks.map((r) => ({ location: r[0], label: r[1], count: num(r[2]) })),
      scroll: scroll.map((r) => ({ path: r[0], pct: scrollPct(r[1]) })),
      funnel: {
        all_sessions: num(overview[0] && overview[0][2]),
        viewed_book: num(funnelBook[0] && funnelBook[0][0]),
        submitted: num(funnelSubmit[0] && funnelSubmit[0][0]),
      },
      geo: geo.map((r) => ({ city: r[0], region: r[1], visitors: num(r[2]) })),
      exits: exits.map((r) => ({ path: r[0], count: num(r[1]) })),
      entry_pages: entryPages.map((r) => ({ path: r[0], sessions: num(r[1]) })),
      new_vs_returning: newVsReturn.map((r) => ({ kind: r[0], visitors: num(r[1]) })),
      outbound_clicks: outbound.map((r) => ({ url: r[0], count: num(r[1]) })),
      avg_session_duration: durMin > 0 ? durMin + "m " + durSec + "s" : durSec + "s",
      utm_sources: utmSources.map((r) => ({ source: r[0], views: num(r[1]), visitors: num(r[2]) })),
      utm_mediums: utmMediums.map((r) => ({ medium: r[0], views: num(r[1]), visitors: num(r[2]) })),
      utm_campaigns: utmCampaigns.map((r) => ({ campaign: r[0], views: num(r[1]), visitors: num(r[2]) })),
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

// --- Short links (/go/) -------------------------------------------------------
// A map of slug → { path, source, medium, campaign? }. Each redirects to
// the path with UTM params appended, so the girls type slushsisters.com/go/fb
// and the traffic shows up attributed in the dashboard.

// Source channels — each slug maps to the UTM source/medium pair.
// A plain /go/fb link uses the channel's default path (usually /).
// A compound /go/fb/book link keeps the same attribution but lands
// on /book instead, so one set of slugs works for every page.
const GO_CHANNELS = {
  fb:        { path: "/", source: "facebook", medium: "social" },
  ig:        { path: "/", source: "instagram", medium: "social" },
  nd:        { path: "/", source: "nextdoor", medium: "social" },
  tiktok:    { path: "/", source: "tiktok", medium: "social" },
  text:      { path: "/", source: "text", medium: "direct" },
  email:     { path: "/", source: "email", medium: "email" },
  flyer:     { path: "/", source: "flyer", medium: "print" },
  qr:        { path: "/", source: "qr", medium: "print" },
  party:     { path: "/play", source: "party-table", medium: "qr" },
  book:      { path: "/book", source: "share", medium: "direct" },
  flavors:   { path: "/flavors", source: "share", medium: "direct" },
  austin:    { path: "/margarita-machine-rental-austin", source: "share", medium: "direct" },
};

function handleGoRedirect(url) {
  const after = url.pathname.slice(4).toLowerCase().replace(/\/$/, "");
  const slashIdx = after.indexOf("/");
  const slug = slashIdx === -1 ? after : after.slice(0, slashIdx);
  const pagePath = slashIdx === -1 ? null : "/" + after.slice(slashIdx + 1);

  const channel = GO_CHANNELS[slug];
  if (!channel) {
    return new Response("Not found", { status: 404 });
  }
  const dest = new URL(url.origin + (pagePath || channel.path));
  dest.searchParams.set("utm_source", channel.source);
  dest.searchParams.set("utm_medium", channel.medium);
  const campaign = channel.campaign || url.searchParams.get("utm_campaign");
  if (campaign) dest.searchParams.set("utm_campaign", campaign);
  return Response.redirect(dest.toString(), 301);
}

// --- Game telemetry -----------------------------------------------------------
// Lightweight, first-party, fire-and-forget. Games send a tiny JSON beacon via
// sendBeacon; the Worker writes one AE row per event. No cookies, no PII,
// no third-party scripts on the game page. Easy to remove: delete this handler,
// the route, and the track() snippet from each game HTML.

const GAME_EVENTS = new Set([
  "start", "end", "serve", "round", "level_start", "level_finish",
  "give", "pose", "surprise", "tap", "race_start", "race_end",
]);
const GAME_NAMES = new Set([
  "catch", "rush", "playhouse", "style", "street", "guys",
]);

async function handleGameEvent(request, env) {
  try {
    const body = await request.json();
    const game = String(body.game || "").slice(0, 20);
    const evt = String(body.event || "").slice(0, 20);
    if (!GAME_NAMES.has(game) || !GAME_EVENTS.has(evt)) {
      return json({ ok: false }, 400);
    }
    const score = Number(body.score) || 0;
    const dur = Number(body.dur) || 0;
    const detail = String(body.detail || "").slice(0, 60);
    if (env.TRAFFIC) {
      env.TRAFFIC.writeDataPoint({
        indexes: ["game"],
        blobs: [game, evt, detail, "", "", "POST", ""],
        doubles: [score, dur],
      });
    }
    return json({ ok: true });
  } catch (_) {
    return json({ ok: false }, 400);
  }
}

async function handleGameStats(env) {
  if (!env.CF_ANALYTICS_TOKEN) {
    return json({ status: "not_configured", need: "CF_ANALYTICS_TOKEN" });
  }
  try {
    const sql = (q) => aeQuery(env, q);
    const [plays, scores, popularity, hourly] = await Promise.all([
      sql("SELECT blob1 AS game, blob2 AS evt, count() AS n FROM slush_traffic WHERE index1 = 'game' AND timestamp > NOW() - INTERVAL '7' DAY AND blob2 IN ('start','end') GROUP BY game, evt ORDER BY game, evt"),
      sql("SELECT blob1 AS game, max(double1) AS best, avg(double1) AS avg_score, avg(double2) AS avg_dur FROM slush_traffic WHERE index1 = 'game' AND blob2 = 'end' AND timestamp > NOW() - INTERVAL '7' DAY GROUP BY game ORDER BY game"),
      sql("SELECT blob1 AS game, count() AS n FROM slush_traffic WHERE index1 = 'game' AND blob2 = 'start' AND timestamp > NOW() - INTERVAL '7' DAY GROUP BY game ORDER BY n DESC"),
      sql("SELECT toHour(timestamp) AS hr, count() AS n FROM slush_traffic WHERE index1 = 'game' AND blob2 = 'start' AND timestamp > NOW() - INTERVAL '7' DAY GROUP BY hr ORDER BY hr"),
    ]);
    return json({
      status: "ok",
      window_days: 7,
      plays: plays.map((r) => ({ game: r[0], event: r[1], count: num(r[2]) })),
      scores: scores.map((r) => ({ game: r[0], best: num(r[1]), avg: num(r[2]), avg_dur_sec: num(r[3]) })),
      popularity: popularity.map((r) => ({ game: r[0], starts: num(r[1]) })),
      hourly: hourly.map((r) => ({ hour: num(r[0]), starts: num(r[1]) })),
    });
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
    .replace(/\\n/g, "\n") // Google's JSON key stores newlines as literal \n
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
    `More for assistants: ${url.origin}/llms.txt\n` +
    `Full site content: ${url.origin}/llms-full.txt\n`;

  return new Response(md, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "vary": "Accept",
      "cache-control": "public, max-age=300",
      "x-robots-tag": "noindex",
      "content-signal": "search=yes, ai-input=yes, ai-train=yes",
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
