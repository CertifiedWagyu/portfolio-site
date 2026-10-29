# Setup Guide — Certificates, Achievements & Games

This project is your existing React + Vite + Tailwind portfolio, extended with:

- Public **Certificates**, **School Achievements**, and **Games Library** sections.
- A private **Admin Dashboard** at `/admin` with secure login, add/edit/delete,
  file uploads, search, filters, visibility toggles, and confirmation dialogs.
- **Supabase** for authentication, the database, permanent file storage, and
  Row Level Security. All content is protected server-side — the browser only
  holds a public key that cannot bypass the rules.

The website is **not** connected to a database until you complete the steps
below. Until then the admin route shows a friendly "Supabase setup required"
screen and the public sections show empty states.

---

## 1. Create the Supabase project

1. Go to <https://app.supabase.com> and sign in.
2. Click **New project**, choose an organization, name (e.g. `portfolio`),
   set a database password, and pick a region close to you.
3. Wait for the project to finish provisioning (~2 minutes).

## 2. Create the tables, security policies, and storage

1. In your Supabase project, open **SQL Editor** → **New query**.
2. Open the file `supabase/schema.sql` from this project, copy **all** of it,
   paste it into the editor, and click **Run**.
3. You should see "Success. No rows returned". This creates:
   - `certificates`, `games`, and `admins` tables
   - Row Level Security policies (public read of public rows, admin-only writes)
   - Two **private** storage buckets: `certificate-files`, `game-thumbnails`
   - Storage policies that only let the admin upload/delete and only let the
     public read files that belong to public content

> The buckets are intentionally **private**. Private files are only ever
> reachable through short-lived signed URLs generated for authorized users.

## 3. Configure environment variables

1. In Supabase go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key.
3. In this project, copy `.env.example` to a new file named `.env`:

   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   Replace the values with your real ones.

**Never** put the `service_role` key in `.env` or anywhere in the frontend —
it bypasses all security. Only the `anon` key belongs in browser code.

4. Restart the dev server after creating `.env`.

## 4. Create your administrator account

1. In Supabase go to **Authentication → Users → Add user → Create new user**.
2. Enter your email and a strong password, and enable **Auto Confirm User**
   (or use the invite flow and confirm via the email link).
3. Copy the new user's **UID**.
4. Go to **SQL Editor** and run (replace the two values):

   ```sql
   insert into public.admins (user_id, email)
   values ('PASTE-USER-UID-HERE', 'you@example.com')
   on conflict (user_id) do nothing;
   ```

That's it. Only user ids in the `admins` table can manage content. There is no
public sign-up in the app, and nobody can add themselves to `admins`.

## 5. Run the website locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open the printed URL (usually <http://localhost:5173>). The public portfolio
loads immediately with no login. Go to `/admin` to sign in.

> On Windows PowerShell, if `npm` is blocked by the execution policy, use
> `npm.cmd` instead of `npm`.

## 6. Add and manage content

1. Visit `/admin` and sign in with your administrator account.
2. **Certificates tab:** click *Add certificate*, fill in the title, issuer,
   date, category, description, choose a visibility, upload an image or PDF,
   and check the live preview before saving.
   - Set the category to **Award** or **Achievement** to also feature it in the
     public **School Achievements** section.
3. **Games tab:** click *Add game*, enter any game from Roblox, Steam, itch.io,
   browser, or elsewhere, paste its URL, upload a thumbnail, and save. The
   public **Play Game** button opens the saved URL safely in a new tab.
4. Use the search boxes and filters to find content, *Edit* to update it, and
   *Delete* (with a confirmation dialog) to remove it.
5. Switch **Visibility** between *Public* (everyone sees it) and *Private*
   (only you see it while signed in).

## 7. Deploy the website online

Build the static site:

```powershell
npm.cmd run build
```

Deploy the `dist/` folder to any static host. Two easy options:

- **Netlify:** drag the `dist` folder into Netlify, or connect the repo. The
  included `public/_redirects` file makes `/admin` work on refresh.
- **Vercel:** import the repo (framework preset: Vite). The included
  `vercel.json` rewrites all routes to `index.html`.

Then, in your host's settings, add the same two environment variables
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and redeploy so the build can
read them.

Finally, in Supabase go to **Authentication → URL Configuration** and add your
live domain to **Site URL** and **Redirect URLs**.

## 8. Security summary

- Public visitors can read **only public** rows. Private rows are blocked by
  RLS, not just hidden in the UI.
- Only the administrator account can insert/update/delete rows or upload files,
  enforced by `is_admin()` inside every policy.
- Private files live in private buckets and require short-lived signed URLs.
- Uploads are type- and size-limited in both the app and the storage buckets.
- Game links are validated to allow only `http(s)://` URLs.
- No secrets are shipped in the frontend.

---

## Still needs manual setup / testing by you

- Create the Supabase project, run `supabase/schema.sql`, and add your `.env`.
- Create your admin user and add them to the `admins` table.
- Replace the placeholder `[Your Name]`, email, and social links in the existing
  sections with your real details (as before).
- Upload real certificates and games, then verify private items stay hidden when
  signed out.
