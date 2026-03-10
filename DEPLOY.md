# Deploying Ramadan Tracker to Netlify

TanStack Start uses **Server-Side Rendering (SSR)**. The app needs a server to generate HTML—you cannot deploy it by manually uploading the `dist` folder.

## Option 1: Git Deploy (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**
3. Connect your repository
4. Netlify will auto-detect TanStack Start and use:
   - **Build command:** `vite build` (or `pnpm run build`)
   - **Publish directory:** `dist/client`
5. Click **Deploy**

Netlify will run the build, deploy the serverless function, and serve your app correctly.

## Option 2: Netlify CLI

```bash
# Install Netlify CLI if needed
pnpm add -g netlify-cli

# Login (one-time)
netlify login

# Deploy (from project root)
pnpm run build
netlify deploy --prod
```

This deploys both the static assets and the serverless function.

---

**Why drag-and-drop fails:** Manual deploy only uploads static files. TanStack Start needs the server (in `.netlify/v1/functions/`) to handle requests and render HTML. Git deploy or `netlify deploy` includes that.
