# Setup guide

Step-by-step, assuming no prior experience with Cloudflare or GitHub. Do these
once. After that, changes to the site ship without touching any of it again.

There are three tasks. Budget about 15 minutes total.

- Task A — get the Cloudflare Account ID (2 min)
- Task B — create a Cloudflare API token (5 min)
- Task C — paste both into GitHub (3 min)

Then one optional check at the end.

Cloudflare and GitHub both redesign their menus from time to time. Where the
wording here does not match what is on screen, the direct links still work —
use those and look for the nearest matching label.

---

## Task A — Get the Cloudflare Account ID

This is a long string of letters and numbers that identifies the account. It is
not a secret and it is not a password.

1. Go to **https://dash.cloudflare.com** and log in.

2. If a list of accounts appears, click the one that has slushsisters.com in it.

3. Look at the address bar at the top of the browser. The URL will look like:

   ```
   https://dash.cloudflare.com/9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d/...
                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                               this part is the Account ID
   ```

   That 32-character string between `.com/` and the next `/` is the Account ID.

4. Copy it and paste it somewhere temporary — a notes app is fine.

**If the URL does not show one:** click **Workers & Pages** in the left sidebar
(it may be labeled **Compute** or **Compute (Workers)**). On that page, look
down the right-hand column for a box labeled **Account ID** with a copy button.

✅ **Done when:** a 32-character string of letters and numbers is on the
clipboard or in a notes app.

---

## Task B — Create a Cloudflare API token

This is the actual key. It lets the deploy pipeline publish the site without a
human logging in. Treat it like a house key.

1. Go to **https://dash.cloudflare.com/profile/api-tokens**

2. Click the **Create Token** button.

3. A list of templates appears. Find the row that says **Edit Cloudflare
   Workers** and click **Use template** on that row.

   Use the template. Do not click "Create Custom Token" — the template already
   has the right permissions, and picking them by hand is where this usually
   goes wrong.

4. A configuration page appears with several sections. Only two need attention:

   - **Account Resources** — set the dropdown to **Include**, then pick the
     account from Task A.
   - **Zone Resources** — set the dropdown to **Include** → **Specific zone** →
     **slushsisters.com**.

   Leave every other section exactly as it is. Do not set an expiration date
   unless you want to redo this later — if it expires, deploys stop working
   with no warning.

5. Scroll to the bottom, click **Continue to summary**.

6. Read the summary, then click **Create Token**.

7. **The token now appears on screen. This is the only time it will ever be
   shown.** Click the copy button.

   If this page gets closed before copying, the token is gone. It cannot be
   recovered or re-displayed. Delete it from the token list and start Task B
   over — no harm done, just a few minutes.

8. Paste it into the same temporary notes file, next to the Account ID.

⚠️ **Do not** put this token in a text message, an email, a Google Doc, or a
GitHub comment. It goes in exactly one place — GitHub Secrets, in Task C.
Delete the notes file once Task C is finished.

✅ **Done when:** two values are saved temporarily — the Account ID from Task A,
and a token that starts with a mix of letters, numbers, dashes, and
underscores.

---

## Task C — Paste both into GitHub

GitHub Secrets is an encrypted box. Once a value goes in, nobody — not the
account owner, not Claude — can read it back out. The deploy pipeline can use
it, but not display it.

1. Go to
   **https://github.com/markbarrera/slush-sisters/settings/secrets/actions/new**

   That link opens the "add a new secret" form directly. If it asks for a login,
   log in and click the link again.

2. Fill in the form for the **first** secret:

   - **Name:** `CLOUDFLARE_API_TOKEN`
   - **Secret:** paste the token from Task B step 7

   The name must be typed exactly as shown — all capitals, underscores not
   spaces or dashes. The pipeline looks for that exact spelling and will not
   find `Cloudflare_Api_Token` or `CLOUDFLARE-API-TOKEN`.

3. Click **Add secret**.

4. Click **New repository secret** to add the **second** one:

   - **Name:** `CLOUDFLARE_ACCOUNT_ID`
   - **Secret:** paste the Account ID from Task A

5. Click **Add secret**.

✅ **Done when:** the page lists exactly two secrets, named
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The values show as
`***` — that is correct and expected.

Now delete the temporary notes file with the token in it.

---

## Optional check — confirm the Worker name

The deploy config points at a Cloudflare Worker named `drop-b4ff8c50-e5c`. That
is almost certainly the one serving slushsisters.com, but it has not been
confirmed from this side. Worth two minutes.

1. Go to **https://dash.cloudflare.com** → **Workers & Pages** in the left
   sidebar (possibly labeled **Compute**).

2. Click **drop-b4ff8c50-e5c** in the list.

3. Click the **Settings** tab.

4. Find the section called **Domains & Routes**.

**If `slushsisters.com` is listed there** — everything is correct, nothing to
change.

**If it is not listed** — go back to the Workers & Pages list and look at the
other entries to find which one has `slushsisters.com`. Report that name back
and `wrangler.jsonc` gets updated to match.

Getting this wrong is not dangerous. Deploying under the wrong name creates a
second, unused Worker sitting off to the side. The live site keeps working
exactly as it is — it just would not receive updates. It is worth checking, but
not worth worrying about.

---

## What happens after

Once both secrets are saved, the deploy pipeline works on its own:

- **Opening a pull request** builds a preview of the change at a temporary URL
  and posts that link as a comment. The real site does not change.
- **Merging that pull request** publishes it to slushsisters.com, usually within
  about a minute.

Nothing in this document needs to be repeated. It is a one-time setup.

## If something looks broken

Go to the **Actions** tab at
**https://github.com/markbarrera/slush-sisters/actions**. Each row is one
attempt to publish. A green check means it worked. A red X means it did not,
and clicking into the red row shows what went wrong.

The most common failure is a typo in one of the two secret names. The fix is to
delete the mistyped secret and add it again with the exact spelling above.
