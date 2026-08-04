# The build log

What this site was, on each day it changed, and why.

Git already records every edit. This file records something git cannot: the
*reasoning* — what was broken, what was decided, what turned out to be wrong.
That is the part that is worth reading later, and the part that makes this a
story rather than a changelog.

Two audiences, on purpose:

- **The girls.** This is the record of them building something real, including
  the parts that did not work. A business that only publishes its wins teaches
  nothing.
- **Anyone telling the story afterwards** — a case study, a talk, a post, a
  press feature. The receipts are here, dated, with the mistakes left in.

## How it works

- **Visual snapshots** live in `docs/history/<date>/`. Every canonical page,
  rendered at 390px (phone) and 1280px (desktop), full page. Run
  `node scripts/snapshot.js` after any meaningful change and commit the output.
  The snapshot run also checks each page for a visible Book button, sideways
  scroll, and broken images, and fails loudly if it finds any.
- **Entries below** are newest first. Each one says what changed, why, and —
  where it applies — what was got wrong.
- **Keep the mistakes in.** They are the most useful thing in the file. A
  corrected error is more instructive than a decision that happened to be right
  first time.

---

## 2026-08-04 — A second product, seven rules, and a name that died in four hours

Mark's instruction was blunt and useful: *"you don't need my answer to just
build. I can walk you back later if needed."* So every open decision got made
instead of parked, and each one in `docs/category-and-bar-program.md` now
carries a line saying what reversing it costs.

**"The everybody bar" is dead.** It was the category name proposed by the
naming work that morning. Mark read it and said it would not work. He was
right, and the reason is the same test the report itself specified: explaining
"the everybody bar" takes a whole sentence, and "the kids' tank" takes none. A
name that needs an explanation is a slogan wearing a name's clothes.

**"The kids' tank" shipped** — on `/flavors`, on `/pricing`, and as rule 1 of
`/our-rules`. It carries the same abandonment condition: if nobody repeats it
back by party twenty, it goes too.

**Fresh Press is priced at $375 and is deliberately not bookable.** The
ingredient delta is only $20–40, so the $125 premium is selling the morning
spent squeezing, not the limes. But the freeze test has not been run, and
selling a $375 recipe that can seize the machine is exactly the failure
`product-tiers.md` warns about. So the page carries a visible *"in testing —
here is why you cannot book this yet"* block. Flipping it live is deleting one
`<div>`.

That was a real choice, not a hedge. A page that says *we are checking this
before we sell it to you* argues the standard better than a page claiming the
drink is good.

**`/our-rules` publishes seven rules, each with a visible "costs us:" line** —
a second mix made for no extra money, an hour of every Sunday, the money
everybody else makes on a heatwave. That line is the entire mechanism. A rule a
competitor can match by adding a sentence to their website is worth nothing, so
the test for the list was *does this cost us something real*, not *does it
sound good*.

**It was nine, and Mark cut two.** The first said half the machine is always
reserved for kids — which sounds generous and is a bad way to run a business,
because plenty of parties are all adults and promising to waste a tank at those
serves nobody. Rewritten as what it actually meant: the kids’ option is always
there, and it is always free. The second promised a no-dye version of every
flavor, which is not true yet; publishing it in the present tense would have
made the page the exact thing it argues against.

Both were the same failure — a rule that costs nothing because you cannot be
caught breaking it. The page now explains its own 9 → 7 out loud, because a
standard that quietly shrinks is worse than one that says why.

A third was cut earlier for being illegal rather than weak: a certification
badge other companies could earn. Under 15 U.S.C. §1064(5) whoever hands out a
certification mark may not sell the thing it certifies — Slush Sisters would
have had to stop renting machines to hand out margarita badges.

### Later the same day — Mark reviewed it

Three things came back, and all three were right.

**The girls' ages were published backwards on every page.** Harper is 11 and
Finley is 8; the site said the reverse — in the homepage kicker, the FAQ on
`/austin`, all six service-area pages, `/promise`, `/our-rules`, and the
reading room. Fixed in sixteen files, and the correct pairing is now written
into `CLAUDE.md` so the next session cannot get it wrong from a summary.

Worth naming plainly: of everything built in this session, the detail that was
wrong the longest was the one fact about the two people who own the company.

**`/lab` was written for an adult.** "A frozen drink machine is a physics
problem wearing a party hat" is a good sentence and it is not one an
eleven-year-old wrote. Rewritten throughout: Brix explained as *how much sugar
is in there*, the refractometer as *a little glass thing you hold up to the
light*, anthocyanins gone entirely, and blue raspberry now leads with the
genuinely surprising bit — that it is not a fruit and somebody made it up.

It was also thin where it mattered. `/our-rules` claimed mistakes get written
down in the Lab, and the Lab had no mistakes on it — so the rule was
technically a lie the moment it was published. There is now a **Things we got
wrong** section with three real ones, including the calculator that told people
their working recipe made a block of ice, and the view-count error from earlier
in this same log.

