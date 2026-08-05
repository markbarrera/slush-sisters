// ---------------------------------------------------------------------------
// Booking endpoint — POST /api/book
//
// The booking form (public/book.html) POSTs its fields here as JSON. This
// Worker emails each request to the business inbox and returns { ok: true }.
// Nothing is stored anywhere: the email IS the record. This is the only code
// on the site that runs server-side; every other path is static HTML served
// straight from public/ (see wrangler.jsonc — run_worker_first is scoped to
// /api/* so nothing else touches this Worker).
//
// Why email a verified Email Routing destination, rather than a database or a
// third-party form service: sending to an address you have verified in
// Cloudflare Email Routing is free on any plan, needs no paid Email Sending and
// no DKIM domain onboarding, and keeps every customer's home address and phone
// inside Mark's own Cloudflare account and inbox — no outside company ever holds
// a child's party address. See docs/booking-worker.md for the full setup.
// ---------------------------------------------------------------------------

import { EmailMessage } from "cloudflare:email";

// The From address must be on a domain that has Email Routing enabled
// (slushsisters.com). The To must match the send_email binding's
// destination_address in wrangler.jsonc — the binding will refuse anything else,
// which is a deliberate safety net: this Worker can only ever email one inbox.
const SENDER = "bookings@slushsisters.com";
const SENDER_NAME = "Slush Sisters Bookings";
const RECIPIENT = "mark@markbarrera.com";

// A booking is a few hundred bytes. Anything much larger is abuse or a mistake.
const MAX_BODY_BYTES = 16 * 1024;

// The fields the form marks required. Checked again here — a form can be
// bypassed, the server cannot.
const REQUIRED = ["name", "event_date", "tier", "address", "contact", "heard_from"];

// Every field the form can send, in the order they should read in the email.
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
  async fetch(request, env) {
    const url = new URL(request.url);

    // Backstop: only the booking endpoint is ours. run_worker_first already
    // scopes us to /api/*, but if anything else reaches here, hand it back to
    // the static site rather than 404-ing a real page.
    if (url.pathname !== "/api/book") {
      return env.ASSETS ? env.ASSETS.fetch(request) : notFound();
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed." }, 405);
    }

    // Read and parse the body, guarding its size.
    let data;
    try {
      const buf = await request.arrayBuffer();
      if (buf.byteLength > MAX_BODY_BYTES) {
        return json({ ok: false, error: "Request too large." }, 413);
      }
      data = JSON.parse(new TextDecoder().decode(buf));
    } catch {
      return json({ ok: false, error: "Could not read your request." }, 400);
    }
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return json({ ok: false, error: "Could not read your request." }, 400);
    }

    // Honeypot: real people leave the hidden `website` field empty. If it is
    // filled, a bot did it — accept quietly without emailing so the bot thinks
    // it worked and moves on.
    if (field(data, "website")) {
      return json({ ok: true });
    }

    // Required-field check.
    const missing = REQUIRED.filter((k) => !field(data, k));
    if (missing.length) {
      return json({ ok: false, error: "Missing required fields.", missing }, 400);
    }

    // Build the notification email. If the customer gave an email as their
    // contact, set Reply-To so Mark can answer them straight from his inbox.
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
      // Never fake success. The form shows the customer that nothing was sent,
      // so their date is not held and they know to try again or call.
      console.error("booking email failed:", err && err.stack ? err.stack : err);
      return json({ ok: false, error: "Could not send your request. Please try again." }, 502);
    }

    return json({ ok: true });
  },
};

// ---- helpers --------------------------------------------------------------

// Trimmed string value of a field, or "" for anything missing/blank.
function field(data, key) {
  const v = data[key];
  if (v == null) return "";
  return String(v).trim();
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function notFound() {
  return new Response("Not found", { status: 404 });
}

function subjectLine(data) {
  const name = field(data, "name");
  const date = field(data, "event_date");
  return `New booking — ${name}${date ? " — " + date : ""}`;
}

// Turn the submitted fields into a readable, ordered plain-text email body.
function renderBooking(data) {
  const lines = ["New booking request from slushsisters.com", ""];
  for (const [key, label] of FIELDS) {
    const val = field(data, key);
    if (val) lines.push(`${label}: ${val}`);
  }
  lines.push("");
  lines.push(`Submitted: ${field(data, "submitted_at") || "(time not recorded)"}`);
  lines.push("");
  lines.push("Reply to this email to answer the customer, if they left an email address.");
  return lines.join("\n");
}

// A minimal, correct RFC 5322 / MIME message. The body is UTF-8 base64 so any
// characters survive (accented names, "Piña Colada", emoji); the subject is
// RFC 2047 encoded only when it is not plain ASCII, so ordinary subjects stay
// readable in the raw message. Headers are CRLF-separated, as the spec requires.
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
  // Base64 body wrapped at 76 characters per line (RFC 2045).
  const b64 = (base64Utf8(body).match(/.{1,76}/g) || [""]).join(CRLF);
  return headers.join(CRLF) + CRLF + CRLF + b64 + CRLF;
}

// RFC 2047 "encoded-word" — only used when a header holds non-ASCII, so plain
// headers are left exactly as written.
function encodeHeaderWord(s) {
  // eslint-disable-next-line no-control-regex
  if (/^[\x20-\x7E]*$/.test(s)) return s;
  return `=?utf-8?B?${base64Utf8(s)}?=`;
}

// UTF-8 aware base64 (btoa alone mangles multi-byte characters).
function base64Utf8(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
