# Privacy compliance — what US law actually asks of us, what we have, and how it evolves

Written 2026-08-20, at Mark's request: "ensure the cookie banner tracks and
meets the standards of US laws — CA, TX, etc. — what we have vs need, and how
the tool would evolve as legislation evolves."

Owner: Mark. This is the working map a lawyer would start from, not a
substitute for the lawyer review that `docs/analytics.md` already lists as
outstanding. Where a judgment call was made, it says so and says why.

## The one-paragraph answer

For a business this size, the US state privacy laws (California's CCPA/CPRA,
Texas's TDPSA, and the twenty-ish states that copied them) almost entirely
**do not apply** — they all carry revenue or consumer-count thresholds that a
local $250-per-rental business does not come near. The laws that DO bind us at
any size are **COPPA** (kids' data — real exposure, already on the books as
needing a lawyer) and the **FTC Act** (whatever we *say* about privacy must be
true — and until today, some of it wasn't). So the work in this change is
mostly about honesty and good practice, plus one forward-looking mechanism
(Global Privacy Control) that puts us on the right side of where every state
law is heading. Our banner is opt-in, which is *stricter* than any US state
requires — that head start is why new state laws mostly cost us nothing.

## What was broken before this change (found in the audit)

The banner shipped 2026-08-05 was directionally right but had four real
defects, three of them accuracy problems — and accuracy is the one legal
standard with no small-business exemption:

1. **The banner said "No personal info is shared." That was false.** PostHog
   receives device data, city-level location, and session replays, and builds
   a person profile for every consenting visitor. A false statement in a
   privacy notice is a deceptive practice under FTC Act §5 at ANY size — this
   is the exact thing the FTC brings cases over. → Copy rewritten to say what
   actually happens.
2. **The banner's "Learn more" linked to `/privacy`, which did not exist**
   (404). A privacy notice that 404s is worse than none — it's a visible
   broken promise. → `/privacy` now exists, written honestly, in the girls'
   voice.
3. **The footer "Cookie settings" link was documented but never built.**
   `docs/analytics.md` and the code comments both describe it;
   `window.slushResetConsent` existed with nothing calling it. Consent you
   cannot withdraw isn't consent. → Real link in every page footer now (25
   pages), plus a button on `/privacy`.
4. **`/play` claimed "nothing saved anywhere but this device"** — untrue since
   the 2026-08-05 decision to instrument the games. → Reworded.

Two smaller fixes riding along: banner buttons brought up to the site's own
44px tap-target rule, and declining now **deletes** the PostHog cookie and
localStorage rather than just not loading the script — so "no" removes the
tracking identity, which is what the state-law notion of opt-out actually
means.

## Law by law: does it apply, and where do we stand?

### COPPA (federal — applies at any size) — the real one

The Children's Online Privacy Protection Act covers operators of sites (or
*portions* of sites) directed to children under 13, and "personal information"
explicitly includes **persistent identifiers — i.e., tracking cookies**. The
FTC's amended COPPA rule (finalized 2025, full compliance required spring
2026) tightened this further: disclosing kids' data to third parties for
targeted advertising now needs its own separate verifiable parental consent,
and operators need a written data-retention policy.

Where we stand, honestly:

- **Working for us:** the games have no accounts, no chat, no name capture;
  session recording is off on game paths; the banner means no cookie is set
  without an affirmative yes; scores stay on-device.
- **Working against us:** the arcade is linked from the main nav on every page
  (a "directed to children" signal Mark accepted knowingly, 2026-08-05), game
  pages set the PostHog cookie on consent, and a person profile is built for
  every consenting visitor — **including on game pages**. A child tapping "Yes"
  on the banner is not verifiable *parental* consent; COPPA's "support for
  internal operations" exception covers plain analytics but not
  profile-building for retargeting-grade audiences.
