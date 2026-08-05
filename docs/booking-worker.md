# The booking email — how it works and how to look after it

This is the piece that makes the booking form actually deliver. When someone
fills in the form at `/book` and presses **Send request**, a small program
running at Cloudflare emails their request to you. Nothing is stored in a
database or handed to any other company — **the email in your inbox is the
record.** That is deliberate: the form collects a child's party address and a
parent's phone number, and this way that information only ever lives in your own
Cloudflare account and your own inbox.

You do not need to understand the code to run this. This doc is the plain-English
version.

## The two pieces that have to be true

For a booking to reach you, two things both have to be set up. If either is
missing, the form honestly tells the customer it did not go through — it will
never fake a "thanks!" for a request that vanished.

1. **Email Routing is on, and your inbox is a verified destination.** This is the
   thing you set up in the Cloudflare dashboard. It is what lets the site send
   mail to `mark@markbarrera.com`.
2. **The site has been deployed** with the booking program included (that
   happens automatically when a change merges to `main`).

### Piece 1 — Email Routing (you do this once, in the dashboard)

If you already turned on Email Routing and verified your inbox, this is done —
skip to "Testing it." If not:

1. Go to **https://dash.cloudflare.com** and click **slushsisters.com**.
2. In the left sidebar, click **Email** → **Email Routing**.
3. Turn it on. When it asks for a **destination address**, enter
   `mark@markbarrera.com`. Cloudflare emails that inbox a verification link —
   open it and click **Verify**.
4. Let Cloudflare **add the DNS records** it offers. Those are what make mail
   deliverable. This is the only DNS change involved, it is reversible, and the
   domain receives no mail today so there is nothing to break.

That verified address is wired into the site's config by name. If you ever want
bookings to go to a **different** inbox, that address has to be verified here
first, and then one line in `wrangler.jsonc` (`destination_address`) is changed
to match — tell whoever is editing the site and it is a one-line change.

Optional, nice to have: also create a routing rule so mail sent **to**
`bookings@slushsisters.com` (the address bookings appear to come from) forwards
to you. It is not required — you can already reply straight to any booking that
included a customer email, because the program sets the reply address to the
customer. It just means the occasional bounce or reply-all lands somewhere real.

### Piece 2 — deploy

The booking program ships with the rest of the site. Merging a change to `main`
publishes it, same as any other update (see `docs/setup-guide.md` if the deploy
pipeline itself is not set up yet — it needs the two Cloudflare secrets in
GitHub).

One useful safety detail: if your inbox is **not** verified in Email Routing, the
deploy **fails on purpose** with an error instead of publishing a form that
cannot deliver. So the worst case is "the site did not update," never "bookings
are silently disappearing." That is the failure mode we want.

## Testing it (do this before trusting it)

1. Open a pull request with the change (or use the existing one). The preview
   workflow comments a temporary `…workers.dev` URL on the PR. The live site is
   untouched.
2. Open `…workers.dev/book` and submit a **real** test request.
3. Check your inbox. Within a minute or so you should have an email titled
   **"New booking — [the name you typed]"** with every field laid out.
4. Confirm the page showed the green "Got it!" message **only after** that email
   arrived — not before.
5. If all that worked, merge. Bookings now reach you on the live site.

If the email does not arrive: check spam first, then confirm your address still
shows as **Verified** under Email Routing → Destination addresses. A booking that
fails shows the customer a plain "that did not go through" message, so nobody is
ever left believing a lost request succeeded.

## What it costs

Nothing. Sending to an address you have verified in Email Routing is free on
every Cloudflare plan — it does not need the paid email-sending product and does
not count against any quota. This works precisely because it only ever emails
**one** address, your own.

## What it does not do (on purpose)

- It does not send the **customer** a confirmation email. Emailing strangers
  (rather than your own verified inbox) would need a paid plan and extra domain
  setup. The form's on-screen "Got it!" message is the customer's confirmation;
  you follow up from your inbox.
- It does not store anything. If you want a running list of bookings later, that
  is a bigger change (a database) and a separate decision — this version keeps
  the data footprint as small as it can be.

## Where the code lives

- `src/index.js` — the program. Reads the submitted fields, emails them to you.
- `wrangler.jsonc` — the config: `send_email` (which inbox), and
  `run_worker_first` (which makes sure only the `/api/*` path runs code; every
  real page is still plain static HTML).
- `public/book.html` — the form. The line `var BOOKING_ENDPOINT = '/api/book';`
  is what points it at the program. Setting that back to `''` cleanly turns the
  form off again and it goes back to showing the honest "not turned on" notice.
