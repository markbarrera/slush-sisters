# The bar program and the category question

Two reports, 2026-08-04. One asks *can we actually make a drink that stands
next to a good Austin bar's frozen margarita*. The other asks *is "margarita
machine rental" a category we can redefine, or one we should just win*.

They are in one file because the answers depend on each other. A published
standard with nothing behind it is marketing. A good recipe nobody has a name
for is a secret.

---

## Part 1 — The bar program

### The number to hit

**13.5 Brix in the finished drink, under 9% ABV.**

Below about 12 Brix the mix freezes too hard and the machine's auger strains or
stalls. Above about 16 it never sets and you get a cold drink instead of a
frozen one. 13.5 sits in the middle with room on both sides for a hot day.

Alcohol pushes the same direction as sugar but far harder — ethanol's
anti-freezing power is roughly 7.4× sugar's per gram. Past about 9% ABV in the
finished drink there is no amount of sugar adjustment that saves the texture.

### The luckiest fact in this whole business

**The girls only ever handle a zero-alcohol base. So their refractometer
reading needs no alcohol correction.**

This matters more than it sounds. Measuring sugar in an alcoholic mix is the
hardest measurement problem in frozen-cocktail batching — ethanol bends light
differently than sugar does, so a refractometer reads high and you need a
correction table, a hydrometer cross-check, or a lab. Because the tequila goes
in at the party, in the tank, by an adult, the thing the girls measure is
sugar and water and nothing else. The number they read is the number.

That is not a workaround. It is a better process than most bars run, and it
happens to fall out of the one constraint we could not have changed anyway.

### The arithmetic

The adult adds alcohol at the party, which dilutes the base. For a standard
pour that works out to:

```
Finished Brix = Base Brix × 0.8
```

So to land a finished drink at 13.5 Brix, **build the base to 16.9 Brix.**

### Correction, 2026-08-04: that is not one number, it is two

Building the base builder for `/lab` surfaced something the report missed.
16.9 is correct **only for the tank a grown-up pours tequila into.** Nothing is
added to the kids' tank, so a 16.9 base stays at 16.9 — which is above the
~16.5 ceiling and produces a drink that never properly sets. Sweet, slumping,
technically not frozen.

**Fresh Press therefore needs two builds, not one:**

| | Base target | What happens to it | Lands at |
| --- | --- | --- | --- |
| Grown-ups' tank | **16.9 Brix** | diluted ~0.8× by the pour | 13.5 |
| Kids' tank | **15 Brix** | nothing added | 15 |

Same limes, same agave, less agave in the kids' batch — at 3 gallons and 15%
lime, about 8.7 cups instead of 9.9. The calculator on `/lab` shows the gap and
names the fix.

This is a small correction with an operational tail: **Fresh Press means making
two batches on the morning of a party, not one.** That is a real labour cost
that the $20–40 ingredient figure does not capture, and it should be weighed
before the tier goes live.

### Salt

Salt depresses the freezing point about **11× more than sugar, gram for gram**
— it dissociates into two ions, and its molecules are light. A rim of salt is
free. Salt *in* the mix is a lever with a very short throw: a quarter teaspoon
across a five-gallon tank is a real texture change. Treat it as a garnish
decision, not a recipe ingredient, until it has been tested.

### What a machine margarita actually is

> A machine margarita is a blender margarita with its ice pre-melted into the mix.

This is the sentence that reframes the whole product. A blender drink is
ice plus liquid, whipped. A machine drink is one liquid, frozen slowly, with
the water already in it. Everything that makes blender drinks separate,
water down, and go grainy in twenty minutes is the ice. We don't have ice.

**The binding constraint is the machine's holding temperature, not the
recipe.** A recipe that is perfect at −2°C is soup at 0°C. Any recipe we
publish has to name the machine setting alongside the ingredients, or it is
not reproducible.

### What the premium tier actually costs

**$20–40 per party in ingredients.** That is the whole delta between bulk
syrup and fresh-squeezed citrus at our volume.

The labour is the real cost, and there is a fix: **super juice** — the
citric/malic acid and oil-extraction technique — turns roughly **50 limes into
about 7**. Same acid, same aromatics, an eighth of the squeezing and an
eighth of the grocery bill.

That number ($20–40) is what makes a premium tier possible at all. It is a
pricing decision, not a cost problem — and pricing stays with Mark.

---

## Part 2 — The category question

### The verdict

**No new category. A new *subcategory*, with a published standard.**

Inventing a category means teaching a market a word it does not have while
also selling to it. Nobody in Lakeway is searching for a word we made up. The
900/month "margarita machine rental austin" searches are the business; a new
category name competes with that, it does not add to it.

### What the market actually looks like

- **ATX Marg Rentals already sells dual-chamber at $350.** So *two tanks* is
  not a moat. It is a feature we should say out loud because most customers do
  not know it exists, but it is a commodity, not a differentiator.
- **But all five of their flavors are adult.** Two tanks, two adult drinks.
- **Ninja SLUSHi at $269.99** — 91,000 searches a month — is eating the low
  end. For a small party, buying beats renting now. That floor is rising.

So the vacancy is not a *feature* vacancy. It is a **use** vacancy: everyone
sells two tanks of grown-up drinks, and nobody has said the obvious thing —
that the second tank should be the kids'.

### The names

The report proposed two: **"the everybody bar"** as the category name, and
**"the kids' tank"** as the retrieval cue.

