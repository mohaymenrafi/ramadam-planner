# Supabase Setup (Cloud Progress Sync)

Free tier: 50K monthly active users, 500MB database.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → Sign up / Log in
2. **New project** → Pick org, name, password, region
3. Wait for project to be ready

## 2. Create the progress table

1. In Supabase Dashboard → **SQL Editor** → **New query**
2. Paste and run the contents of `supabase/migrations/001_create_progress.sql`
3. Run `supabase/migrations/002_enable_realtime.sql` to enable cross-browser sync (Realtime)

## 3. Enable Email OTP (Magic Link)

1. **Authentication** → **Providers** → **Email**
2. Enable **Email** provider (it's on by default)
3. Under **Auth** → **URL Configuration**, add your site URL:
   - Local: `http://localhost:3000`
   - Production: `https://your-site.netlify.app`

## 4. Add env vars to your project

1. Supabase Dashboard → **Settings** → **API**
2. Copy **Project URL** and **anon public** key
3. Create `.env` in project root:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. For Netlify deploy: **Site settings** → **Environment variables** → Add the same vars

## 5. Flow

- User clicks "সেভ করুন" (Save) in header
- Enters email → receives magic link
- Clicks link → signs in → progress auto-loads from cloud (if any)
- "ক্লাউডে সেভ করুন" saves current progress
- "ক্লাউড থেকে লোড করুন" loads from cloud
- Works across devices with same email
- **Realtime**: When you save on one browser, other signed-in browsers auto-refresh
