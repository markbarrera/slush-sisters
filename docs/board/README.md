# The idea board

`generate.js` builds the shareable idea board — the visual version of
`../marketing.md`, `../big-ideas.md` and `../product-tiers.md`, made for Finley
and Harper to scan and pick from rather than read.

```
node docs/board/generate.js out.html
```

Edit the `IDEAS` array to add or change ideas, then regenerate and republish.
Each idea is `[category, title, description, cost, effort]`.

The brand fonts (Sour Gummy, DM Sans) are inlined as base64 data URIs, because
the artifact host blocks font CDNs and a linked webfont would silently fall
back. It reads them from `~/.fonts/brand-*.ttf` — if those are missing, download
them from Google Fonts first.

Picks are stored in the reader's own browser, so each of the girls keeps her own
list.
