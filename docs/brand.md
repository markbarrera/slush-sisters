# The Slush Sisters brand system

The single source of truth for how the site looks and sounds. If you are
changing anything visual, read this first, then `docs/visual-identity.md` for
the imagery direction and the character. `CLAUDE.md` points here on purpose —
this file is meant to be the thing a new session latches onto.

There is no shared stylesheet (see `CLAUDE.md`: CSS is inline per page). That
makes this document the only place the system lives as one piece. When you
change a shared token, you change it in every page that uses it — this file
tells you what the right value is.

---

## Colors

The tokens below are the real ones, lifted from the pages. Most pages declare
them in a `:root` block at the top of their inline `<style>`. Use the token
names; keep the hex values identical across pages.

### Core palette (on nearly every page)

| Token | Hex | Role |
| --- | --- | --- |
| `--brand` | `#1a237e` | Deep blue. Headings, wordmark, primary text, thick illustration outlines. |
| `--ice` | `#4fc3f7` | Light blue. The second half of the wordmark, accents, slush fills. |
| `--ice-deep` | `#29b6f6` | A deeper light blue for hover/active and small accents. |
| `--wash` | `#e8f4fd` | Pale blue. The default page background wash. |
| `--blush` | `#fff5f7` | Pale pink. The warm end of background gradients. |
| `--pop` | `#ff4081` | Hot pink. The candy/straw accent, highlights, “fun” moments. |
| `--pink-pale` | `#ffd6e7` | Soft pink for fills and panels. |

### Text that has to pass contrast

DM Sans pink and blue at full saturation fail on white. Use these darker inks
for **text**, and keep `--pop`/`--ice` for shapes and fills.

| Token | Hex | Role |
| --- | --- | --- |
| `--ink-pink` | `#c2185b` | Accessible pink for text/labels. |
| `--ink-ice` | `#0165a8` | Accessible blue for links/text. |

### Buttons

| Token | Hex | Role |
| --- | --- | --- |
| `--cta` | `#0277bd` | Primary button blue. |
| `--cta-deep` | `#01579b` | The button’s drop-shadow / pressed edge. |

### Fresh Press (the premium citrus tier)

| Token | Hex | Role |
| --- | --- | --- |
| `--citrus` | `#2e7d32` | Fresh Press green. Also the site’s “good/success” green (`--good`). |
| `--citrus-pale` | `#eef7ee` | The pale green panel behind Fresh Press content and the `/fresh-press` hero. |

### Flavor accents

Each flavor has an accent color, usually assigned to a local `--c` on the card.
Keep these consistent — they’re used on `/flavors`, in Slush Rush, and on the
candy dots.

| Flavor | Hex |
| --- | --- |
| Watermelon | `#ff5c72` (`#ff6b6b` on `/flavors`) |
| Strawberry | `#ff8fa0` |
| Blue Raspberry | `#4fc3f7` |
| Mango | `#ffd54f` |
| Lime / Margarita | `#7ed957` (`#7ec97e` in-game) |
| Piña Colada | `#ffcf6b` |

### Utility

`--line-strong:#767b85` for stronger borders. `--on-brand:#fff` for text on
deep-blue grounds. Some pages (e.g. the ledger) also declare a dark-mode set
(`--panel`, `--ink`, `--ground` with two values) — those are page-local.

---

## Type

- **Baloo 2** — headings and the wordmark. Rounded, friendly, has real tabular
  figures. Loaded from Google Fonts. **Weights 400–800 only. Never 900** — it
  triggers faux-bold synthesis that thickens strokes unevenly, which is exactly
  what an embroiderer (a real customer output) cannot use.
- **DM Sans** — body copy.

### The tabular-figures rule (easy to get wrong)

DM Sans has **no tabular figures at all** — no `tnum` feature and a 93%
digit-width spread — so `font-variant-numeric: tabular-nums` on it silently
does nothing. **Any number that lines up in a column uses the `.tabular`
utility**, which switches that text to Baloo 2 (which does have them). Prices,
scoreboards, ledgers, game money — all `.tabular`.

Do not use Sour Gummy. It was removed 2026-08-04: its zero is permanently
slashed (three contours, no alternate glyph, no feature to toggle it), so every
price read like code, and it had no tabular figures either.

---

## Voice

- **US English everywhere.** color, neighborhood, flavor, favorite, center,
  license, math. Idiom too: “on the weekend” not “at the weekend”, “candy” not
  “sweets”, “mom” not “mum”. (Internal `docs/*.md` notes are exempt.)
- First person, in the sisters’ own voice. Short sentences. No marketing
  throat-clearing. Plain and honest.
- **Get the ages right: Harper is 11, Finley is 8.** This was published
  backwards across the whole site once.

---

## Illustration & imagery

Full detail in `docs/visual-identity.md`. The short version:

- **Illustration-led, not photography.** The primary visual language is
  hand-built SVG in the brand colors — a mascot, fruit, candy, slush motifs.
  It’s free, loads instantly (it’s code), and it’s ownable.
- **The mascot is “Slushie”** — a slushie *cup* with a face (`/img/slushie.svg`).
  A cup, **never a child**, so every asset stays about the product and no
  cartoon child ends up on a marketing image. It’s a first pass the girls are
  meant to redraw in their own style — like they chose the colors.
- **No glossy alcohol-cocktail photography.** A styled margarita hero makes an
  11-year-old’s business read like a tequila ad. If a realistic drink shot is
  ever used, it’s the *frozen cup with the candy garnish*, next to real fruit —
  the fruit-and-cup direction, not the bar cocktail.
- **The candy garnish on every cup is the differentiator** and appears on most
  pages on purpose.

### Texture direction

Soft, rounded, squishy; thick deep-blue outlines; candy-bright fills. Think a
good children’s book, not a cocktail menu. No gradient-heavy “tech startup”
look, no thin elegant lines.

---

## Mobile first

The default, not a checkbox — nearly everyone arrives on a phone. Build and
judge at **390px wide first**, then grow with `min-width` media queries. Full
rules in `CLAUDE.md` (“Mobile first”). Non-negotiables: the Book action is
never behind a tap; tap targets ≥ 44×44px; never scroll sideways; verify on a
real phone viewport with `scripts/snapshot.js`.

---

## The arcade aesthetic (the games)

The games (a growing set under `/play` — Playhouse, Catch, Style, Slush Rush,
Slushie Street) share the palette above but push the “squishy” texture furthest:
big pill buttons with a solid-color drop shadow that compresses on `:active`,
cups that squish on tap, coins that float up, tiny Web Audio blips (no sound
files). The mascot often appears as an expressive DOM character (a cup body with
a face whose eyes blink and mouth changes) rather than the static SVG, so it can
move and react. They are full-screen, no site header, and orphaned. See
`docs/game.md`.
