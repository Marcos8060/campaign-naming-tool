-- Refresh tokens back the httpOnly-cookie session: access tokens are now
-- short-lived (15 min, see config.jwt_expiration), and this table is what
-- lets the frontend silently mint a new one via POST /auth/refresh without
-- forcing a re-login every 15 minutes.
--
-- Same principle as password_reset_tokens: we store a SHA-256 hash of the
-- raw token, never the raw value, so a DB leak alone can't be replayed as a
-- live session. The raw token only ever exists in the refresh_token cookie
-- (itself scoped to the /auth/refresh path — see set_refresh_cookie) and
-- briefly in memory on the request that verifies it.
--
-- revoked_at supports both explicit logout (revoke on demand) and reuse
-- detection: rotation marks the old row revoked rather than deleting it,
-- so if a refresh token is ever presented a second time, POST /auth/refresh
-- can tell the difference between "unknown token" and "this exact token
-- was already rotated away" — the latter means it was stolen and replayed,
-- not a legitimate retry, and every other refresh token for that user gets
-- revoked in response.
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
