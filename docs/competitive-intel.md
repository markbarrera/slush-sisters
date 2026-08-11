# Competitive intelligence — margarita machine rental, Austin TX

Compiled 2026-08-11. A living document: update it as we learn more.

---

## Our baseline — GSC data (Jul 14 – Aug 8 2026)

The site is pre-launch. Organic search is not yet a channel.

| Metric | Value |
| --- | --- |
| Total clicks (28 days) | 21 |
| Total impressions | 93 |
| Identified queries | 2 (both irrelevant DFW suburbs) |
| Visibility for "margarita machine rental" | None |
| Visibility for "frozen drink machine rental" | None |
| Visibility for "slushie machine rental" | None |

Almost all 21 clicks are branded — someone already knew the name and searched
"slush sisters." The homepage accounts for 17 of them at an average position of
4.0 with a 47% CTR, which is healthy for a branded query.

### Top pages by clicks

| Page | Clicks | Impressions | CTR | Avg position |
| --- | --- | --- | --- | --- |
| Homepage | 17 | 36 | 47.2% | 4.0 |
| /about (http) | 3 | 6 | 50.0% | 2.5 |
| /frozen-drink-machine-rental-lake-travis | 1 | 1 | 100% | 2.0 |
| /book | 0 | 18 | 0% | 4.9 |
| /community-events | 0 | 9 | 0% | 9.1 |

### Issues found

- **HTTP/HTTPS split.** Several pages appear in GSC under both `http://` and
  `https://` URLs. The http versions show better positions (/about at 2.5 on
  http vs 10.8 on https). Check that the Worker is 301-redirecting all http
  to https — if not, authority is being diluted across two versions of every
  page.

- **Location pages not ranking for their targets.** Pages like
  /frozen-drink-machine-rental-bee-cave only appeared for irrelevant DFW-area
  queries (Irving, Wylie — 150+ miles away), not for Bee Cave or Lakeway
  queries. Either the pages lack local signals or the site hasn't built enough
  authority yet. Both, probably.

- **No page 2 opportunities.** Nothing sitting at positions 11–20 that could
  be nudged to page 1. The site simply isn't indexed for commercial terms yet.

### What this means

SEO is a long game. The marketing playbook is right: neighborhood Facebook
groups, word of mouth, and the "two kids running a real business" story will
convert better than organic search at this stage. GBP (Google Business Profile)
is more urgent than on-page SEO — the Map Pack drives the vast majority of
local service leads, and GSC doesn't capture Map Pack impressions.

Track branded search volume (homepage clicks) as a health metric. As marketing
efforts grow, this number should grow proportionally.

---

## Competitor landscape

*(Sections below will be filled as research completes.)*

### Competitor profiles

### Review volumes and velocity

### Review source analysis (booker vs. guest)

### Rental volume estimates (inferred from reviews)

### Content and SEO tactics

### Conversion and booking tactics

### Structured data and rich results

### What they do that we don't (yet)

---

## Keyword gaps

*(To be filled from Ahrefs competitor analysis.)*

---

## Review collection workflow

*(To be designed from competitor review analysis.)*

---

## Action items

*(Prioritized list, to be compiled from all findings.)*
