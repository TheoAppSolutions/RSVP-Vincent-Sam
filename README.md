# Wedding invitation and guest responses

The invitation is available at `/`. Its dashboard button opens `/admin/`, where signed-in admins can browse the saved responses, search names and messages, filter attendance and submission dates, sort results, view full messages, and export the current results as CSV.

Guest records come from a local file and remain read-only. Admin authentication runs on the Next.js server using `ADMIN_PASSWORD` from `.env.local` or `.env`. No database is required. Records are returned only through an authenticated API and are excluded from the public browser bundle.

## Local development

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD` to your admin password. Keep an existing `.env` or `.env.local` password if already configured.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

## Response data

Saved responses live in `lib/rsvps.ts`, including each guest’s name, attendance, message, and submission timestamp. Displayed timestamps use the Asia/Manila timezone; CSV exports retain the original timestamp values.

To change the records, edit `lib/rsvps.ts` and rebuild. No browser action changes the saved snapshot.

## Authentication

The admin password is checked on the server. Successful login creates an eight-hour HttpOnly, SameSite=Strict session cookie; production cookies require HTTPS. Changing `ADMIN_PASSWORD` invalidates existing sessions. You can optionally set `ADMIN_SESSION_SECRET` as a separate signing secret; the password alone is sufficient when it is omitted. Empty passwords and the placeholder `change-me` are rejected.

Login attempts are rate limited per server instance. Set `RATE_LIMIT_IP_HEADER` only when your trusted reverse proxy overwrites that header with the real client IP. Without it, all visitors share a limit of 30 attempts per 15 minutes; with it, each IP has 10 attempts per 15 minutes.

## Build and host

Run `npm test`, `npm run typecheck`, and `npm run build`. Start the production server with `npm start`, or deploy to a host that supports Next.js server routes. Set the same environment variables on the deployment host and use HTTPS in production.

## Content and accessibility

Invitation components live in `components/template-3`. Shared event settings live in `lib/event.ts`, and media lives in `public`. Update `dateISO` in `lib/event.ts` to change the wedding date/time.

The gallery and guest-message dialogs use native `<dialog>` elements for focus management and keyboard dismissal. CSV exports escape quotes and neutralize formula-leading guest text.
