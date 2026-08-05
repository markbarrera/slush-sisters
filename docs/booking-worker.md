# The booking email — how it works and how to turn it on

This is the piece that makes the booking form actually deliver. When someone
fills in the form at `/book` and presses **Send request**, the site Worker
emails their request to you. Nothing is stored in a database or handed to any
other company — **the email in your inbox is the record.** That is deliberate:
the form collects a child's party address and a parent's phone number, and this
way that information only ever lives in your own Cloudflare account and your own
inbox.

The booking code now lives in the site's single Worker (`src/worker.js`),
alongside the request logging and the markdown-for-agents feature. It is written
and tested but **currently paused** — see "Two pieces" below.

## The two pieces that have to be true

For a booking to reach you, two things both have to be set up. If either is
missing, the form honestly tells the customer it did not go through — it will
never fake a "thanks!" for a request that vanished.

1. **Email Routing is on, and your inbox is a verified destination.** You set
   this up once in the Cloudflare dashboard (below). It is what lets the site
   send mail to `mark@markbarrera.com`.
2. **The `send_email` binding is turned on in `wrangler.jsonc`** and the form is
   pointed at the endpoint. Both are one-line changes, currently commented out
   on purpose so the site deploys cleanly until piece 1 is done.

### Piece 1 — Email Routing (you do this once, in the dashboard)

1. Go to **https://dash.cloudflare.com** and click **slushsisters.com**.
2. In the left sidebar, click **Email** → **Email Routing**.
3. Turn it on. When it asks for a **destination address**, enter
   `mark@markbarrera.com`. Cloudflare emails that inbox a verification link —
   open it and click **Verify**.
4. Let Cloudflare **add the DNS records** it offers. Those are what make mail
   deliverable. This is reversible, and the domain receives no mail today so
   there is nothing to break.

If you ever want bookings to go to a **different** inbox, that address has to be
verified here first, then the `destination_address` line in `wrangler.jsonc` is
changed to match — a one-line change for whoever edits the site.

### Piece 2 — turn the binding on (a small code change, once piece 1 is done)

Tell me when Email Routing is verified and I will make these three edits and
deploy them together:

- Un-comment the `send_email` block in `wrangler.jsonc`.
- Set `var BOOKING_ENDPOINT = '/api/book';` in `public/book.html` (it is `''`
  today, which is what shows the "not turned on" notice).
- (While we are at it, if Analytics Engine is enabled, un-comment the
  `analytics_engine_datasets` block too, so request logging starts.)

**Safety detail:** if your inbox is **not** verified in Email Routing, a deploy
that includes the `send_email` binding **fails on purpose** with an error
instead of publishing a form that cannot deliver. So the worst case is "the site
did not update," never "bookings are silently disappearing." That is exactly why
the binding is left commented until piece 1 is confirmed.

## Testing it (before trusting it)

1. The change goes up as a pull request first; the preview workflow comments a
   temporary `…workers.dev` URL. The live site is untouched.
2. Open `…workers.dev/book` and submit a **real** test request.
3. Check your inbox. Within a minute you should have an email titled **"New
   booking — [the name you typed]"** with every field laid out.
4. Confirm the page showed the green "Got it!" message **only after** that email
   arrived — not before.
5. If that worked, merge. Bookings now reach you on the live site.

## What it costs

Nothing. Sending to an address you have verified in Email Routing is free on
every Cloudflare plan — no paid email-sending product, no quota. This works
precisely because it only ever emails **one** address, your own.

## What it does not do (on purpose)

- It does not send the **customer** a confirmation email. Emailing strangers
  would need a paid plan and extra domain setup. The form's on-screen "Got it!"
  message is the customer's confirmation; you follow up from your inbox.
- It does not store anything. A running list of bookings later would be a bigger
  change (a database) and a separate decision — this keeps the data footprint as
  small as it can be.

## Where the code lives

- `src/worker.js` — the site Worker. The `handleBooking` function reads the
  submitted fields and emails them to you; the rest of the file logs requests
  and serves markdown to agents.
- `wrangler.jsonc` — the config: the (currently commented) `send_email` binding
  picks which inbox. `run_worker_first` is `true` so the Worker also sees every
  page request for logging.
- `public/book.html` — the form. `var BOOKING_ENDPOINT = '/api/book';` points it
  at the booking handler; `''` cleanly turns it off and shows the honest notice.
