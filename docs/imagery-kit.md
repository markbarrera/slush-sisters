# The imagery kit — how to add pictures to any page

A reusable toolkit for putting imagery on the site: a shared set of illustrated
SVGs, a copy-paste illustrated header, and the photo pipeline. This is the
*how*. [`visual-identity.md`](visual-identity.md) is the *why* — that it is an
illustration-led brand, that the character is a cup and never a child, and the
one real trap (do not let it look like an alcohol brand). Read that first if you
have not; this doc assumes those decisions are already made and just gives you
the parts.

The point of writing it down: nobody should have to re-decide what a Slush
Sisters picture looks like, and nobody should have to hand-draw a candy from
scratch when one already exists. Reuse the kit, follow the recipe, log what you
did.

---

## The two lanes

**1. Illustrated SVG — the primary lane.** The character and the motifs. Free,
weightless (they are code, not files, so they load instantly), impossible for a
competitor to copy, on-brand from the first stroke because they use the brand
tokens, and a cartoon cup is never a liquor ad. Reach for this first, on every
page.

**2. Real photos — the second lane.** The eight photos in `/img/photos` are the
human proof: the girls, the real cups, the real red slush. Use them where a page
needs to show that this is two actual kids and a real machine — not for the
finished-cocktail hero shot the visual-identity doc warns against. The shot list
for new photos lives in that doc.

Most pages want **both**: an illustrated band up top, a real photo further down.
`/flavors` is the current model of that.

---

## Where everything lives

| File / folder | What it is |
| --- | --- |
| `public/img/slushie.svg` | **Slushie**, the brand character. A cup with a face. Never redraw them as a child. |
| `public/img/motifs/` | The **motif kit** — reusable candy and fruit SVGs. Add new ones here. |
| `public/img/scenes/` | **Per-page hero scenes** — one bespoke illustration per page (lab, our-rules, community-events, office-parties). Not reused; each says what its page is about. |
| `public/img/hero.svg` | The two-cup homepage hero illustration. |
| `public/img/photos/` | Real photos, each as `<name>-640/1024/1600.webp` + a `<name>-1024.jpg` fallback. |

### The motif kit today

All 60×60, deep-blue outline, candy-bright fill — drop-in anywhere.

| File | Looks like | Good for |
| --- | --- | --- |
| `candy-ring.svg` | Pink sugar ring | The candy garnish, blue-raspberry ring, anything "candy" |
| `gummy-drop.svg` | Yellow squishy gummy | Mango, general candy, a soft accent |
| `sour-square.svg` | Green sugar-coated square | Sour Patch / watermelon, the tart flavors |
| `lime.svg` | Lime slice | Fresh Press, margarita, anything citrus |

Need something not in the list (a cherry, a pineapple ring, a slush drip)? Build
it with the recipe below and add it to the table. That is how the kit grows.

---

## The SVG recipe (so a new motif matches the old ones)

- **Canvas:** `viewBox="0 0 60 60"` for a motif (square). The character is
  `0 0 200 270` — a different, taller canvas.
- **Outline:** `stroke="#1a237e"` (the `--brand` deep blue), `stroke-width`
  around **4–4.5**, `stroke-linejoin="round"`. Thick and rounded. This single
  rule is what makes everything look like it belongs together.
- **Fill:** candy-bright, from the palette below. No heavy gradients, no thin
  elegant lines — think a good children's book, not a cocktail menu.
- **Gloss:** one white highlight blob, or a scatter of little white dots for a
  sugar coating. That is the whole trick.
- **Keep it small:** a handful of shapes. These are icons, not illustrations.
- **Accessibility:** if the motif carries meaning on its own, give it
  `role="img"` and an `aria-label`. If it is pure decoration next to text that
  already says the thing, use `alt=""` and `aria-hidden="true"` so a screen
  reader skips it.

**Candy palette** (fills): pink `#ff7aa8` / `#ff4081`, mango `#ffd24d`,
watermelon green `#86cf7a`, lime `#6cbf6a`, ice blue `#4fc3f7`. Outline is
**always** `#1a237e`.

---

## Using a motif

Two ways, pick per situation:

