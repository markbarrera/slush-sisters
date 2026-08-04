# The boards

Two generators, same visual language, both built for Finley and Harper rather
than for an adult.

| | Builds | Lives at |
| --- | --- | --- |
| `generate.js` | The idea board — every idea anyone has had, on cards to pick from | `/ideas` |
| `reading-room.js` | The reading room — every strategy document in `docs/`, rewritten so they can actually read it | `/read` |

```
node docs/board/generate.js public/ideas.html --noindex
node docs/board/reading-room.js public/read
```

Both are **orphan pages**: `noindex`, absent from `sitemap.xml`, and linked from
nowhere on the site. You reach them because somebody sent you the link.

## The reading room

Every document in `docs/` is written for a grown-up. That is correct for the
documents and useless for the two people who own the business. `reading-room.js`
turns each one into cards, in language that does not need translating.

The rule that matters: **rewrite, do not simplify.** Nothing is left out to make
it easier. The $27,000 argument, the alcohol rules, the honest base rate for kid
businesses — all of it is in there, in plain words. Talking down to them would
defeat the entire point of giving it to them.

Three card shapes:

- `['plain', title, body]`
- `['number', title, bigNumber, body]` — when one figure carries the point
- `['debate', title, forSide, againstSide, whereItLands]` — the important one.
  Every argued point keeps both sides and shows where it landed, because that is
  how the thinking was done and hiding it would teach the wrong lesson.

Edit the `PAGES` array, regenerate, republish.

---

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
