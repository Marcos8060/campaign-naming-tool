# Meta (Facebook/Instagram Marketing API)

Status: **live** — the first fully-wired platform integration. Everything
below reflects how it actually works in this codebase, including several
real production issues hit while setting it up and how they were fixed.

## 1. What this integration does

Lets a workspace connect a real Meta (Facebook) ad account via OAuth, so
Campanetics can read that account's ad accounts, Pages, and (eventually)
deploy campaigns to it. The connection is per-workspace, admin-only, and
stores a long-lived encrypted access token — the user never has to re-paste
a token manually.

User-facing flow lives at **Settings → Integrations**. Clicking "Connect
Meta" kicks off a standard OAuth authorization-code flow against Facebook's
Graph API.

## 2. Required environment variables

All read via `backend/src/config.py` (`Settings` class), sourced from the
backend's `.env` in dev or injected via `docker-compose.prod.yml` in
production.

| Variable | Where it's used | What breaks if missing/wrong |
|---|---|---|
| `META_APP_ID` | `backend/src/integrations/meta.py` — every OAuth/Graph API call | `/integrations/meta/connect` returns a 500 with "Meta app credentials are not configured" |
| `META_APP_SECRET` | Same file — exchanging the OAuth `code` for an access token | Token exchange fails after the user approves on Facebook's side |
| `META_API_VERSION` | Builds the Graph API base URL (defaults to `v21.0`) | Rarely needs changing; only bump when Meta deprecates the current version |
| `OAUTH_REDIRECT_BASE_URL` | `backend/src/api/v1/endpoints/integrations.py` — builds `{this}/api/v1/integrations/meta/callback`, sent to Facebook as the `redirect_uri` | **The most common source of broken Meta connections in this project.** Must be the API's own origin (e.g. `https://api.campanetics.com`), with no path suffix. In `docker-compose.prod.yml` it silently falls back to `FRONTEND_URL` if unset — which is wrong the moment frontend and API live on different (sub)domains, since the callback route only exists on the API. See Troubleshooting §1. |
| `COOKIE_DOMAIN` | `backend/src/config.py` / `auth.py` — scopes session, refresh, and CSRF cookies | Not Meta-specific, but connecting Meta requires a valid logged-in session + fresh CSRF cookie first. If frontend and API are on different subdomains and this is unset, every mutating request (including `/integrations/meta/connect`) 403s before it ever reaches Meta. See Troubleshooting §2. |

`.env.production.example` documents all of these inline with the same
explanations.

## 3. Platform-side dashboard setup (developers.facebook.com)

Do these in order — each one is a real, independent gate Meta enforces, and
skipping one produces a *different-looking* error that's easy to misdiagnose
as something else.

1. **Create the app** at developers.facebook.com, add the Marketing API
   product ("Create and manage ads with Marketing API" use case).
2. **Basic Settings** (left sidebar → App settings → Basic):
   - **App Domains** — add every domain and subdomain the app touches as
     *separate entries* (e.g. `campanetics.com` **and** `api.campanetics.com`
     — the second one does not get inferred from the first). This field is a
     chip/tag input: type a domain, press **Enter** to commit it as its own
     chip, *then* type the next one. Clicking Save without pressing Enter
     first silently drops whatever you were mid-typing.
   - **Privacy Policy URL** / **Terms of Service URL** — point these at the
     real pages (`https://campanetics.com/privacy`, `/terms`), not Meta's own
     placeholder values.
   - **App Icon** and **Category** — Meta's Basic Settings save can behave
     inconsistently if these are left blank; fill them in even though they
     seem unrelated to OAuth.
3. **Facebook Login for Business → Settings** (this is the field that's
   actually easy to miss — it's a separate product from Basic Settings):
   - **Client OAuth Login**: Yes
   - **Web OAuth Login**: Yes
   - **Use Strict Mode for redirect URIs**: Yes (recommended)
   - **Valid OAuth Redirect URIs** — add the *exact, full* callback URL:
     `https://api.campanetics.com/api/v1/integrations/meta/callback`. With
     Strict Mode on, this list is enforced separately from App Domains —
     having App Domains correct does not exempt you from also filling this
     in. Same chip-input rule applies: press Enter after typing it.
4. **Roles → Roles** — while the app isn't yet fully Live/App-Reviewed for
   the requested permissions, only Facebook accounts explicitly added here as
   Admin/Developer/Tester can complete the OAuth consent screen. Anyone else
   gets silently redirected to their normal Facebook homepage after login
   instead of seeing an error — see Troubleshooting §5.

## 4. How the OAuth flow works (code path)

```
Frontend: Settings → Integrations → "Connect Meta" button
  → POST /api/v1/integrations/meta/connect   (backend/src/api/v1/endpoints/integrations.py)
      - requires admin role (require_role("admin"))
      - builds redirect_uri = f"{settings.oauth_redirect_base_url}/api/v1/integrations/meta/callback"
      - returns { authorize_url } via meta.build_oauth_url(redirect_uri, state)
  → frontend does window.location.href = authorize_url
  → user lands on Facebook's OAuth dialog, logs in, approves scopes
  → Facebook redirects to GET /api/v1/integrations/meta/callback?code=...&state=...
      - verifies state (CSRF-style protection for the OAuth flow itself, src/core/security.py)
      - exchanges code for a short-lived token, then a long-lived token (backend/src/integrations/meta.py)
      - fetches the user's ad accounts
      - if exactly one ad account: connects it immediately, redirects to
        /settings/integrations?connected=meta
      - if multiple ad accounts: stores a "pending" platform_connections row,
        redirects to /settings/integrations?select_account=meta&connection_id=...
        so the user can pick which account to connect (GET /meta/ad-accounts,
        POST /meta/select-account)
```

Scopes requested (`backend/src/integrations/meta.py` → `SCOPES`):
`ads_management`, `ads_read`, `business_management`, `pages_show_list`.
`pages_show_list` was added after the integration first shipped — anyone who
connected before it existed needs to disconnect/reconnect once, since Meta
doesn't retroactively add scopes to an already-issued token.

Tokens are encrypted at rest (`src/core/encryption.py`, `ENCRYPTION_KEY`) —
losing/rotating that key invalidates every existing connection.

## 5. Troubleshooting

Real issues hit while wiring this up, in the order they tend to surface.

**"Can't Load URL — the domain of this URL isn't included in the app's
domains"** (shown as a Facebook error page, before you even get to a login
screen)

