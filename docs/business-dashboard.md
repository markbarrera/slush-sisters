# The business dashboard — Cockpit + Open Ledger

The plan for turning Slush Sisters into something the girls can *run and see*:
every party travels the whole journey — someone heard about us → they looked →
they booked → it cost this → we kept this → this part was never ours (tax) →
here's where the rest goes. Best-in-class business analytics, named in
8-and-11-year-old language.

Owner: Mark. Started 2026-08-05. This doc is the spec; it also gets a
reading-room card so the girls own it in their own words.

## Two surfaces, one source of truth

| | **The Cockpit** (private) | **The Open Ledger** (public) |
|---|---|---|
| Who | Harper, Finley, Mark | anyone |
| What | log a party, add its costs, save a recipe, write a learning, watch the jars fill | the honest window — same numbers, nothing private |
| Where | login-gated, `noindex`, no tracking | `/ledger`, generated from the same data |

Today `/ledger` is hand-typed. The end state: the girls do the work once in the
Cockpit and the public ledger updates itself.

## The data (see `migrations/0001_business.sql`)

Cloudflare **D1** — a small SQLite database inside Mark's own Cloudflare account,
so customer PII never leaves it. Six tables:

- **bookings** — the customer + event. Written by the Worker straight off the
  `/book` form (alongside the email it already sends), then worked in the
  Cockpit. Carries the `bk_…` ref that PostHog and the booking email also use, so
  the browsing funnel, the email, and the money all join on one id.
- **costs** — per-party (mix, cups, candy, fuel) when tied to a booking;
  overhead (machine, insurance, LLC) when not. `is_estimate` mirrors the ledger's
  "est" badge.
- **jar_entries** — the Profit First jar ledger, append-only. Balance = SUM of a
  jar's entries, so nothing silently disappears.
- **recipes** — public ones render on the site; freeze-knowledge ones stay
  private (`is_public = 0`).
- **learnings** — one line per party, or general lessons; feed the reading room.
- **settings** — the loan owed to Dad, the tax rate, the jar split — editable
  without a code change.

Money is integer **cents** everywhere; the UI formats dollars. Rows are added,
never quietly deleted (a canceled booking is `status='canceled'`).

## The teaching model

**The funnel** (real term → what the girls see → where the number comes from):

| Real term | Girls see | Source |
|---|---|---|
| Attribution | *How they found us* | `heard_from` + PostHog referrer/UTM |
| Engagement | *What they looked at* | PostHog (live) |
| Conversion | *They said yes* | `bookings` row |
| Unit cost (COGS) | *What saying yes cost* | `costs` for that booking |
| Contribution margin | *What we kept* | revenue − that party's costs |
| Tax provision | *The part that was never ours* | `settings.tax_rate` → tax jar |
| Repeat / LTV | *Did they come back* | booking history |

**The jars** (Profit First): every payment splits the moment it lands —
**Supplies · Tax · Pay-Dad-back · Profit · Paychecks** — per the percentages in
`settings`. Watching $250 split into five jars is the whole financial-literacy
lesson in one animation.

## Sign-in (recommended: Cloudflare Access)

The Cockpit is gated at the edge by **Cloudflare Access** (free Zero-Trust,
email login, no password in code). Click-path to be written when the page ships.
Interim option: a shared family passphrase checked by the Worker.

## Build phases

1. **Capture + auto-ledger** *(this schema is step one)* — Worker writes each
   booking to D1; a Cockpit view lists bookings and takes costs + one learning;
   `/ledger` renders from D1. Gets party #1 flowing end to end.
2. **The jars** — the five-jar split + "story of one party in numbers."
3. **The funnel view** — PostHog + GSC on top so the whole flow reads in one
   screen.
4. **Recipe box + learnings library** — searchable; feeds the cost pre-fill.

## Provisioning (Mark's account — done once)

The database is a real resource in the Cloudflare account. Two ways to create it:

- **Dashboard:** dash.cloudflare.com → *Workers & Pages* → *D1* → *Create
  database*, name it `slush_business`. Then this session (or `wrangler`) applies
  `migrations/0001_business.sql`.
- **CLI:** `npx wrangler d1 create slush_business`, then
  `npx wrangler d1 execute slush_business --file=migrations/0001_business.sql`.

Then un-comment the `d1_databases` binding in `wrangler.jsonc` (added, commented,
same pattern as the email + analytics bindings) and the Worker can read/write it.
Until then the site is unaffected — the binding no-ops.

## Open items (carried from the analytics work)

- **A lawyer's review of the COPPA posture** and a **visible privacy/cookie
  notice** — now that the site sets cookies (including on game pages) and this
  database will hold children's home addresses. Both outstanding.
- **Who can read the Cockpit** — Access limits it to named emails; decide the
  list (Mark; the girls on a shared login).
