# Supabase Setup for Memory Jar

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Pick an organization, name (e.g. `memory-jar`), database password, and region.
4. Wait for the project to be created.

## 2. Get your database URL

**You don’t edit the URL in Supabase.** The dashboard only lets you copy it. You edit it in your `.env` file (or Notepad) after pasting.

1. Open your **Supabase project** (the one you just created).
2. At the **top of the page** (not in Settings), click the green **Connect** button.
3. In the Connect panel, for **Netlify (serverless)** use:
   - **Transaction** (or “Pooler – Transaction mode”) — the one with port **6543**.
4. Under that option, find **URI** (or “Connection string”) and click **Copy** (you can’t edit it in Supabase).
5. **Paste** the string into your project’s **`.env`** file (or into Notepad so you can edit it).
6. In that pasted string:
   - **Replace `[YOUR-PASSWORD]`** with the database password you set when you created the project.
   - If the string doesn’t already end with `?pgbouncer=true`, **add it** at the very end.
7. The final value should look like (with your real password and ref/region):
   ```text
   postgresql://postgres.xxxxx:YourActualPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
8. Put that full string in `.env` as `DATABASE_URL="..."` (and in Netlify as the `DATABASE_URL` env var).

**Tip:** If you don’t see “Connect” at the top, make sure you’re inside a project (click the project name in the left sidebar first).

## 3. Set environment variables

**Local (`.env`):**

You need **both** `DATABASE_URL` and `DIRECT_URL` for Prisma with Supabase.

- **DATABASE_URL**: Use the **Transaction** (pooler) URI, port **6543**, and add `?pgbouncer=true` at the end.
- **DIRECT_URL**: Use the **Session** or direct connection URI, port **5432** (same host, same password, only the port changes).

```env
DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
AUTH_SECRET="run: openssl rand -base64 32"
```

Both URLs must start with `postgresql://`. If you see an error like "the URL must start with the protocol `file:`", Prisma is using the wrong database type—see Troubleshooting below.

**Netlify:**

1. Site **Settings** → **Environment variables**.
2. Add:
   - `DATABASE_URL` = your Supabase connection string (from step 2).
   - `AUTH_SECRET` = same value you use locally (e.g. from `openssl rand -base64 32`).

## 4. Run migrations (first time)

From the project root:

```bash
npx prisma migrate deploy
```

This creates the tables in your Supabase database.

## 5. Deploy

Push your code; Netlify will run `prisma migrate deploy` and then build. New deploys will apply any new migrations automatically.

## 6. Create an account

Open your site, go to **Sign up**, and create an account. Your memories will be stored in Supabase and sync across devices.

---

## Troubleshooting: "the URL must start with the protocol `file:`" or save fails

This usually means Prisma is using **SQLite** instead of **PostgreSQL**, or your `.env` is wrong.

1. **Stop the dev server** (Ctrl+C in the terminal).
2. **Check `prisma/schema.prisma`**: the `datasource db` block must have `provider = "postgresql"` (not `"sqlite"`).
3. **Check `.env`**: you must have both:
   - `DATABASE_URL="postgresql://..."` (port 6543, with `?pgbouncer=true`)
   - `DIRECT_URL="postgresql://..."` (port 5432, same host and password)
   Both must start with `postgresql://`.
4. **Regenerate Prisma and clear cache:**
   ```bash
   npx prisma generate
   ```
   If that fails with "EPERM" or "operation not permitted", stop any running Node/Next.js process and try again. Then delete the `.next` folder and run `npm run dev` again.
