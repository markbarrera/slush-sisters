# Site audit — 2026-08-03

Findings from the live site at the time it was recovered into this repo.

**Status as of 2026-08-11.** Most items are resolved. Items 9 and 11 remain open.

| # | Finding | Status |
| --- | --- | --- |
| 1 | Booking form submits nowhere | **Fixed** — form submits to mark@markbarrera.com via Email Routing Worker |
| 2 | No way to contact the business | **Fixed** — hello@slushsisters.com works, Instagram is @slush_sisters |
| 3 | Broken hero image | Fixed — `public/img/hero.svg` |
| 4 | Unknown URLs return homepage with 200 | Fixed — `not_found_handling: 404-page` |
| 5 | No robots.txt or sitemap.xml | Fixed — both added, robots explicitly allows all crawlers |
| 6 | No analytics | **Fixed** — PostHog + Cloudflare Analytics Engine via Worker, dashboard at `/dashboard` |
| 7 | No structured data | **Fixed** — LocalBusiness, Service, FAQPage, Organization, BreadcrumbList, Product, HowTo JSON-LD across key pages |
| 8 | No social preview tags | Fixed — OG + Twitter tags and a real 1200×630 card on all pages |
| 9 | `www` does not resolve | **Open** — needs a DNS change |
| 10 | Internal links cause an extra redirect | Fixed — all links now extensionless |
| 11 | Favicon, blocking font import, duplicated copy | Favicon and font loading fixed; duplicated flavor copy still open |

The original findings follow, unedited.

## 1. The booking form does not submit anywhere

**This is the one that costs money.**

`public/book.html` has no `<form>` element, no `action`, and no submit handler.
The "Send request" button is this:

```html
<button class="form-btn" onclick="document.getElementById('thx').style.display='block';this.style.display='none';">Send request</button>
```

It hides itself and reveals a div reading *"Got it! We will get back to you
today."* The name, event date, guest count, address, and phone the visitor typed
are never sent, stored, or emailed. They are discarded when the tab closes.

Anyone who has booked through this page believes they submitted a request and is
waiting on a reply that was never triggered. Fixing this should come before any
cosmetic work.

## 2. There is no way to contact the business

Independent of the form being broken, the site offers no working fallback:

- Both Instagram links (header area and footer) are `href="#"` — they go nowhere.
- No phone number appears on any page.
- No email address appears on any page.
- The domain has no MX records, so `anything@slushsisters.com` bounces.

A visitor who wants to book has no path that reaches a human.

## 3. The hero image is broken

`public/index.html` references `sister-placeholder.webp`. That file does not
exist. The request falls through to the catch-all and returns `index.html` — an
HTML document with a `200` status served as an image — so the browser shows a
broken-image placeholder in the hero.

## 4. Every unknown URL returns the homepage with HTTP 200

`/zzz-nope`, `/robots.txt`, and `/sitemap.xml` all return the full homepage HTML
with a `200 OK`. Consequences:

- Search engines can index an unlimited number of duplicate homepage URLs.
- Typos and stale links look like working pages instead of errors.
- Crawlers asking for `robots.txt` receive HTML.

`wrangler.jsonc` in this repo sets `not_found_handling: "404-page"` and adds
`public/404.html`, which fixes this on the next deploy.

## 5. No `robots.txt` or `sitemap.xml`

Neither file exists (see above). Both are small and worth adding.

## 6. No analytics

No Google Analytics, no Cloudflare Web Analytics, no tag of any kind on any
page. There is currently no way to know how many people visit, which pages they
read, or where they come from — which also means there is no baseline to measure
any of these fixes against.

Cloudflare Web Analytics is free, needs no cookie banner, and is one snippet.

## 7. No structured data

This is a local service business with a defined service area and a fixed price,
and it publishes none of that in machine-readable form. A `LocalBusiness` (or
`Service`) JSON-LD block covering name, area served, price, and hours is the
highest-leverage SEO item on the list after the 404 handling.

## 8. No social preview tags

No `og:title`, `og:description`, `og:image`, or Twitter card tags on any page,
and no `<link rel="canonical">`.

The business runs on Instagram, so most traffic arrives from a link in a bio, a
story, or a text message. Right now every one of those links previews as bare
text with no image. For this business that is a bigger deal than it would be for
most sites.

## 9. `www.slushsisters.com` does not resolve

The `www` hostname fails DNS entirely. Anyone who types or is autocompleted to
`www.` gets a connection error rather than the site. A CNAME to the apex plus a
redirect resolves it.

## 10. Internal links point at `.html`, causing an extra redirect

Every nav link is `href="about.html"`, `href="pricing.html"`, etc. Production
307-redirects those to the extensionless path, so every internal click costs an
extra round trip. Changing the links to `/about`, `/pricing`, and so on removes
it.

## 11. Smaller items

- No favicon — browser tabs show a blank page icon.
- Google Fonts are loaded via `@import` inside the inline `<style>`, which
  blocks rendering. A `<link rel="preconnect">` plus `<link rel="stylesheet">`
  in `<head>` is faster.
- The 6 flavor descriptions are duplicated between `index.html` and
  `flavors.html` and have already drifted apart in wording.

## Note on fixing #1

Wiring up the booking form means the site starts collecting a child's event
address and a parent's phone number. Wherever those get delivered — email,
a form service, a Worker endpoint — is a place real personal data now lives, and
it is worth picking that destination deliberately rather than by default.
