# Strategy — what this site is for

Written 2026-08-03, after the goal was restated as: *the money is not in the
rentals, it is in the brand, and the brand is the girls.*

That reframing matters, because it inverts what the site should optimize for.
This document records the search data, what it does and does not justify, and
the architecture that follows.

---

## 1. What the search data actually says

Pulled from Ahrefs on 2026-08-03, US volumes.

| Keyword | Monthly searches | Difficulty | CPC |
| --- | --- | --- | --- |
| margarita machine rental | 900 | 0 | $0.80 |
| slushie machine rental | 200 | 0 | $0.70 |
| margarita machine rental near me | 150 | 37 | $0.80 |
| frozen margarita machine rental | 90 | 0 | $0.80 |
| frozen drink machine rental | 90 | 8 | $0.70 |
| **margarita machine rental austin** | **70** | **16** | **$1.00** |
| frozen drink machine rental near me | 40 | 0 | $0.90 |
| slushie machine rental near me | 30 | 0 | $0.90 |
| daiquiri machine rental | 30 | 0 | $0.60 |
| austin margarita machine rental | 20 | — | $0.70 |
| party supply rentals lakeway tx | 10 | — | — |
| bounce house rental lakeway tx | 10 | — | — |

Two findings worth sitting with.

**The category term is "margarita machine," not "slushie machine."** 900 searches
a month versus 200. The site currently uses the word "margarita" exactly once,
as a flavor name. In pure search terms it is optimized for the smaller half of
its own category.

**Lakeway-level search demand is effectively zero.** 10 searches a month, for
adjacent categories, not this one. There is no meaningful hyperlocal search
market. The addressable local term is Austin-level: ~90/mo combined across
`margarita machine rental austin` and `austin margarita machine rental`.

### Who currently ranks for "margarita machine rental austin"

| # | Site | Domain Rating | Est. traffic |
| --- | --- | --- | --- |
| 1 | woolfsritas.com | — | — |
| 1 | atxmargrentals.com | 0 | 10 |
| 1 | hillcountrymargaritas.com | 4 | 8 |
| 2 | margaritaequipment.com | 5 | 27 |
| 4 | reddit.com/r/Austin thread | 95 | 8 |
| 5 | crazypartyritas.com | 0 | 9 |
| 6 | Yelp category page | 94 | 5 |
| 7 | margaritastogo.com | 9 | 12 |
| 10 | captainouzos.com | 0 | 2 |

Every genuine competitor has a Domain Rating between 0 and 9 and pulls fewer
than 30 organic visits a month. Two of the ten slots are Reddit and Yelp, which
means Google could not find ten decent local pages to fill the page with. This
is about as soft a competitive set as local SEO gets.

### The honest arithmetic

Winning the Austin term outright is realistic within a few months. It is also
worth roughly this much:

> 90 searches/mo × ~30% click share at #1 × ~10% enquiry-to-booking ≈ **2–3
> bookings a month**, or **$500–$750/mo** at $250 a rental.

Real money for two kids. Not a brand. This is the number that justifies doing
local SEO *well and cheaply*, and justifies not building the whole site around
it.

---

## 2. What that means for the site

The rental business is the **story engine**. It is what makes the content
authentic — two sisters actually running a real business, with real customers,
real setbacks, and real money. The content is the asset. The site is where the
content converts into things that outlast a platform.

So the site has three jobs, in priority order:

1. **Convert an audience the platforms only rent to them.** Followers on
   Instagram and TikTok belong to Instagram and TikTok. An email list belongs to
   the girls. This is the single highest-value thing the site can do and it does
   not do it at all today.
2. **Be the credible landing place** for anyone evaluating them — a reporter, a
   brand-partnership manager, a podcast booker, a school. These people arrive
   from a bio link and decide in about eight seconds whether this is a real
   thing.
3. **Book local rentals.** Still matters, still pays, but it is the third job,
   not the first.

### Proposed architecture

> **Superseded, 2026-08-04.** The architecture below was drawn before the case
> review, which changed the underlying picture — see `docs/case-review.md`,
> Part 3. The three jobs above still hold. The page list below does not.

```
/                     The sisters first, the machine second.
                      Social proof above the fold. Email capture.
/book                 Booking. The local conversion path.
/margarita-machine-rental-austin
                      The SEO page. Targets the real category term.
                      Exists to be found; links back to /book.
/pricing  /flavors    Support pages for the rental path.
/story                Who they are, how it started, what they have learned.
                      The page a journalist or brand actually reads.
/press                Logos, photos, a one-paragraph bio, contact.
                      Makes "can we feature you" easy to say yes to.
/follow               Aggregated Instagram + TikTok. The content hub.
```