**The homepage felt forced**, and it did. The hero had a competitive claim
bolded inside the girls' own first-person voice — *"Every other rental in
Austin only serves half your party"* — which is a marketing line in a child's
mouth. The three doors carried eyebrows nobody says out loud ("I am planning
something for adults"). Both rewritten shorter and plainer; the competitive
point still exists on `/flavors` and `/pricing`, where a grown-up is doing the
talking.

### What was got wrong

**`/lab` shipped with two `<head>` blocks.** It was built by copying
`/austin.html` as a shell, and the copied `<!DOCTYPE>`, `<head>` and
`<title>` were never removed — so the page carried `/austin`'s title and
description immediately after its own. Browsers recover from that silently,
which is why it looked right in every screenshot and passed the snapshot check
for days.

Found by accident, while adding a footer link with a script that reported the
file already contained the string it was looking for.

**A correction to the first version of this entry.** It claimed the stray
block also carried `/austin`'s canonical URL, which would have told Google
`/lab` was a duplicate and should not be indexed. That was wrong, and it was
wrong in the direction of making the bug sound worse. Checking the old file in
a real browser found two `<title>` tags and exactly one canonical — the right
one. The damage was a duplicate title, not a deindexed page.

Worth leaving in, because the mistake is the ordinary kind: the bug was real,
the reasoning about what it broke ran ahead of what was actually checked.

**What came out of it:** the snapshot script now checks `<head>` as well as
layout — exactly one `<title>`, exactly one canonical, and the canonical
matching the route it was served from. `/read` and `/ideas` are exempt, since
they are noindex orphans that carry no canonical on purpose. Verified against
the broken version of the file: it fires.

The lesson is narrow and worth keeping: **the snapshot script was checking what
a page looked like, not what it claimed to be.** Nothing in the build was
watching `<head>` until something in `<head>` broke.

---

## 2026-08-04 — Mobile first, and an Austin page

**What changed**

- **The Book button is now visible on a phone.** It was not. On any screen
  under 600px the entire nav — including the "Book Now" button — collapsed
  behind a ☰ icon. The single action the site exists to produce was invisible
  by default on the device most visitors use. Fixed across all thirteen pages
  with a header Book button that lives outside the collapsible nav, at a 44px
  tap target.
- **`/austin` added.** A metro-wide catch-all, distinct from the existing
  `/margarita-machine-rental-austin` SEO page. Reason: if an Austin outlet runs
  a story, the whole metro arrives at once, and every existing page is either
  about one neighbourhood or written for adults booking a margarita machine.
  This one covers the whole area, is honest about how far the van will go, and
  answers "are you really kids" directly.
- **Mobile-first written into `CLAUDE.md`** as a standing convention rather
  than a preference.
- **Snapshot system added** (`scripts/snapshot.js`), and this file started.

**What was got wrong along the way**

- Suspected the homepage was shipping a 219KB hero image to phones. It is not —
  there is a `<picture>` element serving a 90KB 640px WebP. Checked before
  reporting, which is the only reason it did not become a "fix" that broke
  working code.
- Set the mobile Book button to a 40px tap target on the first pass. The
  accessibility floor is 44px. Caught by measuring it in a real browser rather
  than trusting the CSS.

**What is still wrong**

The CSS is desktop-first — six ad-hoc `max-width` breakpoints (440, 480, 500,
540, 600, 700) that treat the phone as a series of exceptions. It should be
`min-width`, so the base styles *are* the phone styles. Not rewritten in one
go, deliberately: thirteen pages of inline CSS, changed all at once, with no
test suite, is how you break a live site. It moves page by page as pages get
touched.

---

## 2026-08-04 — The case review

Five analysts pointed at the business at once and told to disagree with each
other. The full argument is in `case-review.md`; the short version of what it
changed:

- The "$27,000 ceiling" turned out to be one machine's annual calendar, not a
  statement about demand.
- The highest-value idea in the review was one nobody was arguing about:
  selling cups at school and community events rather than renting the machine
  out. Higher yield, no alcohol anywhere near it, and the only version of this
  business the girls can actually front.
- The best structural insight: the machine has two tanks, and a backyard party
  is a kids' party and an adult party *simultaneously*. Every competitor serves
  half of it.

Also fixed: `strategy.md` was calculating booking value at $275 when the price
is $250.

---

## 2026-08-03 — Recovery, and the form that was lying

The site existed and was live. It was not in version control anywhere. First
job was getting it into git before anything else could safely happen.

**The worst thing found:** the booking form did not submit anywhere. It was a
button with an `onclick` that hid itself and revealed a "thanks, we'll be in
touch" message. Every booking request anyone had ever submitted had been
displayed a success message and then discarded. Nobody knew.

Replaced with a real form that only shows success on an actual `res.ok`, and
which disables itself with an honest message when no endpoint is configured —
so it can never silently lie again.

**Other things that looked intentional and were not:**

- `not_found_handling` was set to SPA fallback, so every wrong URL returned the
  homepage with a 200 instead of a 404.
- Four pages had no `<h1>`.
- The footer linked to `instagram.com/slushsisters`, which belongs to an
  unrelated account with three followers. Anyone following that instruction
  landed on a stranger. Links removed until the real handles are secured.
- Deploys were being served stale from the edge cache. Added an automatic purge
  to the deploy workflow.

**Also that day:** real photos of the girls added, with EXIF and GPS stripped
before upload — the photos were taken at home, and location metadata on
pictures of children is not something to publish by accident.

---

## Before this log

The site was built and put live without version control. There is no record of
what it looked like before 2026-08-03 beyond what is in the first commit, which
is why this file and `docs/history/` exist.

That is itself the first lesson worth writing down: **the record starts the day
you decide to keep one, and everything before that is gone.**