**"The everybody bar" was killed by Mark on 2026-08-04.** No long
deliberation — it did not survive being read. That is the correct way for a
name to die, and it is exactly the test the report itself specified: a name
you have to explain is a slogan, and slogans do not survive a driveway.

**"The kids' tank" is adopted**, and it was always the stronger of the two.
The report said so itself — *if only one of these survives, it should be this
one.* It is short, concrete, explains itself with no help, and it names the
one gap in the market that is actually real: every competitor fills both tanks
with adult drinks.

It is now live on `/flavors`, `/pricing` and as rule 1 of `/our-rules`.

**Two constraints still apply**, and one of them is a hard rule:

> **Strict layering: never change the SEO pages' language.** The six
> service-area pages and `/margarita-machine-rental-austin` exist to catch
> people typing the words they already use. A new name goes on `/`, `/about`,
> `/pricing` — the pages people land on once they are already here. It never
> replaces "margarita machine rental" on a page whose entire job is to match
> that phrase. Getting this wrong loses the 900/month term and gains a word
> nobody searches for.

And the report's own abandonment condition:

> If after twenty parties customers are still describing us to their friends
> as "the margarita machine people," the name did not take. Drop it. The
> retrieval cue is the customer's word, not ours — we can propose it, we
> cannot assign it.

This now applies to "the kids' tank." Listen for it. If nobody repeats it back
by party twenty, it goes.

### The published standard

The report recommended nine items, weighted toward **cost-to-imitate** — the
point of publishing is that a competitor reading it either has to do the work
or visibly not do it. Anything a rival can match with a sentence on their
website is worth nothing.

**Seven shipped. Two were cut after Mark read them**, and the cuts are more
instructive than the list:

- **"Half the machine is always for kids" is a bad business rule.** It sounds
  generous and it commits us to wasting a tank at every adult-only party —
  which is the *entire* winter cold-drink market this business is also chasing.
  Rewritten as what was actually meant: the kids' option is always available
  and never costs extra. That is keepable and it is still something no
  competitor offers.
- **"Every kids' flavor has a no-dye version" was not true yet.** Publishing an
  aspiration in the present tense on a page whose whole premise is *you can
  check these* would have made the page the thing it argues against. It lives
  on `/fresh-press` as work in progress instead.

Both failures are the same failure: a rule that costs nothing because you
cannot actually be caught breaking it. The count going 9 → 7 is on the page
itself, with the reasoning, because a standard that quietly shrinks is worse
than one that explains why.

### One legal correction

**A certification mark is the wrong instrument.** Under 15 U.S.C. §1064(5),
the owner of a certification mark **cannot sell the service it certifies** —
the whole point is that the certifier is disinterested. If Slush Sisters
certified "the everybody bar," Slush Sisters could not rent machines. A
published standard under our own name is the right form, and it is free.

---

---

## Part 3 — What shipped, 2026-08-04

Mark's instruction was *"you don't need my answer to just build. I can walk you
back later if needed."* So the open decisions were made rather than parked.
Each one below is reversible, and each says what it would cost to reverse.

### Fresh Press is priced at $375

Classic stays at $250. Fresh Press is $375 — a **$125 premium on a $20–40
ingredient cost**, which is deliberate and is exactly what the tiers doc
argued for: the price gap should be much larger than the cost gap, because
what is being sold is *made this morning by hand*, not limes.

Two reference points made $375 the number rather than $325:

- ATX Marg Rentals sells a **dual-chamber machine with bulk syrup at $350**.
  Pricing Fresh Press below that would say it is a lesser product than a
  syrup rental, which is the opposite of true.
- Ninja's countertop machine at **$269.99** is compressing everything near
  $250 from below. The answer to a rising floor is a taller ceiling, not a
  discount.

**To reverse:** two numbers on `/pricing` and `/fresh-press`. Five minutes.

### The no-dye kids' version is not an upcharge

It is included in Fresh Press at the same price, and this is now rule 5 of the
published standard. Charging a parent extra to remove Red 40 from a
six-year-old's drink is a bad thing to do and it would read as one.

**To reverse:** don't. If the tier needs more margin, raise the tier.

### Fresh Press ships as a page, not as a bookable product

The freeze test has not been run. Selling a $375 recipe that can seize the
machine is precisely the failure `product-tiers.md` warns about, so
`/fresh-press` carries an explicit **"in testing — you cannot book this yet,
and here is why"** status block, and `/pricing` marks the tier the same way.

This is not hedging. A page that says *we are testing this before we sell it
to you* is a stronger proof of the standard than a page that just claims a
drink is good.

**To flip it live:** delete the status block, change one button. The page is
already written as a product page.

### Seven rules published at `/our-rules`

Each carries a visible **"costs us:"** line — half the machine at every party,
an hour of every Sunday, the money everybody else makes on a heatwave. That
line is the whole mechanism: a rule a competitor can match with a sentence is
worth nothing, so each one had to cost something real to qualify.

### Still open, still Mark's

1. **The base Brix target (16.9) is untested.** Our syrup's Brix has never been
   measured. That is experiment #1 in `/lab`, and it gates the recipe card and
   therefore the Fresh Press launch.
2. **Split tiers across the two tanks** — one Classic, one Fresh Press. The
   machine does not care; the pricing does. `/fresh-press` currently answers
   this with "ask us," which is honest and does not scale.
3. **Whether $375 survives contact with a customer.** Nobody has been quoted
   it yet.
