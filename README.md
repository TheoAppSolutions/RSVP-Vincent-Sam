# Wedding RSVP

The root page displays the wedding invitation and RSVP form. The admin dashboard is available at `/admin`.

## Run locally

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set the Supabase URL, service role key, and a strong, unique admin password. The placeholder `change-me` is rejected.
3. For a new database, run `supabase/schema.sql` in the Supabase SQL editor. Existing databases with `public.vincent_krystel` need no migration.
4. Run `npm run dev`.

Open `/` for the invitation and `/admin` for guest responses. The RSVP form writes to the Supabase table `public.vincent_krystel`. The dashboard can filter, export, and delete responses.

## Updating an existing deployment

No database migration is required for the existing `public.vincent_krystel` table. The app uses only `id`, `name`, `message`, `attending`, and `created_at`; the database generates `id` and `created_at`. Keep the database row limit at least 500 (the admin fetches pages of 500).

Admin login now creates an eight-hour, HttpOnly, SameSite=Strict cookie. Production cookies are Secure and require HTTPS. Sign out clears the cookie; rotating `ADMIN_PASSWORD` or the signing secret invalidates all existing sessions. `ADMIN_SESSION_SECRET` can be a dedicated random secret (generate with `openssl rand -hex 32`); otherwise the server-only Supabase service role key is used. Passwords previously saved in browser session storage are removed on the next admin visit. The old `x-admin-password` API header is no longer accepted.

Login and RSVP requests use an in-memory rate limiter with no additional database tables or functions. If your reverse proxy overwrites a header with the real client IP, set `RATE_LIMIT_IP_HEADER` to that header's name. Do not trust a visitor-controlled forwarding header. With a trusted client IP, the limits are 10 login attempts and 20 RSVP submissions per 15 minutes per IP. Without it, the limits are shared: 30 login attempts and 120 RSVP submissions per 15 minutes. Limits apply per server instance and reset when it restarts; they are best-effort on serverless hosting and are not shared across Vercel instances.

Each successful RSVP submission inserts a new response. The form prevents simultaneous double-click submissions, but retries after an uncertain network failure or submissions after a reload can create additional rows. Names alone do not identify a guest, so the app does not overwrite an earlier response by name.

The invitation components live in `components/template-3`. Shared event settings live in `lib/event.ts`, and shared media lives in `public`. Update the single `dateISO` in `lib/event.ts` to change the wedding date/time; all date labels use the Asia/Manila timezone. The RSVP submission hook and the modal used by the invitation and admin dashboard live in `components/shared`.

For maps, set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and enable Google's Maps Embed API. Set the same environment variables when deploying.

## Validation

- `npm test` runs security/API regression checks with a mocked Supabase client using Node's built-in test runner and the existing TypeScript compiler. It does not contact a live database.
- `npm run build` produces the production build and regenerates Next.js route types.
- `npm run typecheck` checks TypeScript. After removing routes, build first to refresh stale `.next/types` files.

The gallery and admin dialogs use native `<dialog>` elements for modal focus management and keyboard dismissal. CSV exports escape quotes and neutralize formula-leading guest text.
