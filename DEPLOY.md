# Deploying MA Studio with online editing + auto-deploy

This sets up the **hosted** TinaCMS admin so you can log in from any browser, edit
content, and have it go **live automatically**. The loop is:

> Edit in the hosted admin → Tina Cloud commits to GitHub → Vercel rebuilds → site updates (~1 min).

The repo side is already configured (`tina/config.ts` reads cloud credentials from
env; `vercel.json` sets the cloud build command). You just need to create three
free accounts and connect them. **~15 minutes, one time.**

> Local editing is unaffected: `pnpm dev` still opens the open local admin at
> `http://localhost:3000/admin/index.html` with no credentials.

---

## Step 1 — Put the repo on GitHub

1. Go to <https://github.com/new>. Create an **empty** repo (no README/.gitignore/license).
   Suggested name: `mastudio`. Note the URL it gives you.
2. In this project folder, connect and push (replace `<you>`/`<repo>`):
   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin master
   ```
   In Claude Code you can run these with a leading `!` so they execute in this session,
   e.g. `! git remote add origin https://github.com/<you>/<repo>.git`.
   The first push will prompt for GitHub authentication in your browser.

## Step 2 — Create a Tina Cloud project (the editing backend + login)

1. Go to <https://app.tina.io> and sign up / log in **with GitHub**.
2. **Create a project** → **Import your site’s repository** → pick the repo from Step 1.
3. When asked for the branch, choose **`master`**.
4. Open the project’s **Overview / Tokens**. Copy two values:
   - **Client ID** → this is `NEXT_PUBLIC_TINA_CLIENT_ID`
   - Create/Read a **Read-Only Token** → this is `TINA_TOKEN`
5. In the Tina project settings, under **Site URLs / allowed origins**, you’ll add your
   Vercel URL after Step 3 (so the admin can talk to it). Come back for this.

## Step 3 — Deploy on Vercel

1. Go to <https://vercel.com> and sign up / log in **with GitHub**.
2. **Add New… → Project → Import** the repo from Step 1.
3. Vercel auto-detects **Next.js**. The build command comes from `vercel.json`
   (`tinacms build && next build`) — leave it as detected.
4. Expand **Environment Variables** and add (for all environments):
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_TINA_CLIENT_ID` | the Client ID from Step 2 |
   | `TINA_TOKEN` | the Read-Only Token from Step 2 |
   | `NEXT_PUBLIC_TINA_BRANCH` | `master` |
5. Click **Deploy**. When it finishes you get a URL like `https://mastudio-xyz.vercel.app`.
6. Go back to **Tina Cloud → project settings → Site URLs** and add that Vercel URL.

## Step 4 — Edit online

- Visit **`https://<your-vercel-url>/admin`**. You’ll be asked to log in via Tina Cloud
  (only people you authorize in the Tina project can get in — this admin **is**
  authenticated, unlike the local one).
- Create/edit projects, upload photos, edit About / Cofounders / Contact.
- Hit **Save** → Tina Cloud commits to GitHub `master` → Vercel redeploys → live shortly.

That’s the automatic online update you asked for.

---

## Notes & limits

- **Security:** the hosted admin is gated by Tina Cloud login. The open, no-auth admin
  only exists locally while you run `pnpm dev`. Nothing unauthenticated is exposed online.
- **Secrets:** `TINA_TOKEN` lives only in Vercel’s env settings and your local `.env`
  (which is git-ignored). Never commit a filled-in `.env`. See `.env.example`.
- **Local vs hosted builds:** locally `pnpm build` still runs the offline build
  (`tinacms build --local …`). Vercel uses `vercel.json`’s cloud build. Both are correct.
- **Click-on-page editing online:** the in-browser “click the live page to edit” overlays
  are currently enabled in **local dev only**. The **hosted** admin uses the form-based
  dashboard (create/edit projects, text, photos) — which fully covers editing + auto-deploy.
  Enabling click-on-page editing on the live site too is a follow-up (it requires the
  deployed pages to load through Tina’s contextual editing); ask if you want it.
- **Branch:** everything is wired to `master`. If you later rename the default branch to
  `main`, update the Tina Cloud branch, `NEXT_PUBLIC_TINA_BRANCH`, and Vercel’s production branch.