**As a file** — simplest, and the browser caches it once for the whole site:

```html
<img src="/img/motifs/candy-ring.svg" alt="" aria-hidden="true">
```

**Inlined** — paste the file's contents straight into the page's HTML when you
need CSS to control parts of it (positioning, `currentColor`, animating a
piece). `/fresh-press` inlines its limes for exactly this reason.

---

## The drop-in illustrated header ("hero-art" band)

This is the illustrated top band used on `/fresh-press` (class `.fp-art`) and
`/flavors` (class `.hero-art`): the character, centered, flanked by two motifs,
with a few sparkles, on a soft tinted panel. To put it on a new page:

**1. Paste this into the page's `<style>`** (swap the gradient tint to suit — the
`--wash` pale blue for a general page, `--citrus-pale` green for a Fresh Press
page):

```css
.hero-art{background:linear-gradient(180deg,var(--wash),#f4fbff);padding:36px 24px 30px;}
.hero-art .panel{max-width:800px;margin:0 auto;position:relative;display:flex;justify-content:center;min-height:210px;}
.hero-art .char{width:172px;height:auto;filter:drop-shadow(0 14px 22px rgba(26,35,126,.16));position:relative;z-index:2;}
.hero-art .candy{position:absolute;width:56px;height:56px;z-index:1;filter:drop-shadow(0 6px 10px rgba(26,35,126,.12));}
.hero-art .candy.l{left:5%;bottom:2px;transform:rotate(-12deg);}
.hero-art .candy.r{right:6%;top:8px;transform:rotate(14deg);}
.hero-art .spark{position:absolute;color:var(--ice);opacity:.6;font-size:1.1rem;z-index:1;}
.hero-art .spark.s1{top:6px;left:34%;}
.hero-art .spark.s2{bottom:24px;right:30%;font-size:.8rem;}
.hero-art .spark.s3{top:40%;left:12%;font-size:.9rem;}
@media(min-width:620px){
  .hero-art .char{width:210px;}
  .hero-art .candy{width:74px;height:74px;}
  .hero-art .candy.l{left:13%;}
  .hero-art .candy.r{right:13%;}
}
```

**2. Paste this markup right after `</header>`** (swap the two motif files for
whichever fit the page):

```html
<section class="hero-art">
<div class="panel">
<img class="candy l" src="/img/motifs/candy-ring.svg" alt="" aria-hidden="true">
<img class="char" src="/img/slushie.svg" alt="Slushie, the Slush Sisters cup character" width="210" height="284" fetchpriority="high">
<img class="candy r" src="/img/motifs/gummy-drop.svg" alt="" aria-hidden="true">
<span class="spark s1">&#10022;</span><span class="spark s2">&#10022;</span><span class="spark s3">&#10022;</span>
</div>
</section>
```

It is mobile-first (`min-width` query), needs no photo, and weighs almost
nothing.

> **A hero should be about its page.** The hero-art band is a *layout*, not a
> stamp. The character + candy is right for a product or flavors page. But for a
> page about something specific — the science, the rules, events, offices — draw
> a **scene that shows that**: a flask, a checklist, a neighborhood, the machine.
> Put those in `/img/scenes/` and reference one per page. Reskinning the same
> character across every page reads as lazy — it was the first thing we got told
> off for. When you build a new scene, follow the same recipe (deep-blue outline,
> candy-bright fill, squishy) so it still belongs to the family.

---

## The photo pipeline

Never hand-resize a photo or point a phone at a big file. The script does it.

1. **Drop the originals in a folder** (anywhere — phone exports are fine) and run:

   ```
   node scripts/optimize-images.js <folder-of-originals>
   ```

   It writes into `public/img/photos/`, producing for each photo:
   `<name>-640.webp`, `<name>-1024.webp`, `<name>-1600.webp`, and a
   `<name>-1024.jpg` fallback. Name the source files
   `subject-context.jpg` (e.g. `sisters-cheers.jpg`) — the name carries through.

2. **It strips all metadata**, including the GPS coordinates a phone writes into
   every photo. These are pictures of children; their location does not ship.
   The script proves the EXIF is gone rather than assuming it, and it applies the
   photo's rotation first so portraits do not come out sideways.

