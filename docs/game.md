# The Slushie Game — scoping doc

Mark's question, 2026-08-05: *an interactive game their 8–12 year old friends
could play on iPads, together, in shared rooms. Squishies are huge with this
age group. Could this be really cool and viral if promoted to kids everywhere?*

Short answer: **a slushie game is very buildable, genuinely cool, and worth
doing. The multiplayer rooms are buildable too, with real caveats. The "viral
with kids everywhere" part is where the honest conversation lives** — not
because the game can't spread, but because a website that markets itself to
under-13s changes the legal character of the whole site. All three parts are
scoped below.

---

## Part 1 — What to actually build

### The concept: SLUSH RUSH

A round-based slushie-making game. You run the machine at a party. Orders
come in — *watermelon, extra candy, blue raspberry, no dye!* — and you build
each cup against the clock: pick the flavor, pour to the fill line (hold and
release — overfill and it slops), drop the right candy on the rim, serve.

The party gets bigger and faster each round. Get the order wrong and the
customer makes a face. Get ten right in a row and the machine goes rainbow.

**Why this shape:**

- It is *their actual business*. Every mechanic is something Harper and
  Finley really do. That is the difference between a branded game and an ad.
- Serving-under-pressure games (Overcooked, the diner genre) are proven with
  exactly this age group, and the touch mechanics — tap, hold-to-pour, drag —
  are native to an iPad.
- The real flavors, the real candy pairings, and the real machine are the
  game's content. The kids' tank, the no-dye orders, even "too much tequila
  and it won't freeze" as a grown-ups-tank joke mechanic (a grown-up NPC
  pours; the tank stops freezing; you fix it) — the whole site's world maps
  onto game mechanics almost embarrassingly well.
- **The freeze physics can be real.** The Brix logic from /lab can literally
  drive the game: too little sugar in your mix and the tank seizes, too much
  and it never sets. The game quietly teaches the actual science. No other
  kids' game on earth would have real freezing-point depression in it, and
  it's already coded.

### The squishy angle

Squishies matter here as *aesthetic*, not mechanic: the cups, the candy, the
whole visual language should be squishy — soft-body wobble on every cup, a
satisfying squish when the candy lands, slushie that jiggles when poured.
That's CSS/canvas animation, cheap to do well, and it's what makes an 8-year-
old show the screen to a friend. A dedicated "squishy collection" — earn a
new squishy cup character per level — gives collection without money: nothing
is bought, everything is earned.

### Scope tiers

| Tier | What | Effort |
| --- | --- | --- |
| **1. Solo game** | Rounds, orders, pour/candy/serve loop, squishy art, high score saved on the device | The core build. Entirely static — fits the site's no-backend architecture today |
| **2. Same-room multiplayer** | Two kids, one iPad each, same wifi: one takes orders, one builds cups — the Overcooked split | Needs no accounts: a 4-letter room code, WebRTC or a tiny worker. Meaningfully more work than tier 1 |
| **3. Shared game rooms** | Friends join a room code from anywhere, play the same party | Needs a real-time backend (Cloudflare Durable Objects fits the stack). This is the "log into the same room" ask — see Part 2 |

Build them in that order. Tier 1 is a complete, shippable, delightful thing
on its own, and tiers 2–3 bolt onto it. Do not start with the multiplayer —
every game that starts with the netcode ships the netcode and not the game.

---

## Part 2 — The honest constraints, before anyone falls in love

### "Log into the same game room" — possible, with two big caveats

Technically: yes. Room codes (no accounts, no names — like Kahoot or
Gartic) are the right pattern for kids and are buildable on Cloudflare
Durable Objects, which stays inside the current stack. "Same room from
different houses" is a real build but not a moonshot.

The two caveats:

1. **No accounts, no chat, no names, no photos — ever.** The moment kids can
   type free text at each other or identify themselves, the site becomes an
   online service collecting from under-13s and COPPA applies in full, plus
   the moderation burden of children talking to strangers. Room codes with
   preset emoji reactions only. This is not a nice-to-have, it is the line
   that keeps the game buildable at all.
2. **A room system is a running service.** Everything on this site today is
   static files — nothing to break at 2am. A multiplayer backend is the
   first thing that can *go down*. Cloudflare's free tier covers the scale
   we'd see, but someone (Mark) owns "the game is broken" forever after.

### The "viral with kids everywhere" question

This is where I'd pump the brakes — one specific brake, not the whole idea.

The site currently sits carefully on the right side of a line: it is a
business site *about* two kids, aimed at the adults who book parties. COPPA
applies to sites **directed to children**. A game for 8–12s, promoted to
kids, makes at least that page — arguably the site — child-directed. That
means: no analytics on the game page, no email capture near it, nothing that
collects anything. All doable! The current architecture (no trackers, no
cookies) is actually nearly compliant by accident. But it is a real design
constraint that must be honored *before* promotion, not after.

And one strategy echo worth hearing again: the creator research found that a
1.7-million-like video produced ~$500 of revenue. A viral game played by
kids in Ohio books zero Lakeway parties. **The game's real value is local
and social**: every kid at every party who plays it is a kid who tells a
parent, and the parent is the customer. "Viral with their friends at Lake
Travis Elementary" is worth more than viral on the internet — and it's also
the version with no promotion cost and no legal exposure.

