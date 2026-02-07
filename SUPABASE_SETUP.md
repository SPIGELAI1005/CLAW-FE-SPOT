# Supabase setup for CLAW-FE (CLAW:FE SPOT)

You provided anon creds (stored in `.env.local`). Next steps are to apply DB schema + set auth redirect URLs.

## 1) Apply schema
Open Supabase → **SQL Editor** → New query → paste contents of:

`supabase/schema.sql`

Run it.

## 2) Auth settings
Supabase → **Authentication → URL Configuration**

Add these Redirect URLs:
- `http://localhost:3000/**`
- (later) your Vercel domain, e.g. `https://<your-app>.vercel.app/**`

## 3) Test login
Run:
```bash
npm run dev
```
Visit:
- `http://localhost:3000/login`

Enter your email and use the magic link.

## 4) Verify API
After logging in, open:
- `http://localhost:3000/api/tables`

You should see `{ tables: [...] }` once you created some tables (or `[]`).