3. **Put it on the page** with `<picture>` — a WebP source for modern browsers,
   a JPEG `<img>` fallback for the rest:

   ```html
   <picture>
   <source type="image/webp" srcset="/img/photos/NAME-640.webp 640w, /img/photos/NAME-1024.webp 1024w" sizes="(max-width:540px) 92vw, 380px">
   <img src="/img/photos/NAME-1024.jpg" alt="Describe what is actually in the photo" loading="lazy" decoding="async">
   </picture>
   ```

   - `sizes` tells the browser how wide the image will be, so a phone pulls the
     **640** and never the 1024. Weigh every kilobyte.
   - `loading="lazy"` for anything below the fold. For a hero image that is
     visible without scrolling, drop `lazy` and add `fetchpriority="high"`
     instead.
   - The `alt` describes the real photo. Get Harper (11) and Finley (8) the
     right way round.

---

## Adding imagery to a page — the checklist

- [ ] Illustration first. Can the hero-art band + a motif or two do the job?
- [ ] Reuse a motif from the kit, or add a new one following the recipe.
- [ ] Decorative art → `alt="" aria-hidden="true"`. A meaningful photo → real `alt`.
- [ ] Verify at **390px**: no sideways scroll, something real above the fold, and
      the phone is pulling the 640 WebP. Use `scripts/snapshot.js`, or a quick
      Playwright check — look at the output, do not assume.
- [ ] Add a line to the running log below.

---

## Running log — document as we go

- **2026-08-05** — Built the motif kit (`candy-ring`, `gummy-drop`,
  `sour-square`, `lime`) and put the illustrated identity on **`/flavors`**,
  which had no imagery at all: the hero-art band with Slushie and candy motifs, a
  marquee, and a candy-garnish photo pair (`sisters-cheers` + `sisters-cups`).
  Same pass reflowed the page to lead with the Fresh Press premium tier. This
  wrote down the kit itself. `/fresh-press` already carried the first hero-art
  proof from the visual-identity work.

- **2026-08-05** — Gave the four text-heavy pages (**`/lab`, `/our-rules`,
  `/community-events`, `/office-parties`**) a **bespoke hero illustration each**,
  stored in `/img/scenes/`. The first attempt reused the Slushie character on all
  four with only the candy swapped; Mark's note: *don't put basically the same
  character on every page &mdash; make each unique and contextually relevant.*
  Right call. So each page now has its own scene: `/lab` a flask of slush + a
  thermometer + a measuring dial; `/our-rules` a checklist with a "7" award
  rosette; `/community-events` a neighborhood under party bunting;
  `/office-parties` the dual-tank machine under holiday lights. Same house style
  (deep-blue outlines, candy-bright fills, squishy), different subject each time.
  Verified all four at 390px.

- **Next up**: `/about` and `/pricing` could each take one real photo. The
  real-photo shot list (limes halved, a hand squeezing one, the candy rims, the
  machine pouring) is the girls' afternoon, then `node scripts/optimize-images.js`
  and they slot straight into the frame above. Growing the motif library (cherry,
  pineapple ring, strawberry, a slush drip, more Slushie poses) is the other easy
  win.

---

## What the site has right now

The full, always-current list is `/inventory`. This is just the imagery view.

| Page | Imagery today | Wants |
| --- | --- | --- |
| `/` (home) | Hero photo + illustrated cups + photo doors | Good |
| `/flavors` | Hero-art band, motifs, marquee, photo pair | Good |
| `/fresh-press` | Hero-art band (inline limes) | A fruit-and-making photo would lift it |
| `/grown-ups` | Hero photo | A motif or two in the text |
| `/about` | Photos of the girls | Good |
| `/lab` | Bespoke scene (flask + thermometer + dial), text hero, marquee | Good |
| `/our-rules` | Bespoke scene (checklist + "7" rosette) | Good |
| `/community-events` | Bespoke scene (neighborhood + bunting) | Good |
| `/office-parties` | Bespoke scene (the dual-tank machine + lights) | Good |
| `/pricing` | None | One photo, or a motif accent |

Keep this table honest as pages change.
