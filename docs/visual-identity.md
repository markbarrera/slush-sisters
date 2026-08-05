# Visual identity — the image gap, and how to fill it

Mark, 2026-08-05: *we're missing images on /fresh-press and a lot of pages.
Should we build a design aesthetic or a character to represent the brand and
use it everywhere? Can we use photorealistic images of amazing margaritas?*

He's right — it's the biggest gap on the site. The pages are well-written and
visually bare. Here is the honest map of what's possible, what I can build, and
one real brand trap to avoid.

---

## What I can and cannot make, plainly

| Kind of image | Can I produce it here? |
| --- | --- |
| **Real photos** of the girls, the machine, cups, limes | No — those are camera work. The eight photos in `/img/photos` are all we have. |
| **Photorealistic AI images** (a glossy margarita, a studio cup) | No — there is no image generator wired into this environment. Those need a separate tool or a photographer. |
| **Vector illustration / a character / motifs / patterns** | **Yes.** I can hand-build these as SVG — a mascot, candy and fruit icons, slush textures, decorative borders. On-brand, free, infinitely reusable, and they load instantly because they are code, not files. |
| **Art direction** (the rules everything follows) | **Yes** — that's this document. |

So the realistic path is: **an illustrated identity I can build now**, plus **a
short real-photo shot list the girls can knock out on a phone in an afternoon**,
and photorealistic cocktail imagery treated with caution — see the trap below.

---

## The trap: do not make this look like an alcohol brand

Mark asked about photorealistic margaritas on `/fresh-press`. The instinct is
right — the page looks thirsty for a hero image. But a page of glossy,
professionally-lit cocktail photography is how **adult liquor brands** look, and
the entire positioning of this business is the opposite:

- `/promise` exists to say the girls never touch the alcohol.
- The differentiator is the **kids' tank**.
- The founders are 8 and 11.

A styled boozy-cocktail hero quietly undoes all three. It makes an 11-year-old's
company read like a tequila ad, which is exactly the "minors marketing alcohol"
optics the case review warned about.

**The safe and better version of the same instinct:** photograph (or illustrate)
the *fruit and the making*, not the finished cocktail. A cutting board of halved
limes. A hand squeezing one. Agave pouring. A frozen cup with the candy on the
rim and condensation on the side. That is appetizing, premium, completely
honest, and it says "made by hand this morning" instead of "drink tequila." It
also happens to be the exact content the marketing playbook already wants filmed.

If a single photorealistic drink shot is ever used, it should be the *frozen
cup with the candy garnish* — the product as served, not a bar cocktail — and it
should sit next to the real fruit, not alone.

---

## The recommendation: an illustrated brand, with a character

The strongest, cheapest, most defensible direction is **illustration, not
photography, as the primary visual language**, with a simple repeatable
character. Reasons:

1. **It is buildable now, by me, for $0.** SVG. No shoot, no generator, no
   asset licensing, no file weight.
2. **It suits the owners.** A hand-drawn, slightly wonky, candy-bright world is
   what an 8- and 11-year-old's brand *should* look like. Polished stock
   photography would read more manufactured than any copy ever could.
3. **It is ownable.** Anyone can buy the same stock cup photo. Nobody else has
   your character.
4. **It dodges the alcohol trap entirely** — a cartoon cup is never a liquor ad.

### The character

Proposal: **a slushie cup with a face** — the candy garnish is its hat, the
straw its cowlick, a little wobble to it (squishy, which is the aesthetic the
girls' age group loves right now). Not a person, not either sister drawn as a
mascot — a cup, so it stays about the product and never puts a cartoon child on
a marketing asset. Working name for scoping only: **"Slushie."**

It can appear:
- Full-body on empty hero spaces (the `/fresh-press` gap, `/office-parties`, the game)
- As a tiny reaction face in the corner of callouts
- Different flavor colors = different cup characters (a collectible set — which
  is also the game's reward system, so the two share art)

**This is a decision for the girls**, the same way the colors were. They should
draw it, or draw over my first pass. A character the owners designed is worth
ten times one a contractor delivered — and "watch us design our mascot" is a
content series.

### The palette and texture, already decided

The brand tokens already exist (`--brand` deep blue, `--ice` light blue,
`--pop` pink, the candy colors). The illustration uses those, so it is coherent
with every page from the first stroke. Texture direction: soft, rounded,
squishy, thick outlines, candy-bright fills, a little grain. No gradients-heavy
"tech startup" look; no thin elegant lines. Think a good children's book, not a
cocktail menu.

---

## What I would build, in order

1. **A hero illustration for `/fresh-press`** — the fruit-and-cup direction
   above, filling the gap Mark pointed at, so we prove the approach on the page
   that needs it most.
2. **The "Slushie" character, v1** — one SVG, a few poses, in the brand colors.
   Ship it small (a corner of the homepage) and let the girls react.
3. **A motif kit** — candy, fruit, and slush-drip SVGs to break up text-heavy
   pages (`/lab`, `/our-rules`, `/community-events`) that are currently walls of
   words.
4. **A real-photo shot list** for the girls' phone: limes halved, a squeeze, the
   candy rims, the machine pouring, the two of them mid-setup. Ten shots,
   stripped of EXIF/GPS as always, that slot into the illustrated frame.

Steps 1–3 I can do now. Step 4 is the girls' afternoon.

---

## Decisions needed from Mark

1. Illustration-led identity with a character — yes?
2. The character is a **cup, not a child** — agreed? (This is the safety line.)
3. Photorealistic cocktail imagery: hold off, and go fruit-and-cup instead —
   agreed?
4. Green-light me to build the `/fresh-press` hero and a first "Slushie" pass
   for the girls to draw over?

---

## Decided & built (2026-08-05)

Mark's answers: **1 yes, 2 yes, 3 hold off (fruit-and-cup; maybe revisit
photoreal later), 4 yes.**

- **`public/img/slushie.svg`** — the first "Slushie" pass. Lime-green cup, thick
  deep-blue outlines, a face, pink straw, lime garnish. A cup, not a child.
- **`/fresh-press` hero** — the character on a citrus panel with two lime halves
  and sparkles. The image gap Mark pointed at is filled on that page.
- Slushie now also appears on the **arcade** (`/play`) and as the tap-target
  **stand in Slushie Street**.
- The palette/type/imagery rules moved into **`docs/brand.md`** as the
  system's single source of truth; `CLAUDE.md` points at both files.

**Still open (steps 3–4 in "What I would build"):** a motif kit for the
text-heavy pages (`/lab`, `/our-rules`, `/community-events`), and the real-photo
shot list for the girls' afternoon. And the girls still get to **draw over
Slushie** — the first pass is deliberately a starting point, not the final mark.
