"""Double-submit-cookie CSRF protection.

SameSite=Lax on the auth cookies (see api/v1/endpoints/auth.py) already
blocks most forged cross-site requests, but it isn't complete coverage on
its own. This adds a second, independent layer: the backend hands the
frontend a random token as a *non*-httpOnly cookie, the frontend must echo
it back as a header on every state-changing request, and the backend checks
the two match. An attacker's page can make the victim's browser send
cookies automatically, but it cannot *read* a cookie's value cross-origin
to forge the matching header — that's what actually stops the forged
request.
"""
import secrets

CSRF_TOKEN_COOKIE = "csrf_token"
CSRF_HEADER_NAME = "x-csrf-token"
CSRF_SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS"})

# /auth/* is exempt: before login there's no csrf_token cookie yet to check
# against, and forging a login/register/logout is a different, lower-severity
# concern ("login CSRF") than the one this middleware targets — forged state
# changes made *using* an already-authenticated victim's session (e.g. a
# forged POST to create or delete a campaign). /auth/refresh is covered
# separately by its own narrowly path-scoped refresh_token cookie, which is
# already a strong, single-purpose secret.
CSRF_EXEMPT_PREFIXES = ("/api/v1/auth",)

# Tests flip this off (see tests/conftest.py) so the many existing endpoint
# tests don't all need to carry a matching cookie+header just to exercise
# unrelated logic. The CSRF check itself is covered by dedicated tests that
# re-enable it for just that test.
enabled = True


def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def is_exempt(path: str) -> bool:
    return path.startswith(CSRF_EXEMPT_PREFIXES)