So: build it, make it excellent, let the girls show their friends, put it on
the party table as a QR code. If it spreads, it spreads from there — which is
exactly how the business itself is supposed to spread.

### App Store or website?

Website, no contest. An iPad plays a well-built web game beautifully
(add-to-home-screen gives it an icon and full screen). The App Store means
Apple review, a developer account, kids-category rules that are far stricter
than the web, and updates through review forever. The web version ships the
day it's done and updates the second we push.

---

## Part 3 — Proposed build plan

1. **`/play` — Tier 1 solo game.** One page, canvas, no backend, no
   analytics, no capture. Squishy art direction. The Brix freeze logic from
   /lab as the difficulty mechanic. High score in localStorage. Noindex at
   first, like /read — the girls and their friends are the beta test.
2. **Playtest at a real party.** QR code on the machine's instruction card.
   Watch what 8-year-olds actually do. (The girls run this test. It is
   their game.)
3. **Tier 2 couch co-op** if — and only if — tier 1 gets played twice by
   the same kid. A game nobody replays does not need multiplayer.
4. **Tier 3 rooms** as the reward for tier 2 working, after the COPPA
   pass above is written down and Mark signs off on running a service.

### The girls' role

They design it: flavors, candy pairings, what the customers say, what the
faces look like, what the squishy cups are named. Every design decision is a
content moment (the research: "show the business, not the drink" — designing
your own game IS the business). The build-in-public arc — sketches, first
playable, friends' reactions — is a content series that money literally
cannot buy at this age.

### What it costs

Tier 1: time, zero dollars. Tier 2: time, zero dollars. Tier 3: likely still
$0/month on Cloudflare's free tier at any realistic scale, but it puts a
running service in Mark's life permanently.

---

## Decisions needed from Mark before building

1. Green-light tier 1 (`/play`, orphaned like /read, no promotion)?
2. The COPPA posture above — no analytics/capture on game pages — accepted
   as a standing rule?
3. Tier 3 rooms: is "Mark owns a running service" acceptable *in principle*,
   so it can be designed for from the start?

---

## What actually got built (2026-08-05)

Both greenlit and live. The arcade is orphaned as planned (noindex, no nav, no
analytics, nothing collected).

- **Slush Rush** — the tier-1 solo game above, at **`/slush-rush`**. Shipped.
- **Slushie Street** — a slushie-stand **tycoon**, at **`/slushie-street`**, added
  as the deliberately-different second game (slow and building, where Slush Rush
  is fast and reflex). Mark's call, 2026-08-05: game 2 = tycoon; multiplayer =
  same-device now.
  - **1 Player:** tap to serve, seven upgrades (bigger cups → candy-garnish ×2
    multiplier → cooler/bike/second stand/truck/franchise passive earners),
    milestones, and **offline earnings** (pays up to 8h of passive income on
    return). Progress saved to `localStorage` (`slushstreet_save`).
    Notes on the door for a later pass: numbers aren't deeply balanced yet, and
    there's no prestige/reset loop — both fine for a first playtest.
  - **2 Players (tier 2, same iPad):** a 60-second **race**, split screen, the
    top panel rotated 180° so two kids facing each other across the table both
    read right-side-up. Each player taps their own stand and buys bigger
    cups / helpers; most money at zero wins. Rematch button. No backend — this
    is the "same room" feel with zero infrastructure.
- **`/play`** became the **arcade hub** pointing at both games (it used to *be*
  Slush Rush).

**Still not built: tier 3** — friends joining a shared room from different
houses. That is the "same realm from anywhere" ask, it needs the Durable-Objects
backend in Part 2, and it stays a **dad decision** (a running service Mark owns,
plus the hardened no-accounts/no-chat/no-names line) before it's designed in.

## The arcade as a growing collection (2026-08-05, later)

Mark's feedback after playing: **Slushie Street is "just pushing a button over
and over"** — a clicker, not really play. The signal: he and the kids love the
**Toca Boca kind of thing — a character that moves and interacts**, open-ended,
no score. Slushie Street stays in the arcade (his call: "keep that one, we'll
just keep building the arcade"), but new games lean into that direction. Three
added the same night, all built around the mascot moving and reacting:

- **Slushie's Playhouse** (`/slushie-playhouse`) — a *toy*, the Toca answer.
  Make a slushie (pour flavors that mix, drop candy, add a straw), give it to
  Slushie, and it drinks and **reacts** to what you made (brain freeze on icy
  drinks, a sugar-rush bounce on lots of candy, turns the flavor's color). Poke
  it → giggles; drag it → wobbles. No score, no timer.
- **Slushie Catch** (`/slushie-catch`) — a moving-character action game. Slide
  to move Slushie, catch falling fruit/candy in the cup, dodge sour lemons and
  ice cubes. Three lives, speeds up, high score on the device.
- **Slushie Style** (`/slushie-style`) — a dress-up *toy* (Toca Hair Salon
  vibe): change color, add hats/glasses/bows, pick a face, tap for a pose,
  🎲 surprise button. No goals.

So the arcade is now five: Playhouse, Catch, Style, Slush Rush, Slushie Street.
The pattern for the next one is in `CLAUDE.md` (“The arcade”). Direction to keep
pulling on: **interactive and character-first over score-first.**
