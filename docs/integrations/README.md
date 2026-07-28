# Platform integration docs

One file per ad platform, documenting how Campanetics connects to it. Meta
(`meta.md`) is the reference implementation — every future platform doc
(TikTok, Google Ads, DV360, LinkedIn, etc.) should follow the same section
structure so they're easy to scan side by side:

1. **What this integration does** — one paragraph, plain language.
2. **Required environment variables** — every var this platform needs, where
   it's read in code, and what breaks if it's missing.
3. **Platform-side dashboard setup** — the exact steps to take in the ad
   platform's own developer console, in order, with a note on *why* each step
   exists (not just "click here").
4. **How the OAuth/connection flow works** — the actual code path, so a
   future debugging session can jump straight to the relevant file instead of
   re-discovering it from scratch.
5. **Troubleshooting** — real errors hit during setup, their actual root
   cause, and the fix. This section is the most valuable one long-term: it's
   a running log of "we already solved this once," not a generic FAQ.

When adding a new platform, copy `meta.md`'s structure rather than starting
from a blank page.
