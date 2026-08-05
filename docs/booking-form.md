# The booking form

## What it does now

**Wired up 2026-08-05.** Option A below is built and live: the form POSTs to a
Cloudflare Worker at `/api/book` that emails each request to the business inbox.
See `docs/booking-worker.md` for how it works and how to look after it.

`public/book.html` holds a real `<form>`. On submit it POSTs the fields as JSON
to whatever URL is in `BOOKING_ENDPOINT`, near the bottom of the file:

```js
var BOOKING_ENDPOINT = '/api/book';
```

If that string is empty the form **disables itself** and shows a notice saying
online booking is not switched on. That is deliberate. The version this replaced
showed "Got it! We will get back to you today." without sending anything
anywhere, so every request typed into it was lost while the customer believed
they had booked. A form that admits it is off is worse-looking and far better
than one that lies. (Setting `BOOKING_ENDPOINT` back to `''` is the clean way to
turn the form off again.)

The success message now appears only after the endpoint returns a 2xx. A network
failure or a non-2xx shows an error that says plainly that nothing was sent.

Also included: `required` on name, date, address and contact; native validation
messages on submit; and a hidden honeypot field that silently drops bot
submissions.

## What it collects

Name, event date, guest count, two flavors, **event address**, phone or email,
and free-text notes.

The address is necessary — they deliver a machine to it. It does mean each
submission is a home address plus a phone number, frequently for a child's
birthday party. Wherever these land is a place that data accumulates, so it is
worth picking deliberately rather than by whatever is quickest.

## Turning it on

Three options. All three end with a URL going into `BOOKING_ENDPOINT`.

### Option A — Cloudflare Worker (chosen, and now built)

A small Worker accepts the POST and emails the booking to the business inbox
through Cloudflare Email Routing. Everything stays inside the Cloudflare account
already being paid for, and no third party ever holds the data.

- **Cost:** free — sending to a verified Email Routing destination costs nothing
  on any plan.
- **Needs:** Email Routing enabled with the inbox verified as a destination.
- **Best because:** the data stays under Mark's control, which is the deciding
  factor given what is in it.
- **What was built:** `src/index.js` (the Worker), the `send_email` and
  `run_worker_first` config in `wrangler.jsonc`, and `BOOKING_ENDPOINT` pointed
  at `/api/book`. Full detail and the dashboard steps are in
  `docs/booking-worker.md`.

The original plan named a D1 table so bookings would accumulate somewhere
queryable. That was dropped for now to keep the data footprint minimal — the
email is the record. Adding storage later is a separate, deliberate decision.

### Option B — a hosted form service

Formspree, Basin, Web3Forms and similar accept a POST and email the result.
Sign up, paste the endpoint URL, done.

- **Cost:** free tiers cover ~50 submissions/month.
- **Effort:** about ten minutes.
- **Trade-off:** a third party stores the addresses and phone numbers, under
  their retention policy and their security. Read what they say about deletion
  before choosing this.

### Option C — email only, no form

Delete the form, publish a phone number and an email address, and let people
reach out directly.

- **Cost:** nothing.
- **Effort:** minutes.
- **Trade-off:** measurably lower conversion than a form, but zero systems to
  maintain and no stored data at all. For a business doing a handful of rentals
  a month this is a legitimate choice, not a cop-out.

## Whichever option is chosen

The site needs a **working contact path regardless**. Today it has none: there is
no phone number, no email address, no MX record on the domain, and the Instagram
handle referenced in the footer belongs to somebody else (see
`docs/strategy.md`). If the form breaks, or a visitor simply prefers to call,
there is currently nowhere for them to go.

## Testing it after wiring it up

1. Set `BOOKING_ENDPOINT`, open a PR, wait for the preview URL comment.
2. Submit a real request through the preview.
3. Confirm it arrived wherever it was meant to arrive.
4. Confirm the success message appeared only after that.
5. Then merge.

Step 3 is the one that matters. The previous form passed every check except
actually delivering anything.