Note what changed: `/about` becomes `/story` and gets promoted from a footnote to
a primary page, and the alcohol-adjacent SEO term gets its own page rather than
being pushed onto a brand fronted by children.

### Keeping "margarita" and the kid brand apart

The commercial term is an adult, alcohol-adjacent one. The brand is two girls
aged 8 and 10. Both facts are true and they should not be blended on the same
page.

The clean split: `/margarita-machine-rental-austin` is a straightforward local
service page written for adults booking a party. The homepage, `/story`, and
`/follow` are the brand. The machine is the same machine — one page sells the
rental, the other tells the story.

---

## 3. Featuring the Instagram and TikTok content

The requirement is that new content the girls post shows up on the site. Three
ways to do it, in increasing order of effort:

| Approach | Effort | Trade-off |
| --- | --- | --- |
| Manual — a handful of hand-picked embeds, updated occasionally | Lowest | Goes stale; someone has to remember |
| oEmbed — paste a post URL, the platform renders it | Low | Each embed is a heavy third-party script; slow, and it breaks if a post is deleted |
| Scheduled fetch — a Worker pulls recent posts on a cron into KV, the page renders lightweight cards linking out | Medium | Fast, styled, always current. Needs an Instagram Graph API token tied to a Business account |

**Recommendation: scheduled fetch.** It is the only one that stays current
without anyone maintaining it, and it keeps the site fast, which matters because
most visitors arrive on a phone from a bio link. It also degrades gracefully — if
the API call fails, the last good set stays cached rather than the section
vanishing.

This needs a Cloudflare API token to build, since it involves a Worker, a cron
trigger, and a KV namespace.

---

## 4. Constraints worth deciding deliberately

These are not blockers, but they are cheaper to decide now than to unwind later.

**The `@slushsisters` Instagram handle is already taken.** As of 2026-08-03 it
belongs to an unrelated account ("Soapmonika", 3 followers, 21 posts). The site
currently tells visitors to find them there, in the footer of every page and on
`/book`. Anyone following that instruction lands on a stranger. Before any brand
building starts, the real handles need to be secured across Instagram, TikTok,
and YouTube — ideally the same string on all three — and every reference on the
site updated to match.

**Decided by Mark, 2026-08-03 — do not re-litigate these.**

- *School name visible on a shirt is fine.* It reads as local proof, which is
  the point. Photos are not screened for it.
- *The home bar in frame is fine, and useful.* The machine's main commercial
  use is margaritas, "margarita machine rental" is the highest-volume term in
  the category, and a stocked bar behind the machine reads as competence to the
  adult doing the booking. No cropping needed on those shots.
- *First names are in use.* Finley (older) and Harper (younger).

The one thing that did change: the "78734" ZIP came out of the page footers.
"Lakeway, Bee Cave & Lake Travis" serves customers and local SEO equally well
without publishing a precise home area alongside photos. Street address and a
regular schedule still stay off the site.

**Platform minimum age is 13.** Both girls are under it. The accounts have to be
parent-operated, and saying so plainly in the bio is both honest and the thing
that protects the accounts from being removed later.

**An email list of fans may include children.** If under-13s can submit an email
address, COPPA obligations attach. The simple way out is to collect email only
on the booking path, where the person submitting is a parent booking a party,
and to keep the fan-follow path pointed at the social platforms instead.

**Customer bookings now contain home addresses.** Collecting the event address is
correct — they deliver a machine to it. It does mean the booking destination is
somewhere real personal data accumulates, and it should be somewhere Mark
controls rather than a free tier that emails it around. See
`docs/booking-form.md`.

---

## 5. Sequence

1. **Secure the handles.** Everything downstream depends on the name. Blocked on
   nobody.
2. **Turn the booking form on.** It has been discarding requests. Blocked on a
   destination decision.
3. **Ship the SEO page** for `margarita machine rental austin`. Blocked on
   nothing — the competitive set is weak enough that a good page and a Google
   Business Profile is most of the work.
4. **Rebuild the homepage** around the sisters, with email capture. Blocked on
   photos — real ones, of them and the machine.
5. **Build the social aggregation Worker.** Blocked on a Cloudflare token and a
   real Instagram Business account.

The recurring blocker across 2, 4, and 5 is not technical. It is photos,
handles, and a decision about where booking data lands.