- *Cause A — App Domains missing the subdomain.* App Domains needs
  `campanetics.com` **and** `api.campanetics.com` as separate entries, not
  just the root domain. Meta's own error text says "add all domains and
  sub-domains" — take that literally.
- *Cause B — `OAUTH_REDIRECT_BASE_URL` pointing at the wrong host.* If the
  decoded `redirect_uri` query param in the Facebook URL shows your frontend
  domain (`campanetics.com/api/v1/...`) instead of the API's
  (`api.campanetics.com/api/v1/...`), the backend built the wrong redirect
  URI. Check what's actually baked into the *running* container — editing
  `.env` on disk does **not** update an already-running Docker container:
  ```
  docker compose -f docker-compose.prod.yml exec backend env | grep OAUTH_REDIRECT_BASE_URL
  ```
  If that shows the wrong value even after fixing `.env`, recreate the
  container: `docker compose -f docker-compose.prod.yml up -d --force-recreate backend`.
- *Cause C — Valid OAuth Redirect URIs is empty, with Strict Mode on.* This
  is a separate field from App Domains (see §3.3) and throws this same error
  text. Check Facebook Login for Business → Settings directly — an empty
  "Valid OAuth redirect URIs" box (just greyed-out placeholder text) means
  nothing was actually committed there.
- *Cause D — Facebook's own cache lagging.* Even after all of the above are
  genuinely saved (confirm by re-opening the settings page after a hard
  refresh, and/or inspecting the actual `POST .../settings/basic/save/`
  network request's payload in dev tools to see what was really submitted),
  the OAuth dialog validates against a cached copy of the app config that
  isn't instantly consistent across Facebook's edge servers. Symptom: it
  works in one browser/session and fails in another, or fails then
  succeeds on a later retry with nothing changed. Wait 15–60 minutes and
  retry rather than assuming the settings didn't save.

**403 Forbidden on `/integrations/meta/connect` (or any mutating endpoint),
paired with a browser console CORS error like "No 'Access-Control-Allow-Origin'
header is present"**

This is not a Meta issue — it never reaches Facebook. A 403 with a *missing*
CORS header (rather than a CORS header plus a 403 body) is the signature of
this app's own CSRF middleware rejecting the request before `CORSMiddleware`
gets a chance to attach headers. Root causes seen in practice: (a) the
`COOKIE_DOMAIN` cross-subdomain cookie scoping bug — fixed in code, see
`backend/src/config.py` and `auth.py`; (b) a stale/missing CSRF cookie in the
current browser session. Fix: log out and back in fresh in that browser to
get a valid session + CSRF cookie, then retry.

**Login succeeds, but you land back on your normal Facebook homepage/profile
instead of a permissions/consent screen**

Usually means the Facebook account you're testing with isn't listed under
Roles → Roles on the Meta app (see §3.4) — while the app isn't fully
Live/reviewed, only Admin/Developer/Tester accounts can actually grant it the
requested scopes. Everyone else gets silently bounced back to their normal
session with no error shown.

**Facebook throws a "confirm you're not a robot" checkpoint mid-login, then
drops you on your profile page instead of continuing**

A fresh incognito window looks like a brand-new, unrecognized device to
Facebook every time, which can trigger this security checkpoint — especially
after several repeated test logins in a short window. Once you clear the
checkpoint, Facebook does not resume the original third-party OAuth
redirect chain; it just leaves you on a normal Facebook session. Fix: don't
treat this as a config bug — either retry the app's "Connect Meta" button
again now that the browser is past the checkpoint, or (better for repeated
testing) use a regular, already-logged-in browser session instead of a fresh
incognito window each time, so there's no new-device login at all.

**"pages_show_list" / Pages-related 502 errors on an existing connection**

The scope was added after some workspaces already connected. Existing tokens
don't retroactively gain new scopes — disconnect and reconnect Meta once to
pick it up. The API returns a message saying exactly this
(`backend/src/api/v1/endpoints/integrations.py` → `/meta/pages`).
