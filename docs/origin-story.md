# The origin story page

The single most valuable page on the site, and the one only they can write.

Everything else here — pricing, flavors, service area — a competitor could copy
by lunchtime. Two sisters unboxing their first machine cannot be copied, and it
only happens once. This page is the reason a reporter writes about them, a brand
partners with them, and a mom picks them over the cheaper option.

## Why it beats the homepage for the brand goal

The homepage's job is to convert someone who already arrived wanting a rental.
The origin story's job is to make someone who did not come to buy anything care
anyway — and then tell someone else. That is the mechanic behind a following.

It is also the most linkable page the site will ever have. Nobody links to a
pricing page. People link to a story.

## Structure

In order down the page:

**1. The unboxing video, above the fold.** Not a teaser, the actual thing. It is
the artifact and it should be the first thing on the page.

**2. One sentence of setup, then get out of the way.** Something like "In June
we bought a slushie machine with our own money. This is the first time we saw
it." Resist writing a paragraph here.

**3. Where the money came from.** This is the most interesting question in the
whole business and most kid-business stories skip it. Did they save? Did Dad
front it? Are they paying him back, on what terms, and how much is left? A real
repayment number on a public page is unusual, credible, and genuinely teaches
something. If there is a loan, show the balance and update it.

**4. The timeline.** Scannable, dated, honest. First machine, first flavor test,
first customer, first thing that went wrong, first profit. The failures matter
more than the wins — a timeline of only wins reads as marketing.

**5. What each of them does.** Finley and Harper split the work somehow. Naming
who owns what makes it a business rather than a family activity.

**6. In their own words.** A short block from each, unedited. Do not polish
this. Slightly wrong grammar from an 8-year-old is worth more than a clean
sentence an adult wrote for her.

**7. What they are learning.** Ongoing, updated. This is the hook that gives
people a reason to come back and the reason a school or a podcast reaches out.

**8. One quiet CTA at the bottom.** Follow, or book. Not both competing.

## What NOT to put on it

- A sales pitch. The page converts by being liked, not by asking.
- Adult-voiced copy about "our journey" or "our passion." It will read as a
  parent wrote it, and that kills the whole premise.
- Stock photography of any kind.
- The price. That lives on `/pricing` and `/book`.

## Interview questions

The page should be written from answers, not invented. Ask the girls these,
record it rather than making them write, and transcribe. Their phrasing is the
product.

**The machine**
1. When you opened the box, what was the first thing you thought?
2. Was it bigger or smaller than you expected?
3. What did it look like inside? Did anything surprise you?
4. Who got to press the button first?

**The money**
5. How much did the machine cost?
6. Where did the money come from?
7. If Dad paid, are you paying him back? How much do you still owe?
8. How much money have you made so far? What did you do with it?

**The start**
9. Whose idea was this? What made you think of it?
10. What did you almost do instead?
11. Why the candy on every cup — where did that come from?
12. How did you pick the name?

**The real parts**
13. What is the hardest part of a rental?
14. What has gone wrong? Has anything broken or spilled?
15. Has a customer ever been unhappy? What did you do?
16. What do you disagree about?

**Each of them**
17. What is your job? What is your sister's job?
18. What are you better at than your sister? (ask separately)
19. What do you want this to be in a year?

Six or seven good answers make the page. Do not use all nineteen.

## Video hosting — the actual constraint

Workers Static Assets caps an individual file at **25 MiB**, on every plan
(files per version: 20,000 free / 100,000 paid). A raw iPhone unboxing video
will not fit — 4K runs roughly 350 MB per minute. Even compressed to a
reasonable 720p web bitrate, 25 MiB is about 80 seconds of video.

So the split is:

| Content | Where | Why |
| --- | --- | --- |
| Full unboxing (several minutes) | YouTube, embedded | Free, and YouTube is a discovery engine — for a brand play the reach is the point, not a cost |
| Short clips, 10–60s, silent autoplay loops | Self-hosted MP4 in `public/video/` | Fast, no third-party script, no cookie banner, no "up next" showing someone else's video |
| Long video without YouTube | Cloudflare R2 public bucket | Sidesteps the 25 MiB cap, stays in the Cloudflare account, but no player or adaptive bitrate |

**Recommendation: YouTube for the full cut, self-hosted short loops for
everything else.** The loops carry the page visually; the full video is one
click away and earns subscribers on a platform built to recommend it onward.

Cloudflare Stream also exists and gives adaptive streaming on a custom player,
but it bills monthly per minute stored and per minute delivered. For a handful
of videos it costs more than it returns while YouTube is free and better for
reach.

### Compressing clips for self-hosting

```sh
ffmpeg -i input.mov \
  -vf "scale='min(1280,iw)':-2" \
  -c:v libx264 -crf 26 -preset slow -profile:v main \
  -movflags +faststart -an \
  public/video/unboxing-loop.mp4
```

`-an` strips audio, which is right for autoplay loops — browsers block
autoplaying video with sound. `+faststart` puts the index at the front so
playback begins before the file finishes downloading. Keep each output under
20 MiB to stay clear of the cap.

Always pair a self-hosted video with a `poster` image so the layout does not
jump and something is visible before the video loads.

## Status

Not built yet. The structure above is settled; the content is blocked on the
video and on the interview answers. Building it with invented details would
defeat the purpose — the value is that it is true.