- **Deliberately NOT changed in this PR:** pulling cookies/profiles off the
  game paths (e.g., PostHog memory-only persistence + no person profiles on
  `GAMES` routes — which would still count `game_opened` and answer "which
  games are popular"). That would partially reverse Mark's explicit 2026-08-05
  decision to instrument the games, so it is his call, not a session's. **It
  is the single highest-value COPPA fix available and it costs none of the
  data Mark actually asked for.** Recommended: make this change, or get the
  lawyer's blessing for the current posture. The lawyer review remains
  outstanding either way.

### FTC Act §5 (federal — applies at any size)

No thresholds, no exemptions: privacy claims must be true, and reasonable data
practices are expected. The four accuracy fixes above are this law's work.
**Standing rule from here: any sentence on the site about what we collect must
be literally true, and `/privacy` gets updated *before* practice changes, not
after.** (That promise is now printed on `/privacy` itself.)

### California — CCPA/CPRA

Applies only to businesses over one of: ~$25M annual revenue; personal data of
100,000+ California consumers; or 50%+ of revenue from selling/sharing
personal data. **We meet none, by orders of magnitude — it does not apply.**
Also worth knowing: CIPA (California's wiretapping statute) fuels a real
plaintiff-lawyer cottage industry over session-replay scripts — no size
threshold on lawsuits. Our defense is structural: replay never runs before an
affirmative opt-in.

What it *would* require if we ever grew into it — and what we already do:

| CCPA/CPRA requirement | Status today |
|---|---|
| Notice at collection | ✅ banner + `/privacy` |
| Right to know / delete / correct | ✅ offered voluntarily on `/privacy`, 45-day window |
| Opt-out of sale/share + "Do Not Sell or Share" link | ✅ nothing is sold or shared for ads (stronger than the link) |
| Honor Global Privacy Control | ✅ honored as of this change |
| No discrimination for exercising rights | ✅ stated on `/privacy`; site works identically without cookies |

### Texas — TDPSA (our home state)

In effect since July 2024, and Texas's AG is one of the most active privacy
enforcers in the country. But the TDPSA **exempts small businesses** (SBA
definition — we qualify beyond argument) except for one carve-out: a small
business may not **sell sensitive personal data** without consent. We sell no
data of any kind, so we are compliant. The universal-opt-out provision
(recognizing signals like GPC, in force since January 2025) binds covered
controllers, not small businesses — we honor GPC anyway, see below. Texas's
SCOPE Act (minors on digital services) targets services with accounts and
social features; the arcade has neither, so it does not reach us — but it is
exactly the law that WOULD reach us if the tier-3 online-multiplayer idea in
`docs/game.md` ever shipped. That is already flagged there as a dad decision;
this is one more reason.

### The other states (CO, VA, CT, UT, OR, MT, MD, MN, NE, NH, NJ, DE, IA, KY, TN, IN…)

All follow the same pattern: consumer-count thresholds (typically 35,000–
100,000+ residents of that state, sometimes with a revenue prong) that a
Lakeway party-rental site cannot hit. Maryland's MODPA is the strictest of the
family (lowest threshold, hard data-minimization duty) and is the one to
re-read first if this business ever somehow goes national. Several (CO, TX,
and a growing list) mandate honoring universal opt-out signals — which is why
GPC support is the one piece of *machinery* worth building early. We built it.

### Federal laws that attach to specific activities (not yet ours)

- **CAN-SPAM** — attaches the day we send a marketing email list. Needs a
  working unsubscribe + a postal address in each email.
- **TCPA** — attaches the day we send marketing texts. Needs prior express
  written consent, and the fines are per-text.
- Neither applies to today's transactional booking emails.

## What "compliant" looks like in the code now

One file, `public/analytics.js`, holds the whole mechanism — auditable in one
sitting, which for a business this size beats any vendor CMP:

- **Opt-in by default** (stricter than every US law; they are opt-out regimes).
- **GPC honored:** a browser sending `navigator.globalPrivacyControl` is
  treated as "no" silently — no cookies, no banner nag. An explicit stored
  "yes" outranks GPC (state regs allow consent to override the signal), and a
  GPC visitor can still opt in through the footer's Cookie settings link.
  Note: this is NOT the old Do-Not-Track header. Mark's 2026-08-05 decision to
  ignore DNT stands — DNT never gained legal force. GPC is the signal that
  did.
- **Withdrawal is real:** footer link on every page → clears the choice,
  opts PostHog out, deletes its cookie + localStorage, re-asks.
- **The notice is real:** `/privacy` says everything, including the parts a
  company might rather skip, and commits to updating before practices change.

## The evolution plan — how this tool tracks legislation over time

The design bet: because we run **opt-in + GPC + sell nothing**, new US state
laws keep landing beneath us. Cookie-banner law in the US changes slowly; what
actually changes obligations is **what the business does**, so the plan is a
trigger list plus an annual check, not a subscription to legal news.

**Triggers — re-open this file the day any of these happens:**

| If we ever… | Then… |
|---|---|
| Run retargeting ads from our visitor lists (the stated purpose of the 2026-08-05 tracking posture) | That is CCPA "sharing." Update `/privacy` FIRST (it promises this), add a "Do Not Sell or Share" control, and confirm ad platforms receive GPC. This is the nearest trigger on the list. |
| Add any third-party pixel (Meta, Google Ads, TikTok) | Gate it behind the same consent as PostHog in `analytics.js` — one gate, not two. Google requires Consent Mode v2 signals with ads. |
| Start an email list | CAN-SPAM: unsubscribe link + postal address. |
| Send marketing texts | TCPA: written consent first. Per-text fines. |
| Ship accounts / online multiplayer (tier 3, `docs/game.md`) | SCOPE Act + COPPA verifiable-parental-consent machinery. Already a dad decision; now doubly so. |
| Serve meaningful non-US traffic or expand to other states at scale | Re-read this file top to bottom; GDPR/ePrivacy are opt-in-with-categories regimes and the CMP math changes (see below). |
| Get a data request email | Answer within 45 days, as `/privacy` promises. Verify the requester (reply to the booking's own email address) before showing anything. |
| Get any lawyer letter mentioning CIPA / wiretapping / session replay | Don't panic — replay runs only after opt-in, which is the defense. Forward to the lawyer; do not reply directly. |

**Annual review — every August (put it next to the domain renewal):**

1. Re-read the banner and `/privacy` against what the site *actually does*
   now. Any drift is an FTC §5 problem — fix same day.
2. Skim the year's new state privacy laws (the IAPP state-law tracker is the
   standard free reference) for two things only: thresholds dropping below
   ~10k consumers (none have yet), and new universal-opt-out mandates (we
   already honor GPC, so these are usually free).
3. Check FTC COPPA guidance for rule changes. COPPA is our binding law; its
   amendments matter here more than any state bill.
4. Walk the trigger table above against what the business did this year.
5. Confirm the Cookie settings link still works on a phone (click it, decline,
   verify no `ph_*` cookie in devtools).

**When to graduate to a vendor CMP** (OneTrust/Osano/Cookiebot class): only
when one of these is true — third-party ad pixels need per-category consent;
GDPR territory traffic matters; or a state law actually attaches. A CMP's
value is managing *many* vendors' tags against *many* regimes' rules. We have
one tag and effectively one binding regime; a hand-rolled 250-line file we
fully understand is the better tool until one of those flips.

## Open items (unchanged by this work, restated so they don't get lost)

1. **Lawyer review of the COPPA posture** — outstanding since 2026-08-05
   (`docs/analytics.md`). This document is the briefing to hand them.
2. **Dad decision: cookieless analytics on game paths** — the biggest COPPA
   risk-reducer available, keeps every number Mark asked for. See the COPPA
   section above.
3. The reading-room version of this document lives at `/read` so Harper and
   Finley get the real reasoning, per the standing deliverable rule.
