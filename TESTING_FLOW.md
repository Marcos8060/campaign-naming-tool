# Camparc — End-to-End Testing Flow

Camparc is a campaign naming + intelligence platform: teams define a naming taxonomy, launch campaigns through a wizard that enforces that taxonomy, then use analytics/audience-overlap detection and exports to manage spend across Meta, Google Ads, TikTok, DV360, and LinkedIn.

This flow walks through every screen in the order a new workspace would actually encounter them, with concrete data to key in so the app ends up in a realistic, fully-populated state. Test in order — later sections (Analytics, Audience Overlap, Exports) need the campaigns created in the earlier steps to show anything meaningful.

Use a fresh browser profile or incognito window so you aren't carrying over an old session.

---

## 0. Start the app

```
docker compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1
- Optional DB admin UI: `docker compose --profile tools up pgadmin` → http://localhost:5050 (admin@campaign.local / admin123)

Check: all three core containers (postgres, backend, frontend) report healthy/running before you start clicking.

---

## 1. Landing page (logged out)

Visit `http://localhost:3000/`.

- [ ] Nav bar links (Features, How It Works, Pricing, Compare) scroll to the matching section on the page.
- [ ] "Sign In" and "Try Free" nav buttons go to `/login` and `/register`.
- [ ] Every CTA button on the page (Hero, How It Works, Use Cases, Pricing cards, Final CTA) routes to `/register` or `/login` correctly — click through each one.
- [ ] Page renders correctly at a narrow/mobile width (nav collapses gracefully, cards stack to one column).

---

## 2. Register a workspace

Go to `/register`.

| Field | Value |
|---|---|
| Full Name | `Alex Morgan` |
| Company / Workspace Name | `Acme Marketing` |
| Work Email | `alex@acme-qa.test` |
| Password | `Password123!` |

- [ ] Password strength meter reacts as you type (try a 4-char password first to see "Too short", then the full one to see "Strong").
- [ ] Submitting with a password under 8 characters is blocked client-side with a toast, before any network call.
- [ ] Successful submit redirects to `/dashboard` and shows a "Workspace created!" toast.
- [ ] Try registering the same email again afterward (later, from an incognito tab) — confirm the backend's duplicate-email error message surfaces in the toast, not a generic failure.

---

## 3. First look at the dashboard (empty state)

You should land on `/dashboard` with no campaigns yet.

- [ ] Greeting banner shows your first name ("Alex") and time-appropriate greeting.
- [ ] Onboarding checklist card appears, showing 1 of 4 steps done ("Workspace set up"), with "Go →" links to Taxonomies, Platform settings, and Create Campaign.
- [ ] KPI cards show zeros, not errors or blank spaces.
- [ ] Chart panel shows the "No campaigns yet" empty state with a working "Create first campaign" link.

---

## 4. Set up the naming taxonomy

Go to `/taxonomies`. Create these 7 nodes one at a time (use "Add Taxonomy"):

| Name | Code | Type | Parent |
|---|---|---|---|
| Nike | `NIKE` | brand | — |
| Adidas | `ADID` | brand | — |
| Air Jordan 1 | `AJ1` | product | Nike |
| Ultraboost | `UB` | product | Adidas |
| North America | `NA` | region | — |
| Europe | `EU` | region | — |
| Black Friday | `BF24` | promotion | — |

- [ ] Each node appears in the tree immediately after creating it; parent/child indentation is correct for the two product nodes.
- [ ] Edit one node (e.g. rename "Nike" → "Nike Inc.") via the pencil icon, confirm it updates in place.
- [ ] Try the expand/collapse chevron on Nike (with its Air Jordan 1 child).
- [ ] Try deleting a node that has a child (delete "Adidas") — note what happens: does it block you, cascade-delete Ultraboost, or orphan it? This is worth flagging either way.
- [ ] Re-create Adidas afterward if it got deleted, so campaign data below still works.

---

## 5. Configure platform naming templates

Go to `/settings/platforms`. Edit each platform:

| Platform | Naming Template | Separator | Max Length |
|---|---|---|---|
| Meta | `{brand}_{product}_{region}_{promotion}` | `_` | 60 |
| Google Ads | `{brand}_{product}_{region}_{promotion}` | `_` | 60 |
| TikTok | `{brand}_{product}_{region}` | `_` | **15** (deliberately too short — see step 6C) |
| DV360 | `{brand}_{product}_{region}_{promotion}` | `_` | 60 |
| LinkedIn | *(leave unconfigured)* | — | — |

- [ ] Each save shows a success toast and the card badge flips from "Default" to "Configured".
- [ ] Reload the page — confirm templates persisted (are actually saved server-side, not just local state).
- [ ] LinkedIn should still show "Using default template" since you're leaving it alone on purpose.

---

## 6. Create campaigns (the wizard)

Go to `/campaigns/create` and run the 5-step wizard five times, once per platform. This data is designed so two campaigns overlap heavily (for step 11) and one deliberately fails validation (to test that the wizard actually blocks bad names).

### 6A — Meta
- **Step 1:** Platform → Meta
- **Step 2:** Objective → Awareness; Brand → Nike; Product → Air Jordan 1; Region → North America; Promotion → Black Friday
- **Step 3:** Leave name auto-generated; Total Budget `10000`; Daily Budget `300`; Start Date → today; End Date → +30 days
- **Step 4:** All required checks should pass — confirm the green "Ready to create!" banner appears
- **Step 5:** Create

### 6B — Google Ads (same targeting as Meta, on purpose)
- **Step 1:** Platform → Google Ads
- **Step 2:** Objective → Conversion; Brand → Nike; Product → Air Jordan 1; Region → North America; Promotion → Black Friday (identical to 6A)
- **Step 3:** Total Budget `8000`; Daily Budget `250`; Start Date → today; End Date → +45 days
- **Step 5:** Create

### 6C — TikTok (intentionally over the length limit)
- **Step 1:** Platform → TikTok
- **Step 2:** Objective → Consideration; Brand → Adidas; Product → Ultraboost; Region → Europe
- **Step 3:** leave name auto-generated
- **Step 4:** The generated name (`ADID_UB_EU`, ~10 chars) will likely fit under 15 — if it does, manually type an override name in Step 3 longer than 15 characters (e.g. `ADIDAS_ULTRABOOST_EUROPE_TEST`) to force the failure. Confirm: the "Name within character limit" check shows red/failing, the "Continue"/"Create" action is disabled, and the warning banner appears. Then shorten the name and confirm it unblocks.
- **Step 5:** Create (Budget `5000` / `150`, dates today → +21 days)

### 6D — DV360 (partial overlap with Meta/Google — shares brand+product, different region)
- **Step 1:** Platform → DV360
- **Step 2:** Objective → Retention; Brand → Nike; Product → Air Jordan 1; Region → Europe; Promotion → Black Friday
- **Step 3:** Budget `12000` / `400`; dates today → +60 days
- **Step 5:** Create

### 6E — LinkedIn (uses the default fallback template)
- **Step 1:** Platform → LinkedIn
- **Step 2:** Objective → Leads; Brand → Adidas; Region → North America (skip Product and Promotion)
- **Step 3:** Budget `3000` / `100`; dates today → +14 days
- **Step 5:** Create

For every wizard run, also check:
- [ ] "Continue" on Step 1 is disabled until a platform is picked.
- [ ] The Live Preview panel (Steps 2–3) updates in real time as you change taxonomy values.
- [ ] Back/Continue navigation preserves what you've entered on other steps.
- [ ] Step 5's summary matches everything you actually entered before you hit Create.

---

## 7. Campaigns list

Go to `/campaigns`. You should see all 5 campaigns, currently "draft".

- [ ] **Search:** type `Nike` — should filter to the Meta, Google Ads, and DV360 campaigns.
- [ ] **Platform filter:** select "TikTok" — only the TikTok campaign shows.
- [ ] **Status filter:** select "Draft" — all 5 show (none are active yet).
- [ ] **Clear filters** button resets all three.
- [ ] **Sort:** click each sortable column header (Name, Status, Budget, Start Date) and confirm ascending/descending toggles and actually reorders rows.
- [ ] **Bulk actions:** select the Meta and Google Ads rows via checkboxes → click "Activate". Confirm both flip to an "active" badge and the bulk bar disappears after.
- [ ] Select the DV360 row → "Pause" → confirm "paused" badge.
- [ ] Select the LinkedIn row → "Archive" (from the per-row ⋯ menu, not bulk) → confirm it moves to "archived" status/badge.
- [ ] Leave TikTok as "draft" so you end up with one of each status: active ×2, paused, draft, archived.
- [ ] **Row action menu (⋯):** on the TikTok row, try View Details, Duplicate (confirm a copy appears in the list), Pause/Activate toggle, and Archive individually.
- [ ] Select-all checkbox in the table header selects/deselects every visible row.

---

## 8. Campaign detail page

Click into the Meta campaign (`/campaigns/[id]`).

- [ ] All fields you entered (budget, dates, platform, generated name) render correctly.
- [ ] Open the edit modal, change Daily Budget to `350`, save, confirm it updates on the page without a full reload.
- [ ] Try the Archive action from this page's action bar; confirm the confirmation modal appears before it actually archives.

---

## 9. Dashboard, revisited

Back to `/dashboard` — now with real data.

- [ ] KPI cards: Total Campaigns = 6 (5 + 1 duplicate from step 7), Active count reflects your 2 activated campaigns.
- [ ] "Campaigns by Platform" bar chart shows bars for Meta, Google Ads, TikTok, DV360, LinkedIn.
- [ ] "Top Campaigns" panel and "Recent Campaigns" table show correct names, platforms, and status badges (color per status: green=active, gray=draft, amber=paused, red=archived).
- [ ] Onboarding checklist has shrunk/disappeared now that all steps are complete.
- [ ] "New Campaign" and "Analytics" hero buttons still route correctly.

---

## 10. Analytics

Go to `/analytics`.

- [ ] Date presets (7d / 30d / 90d) are clickable and visibly change which one is highlighted; confirm the "Performance Over Time" panel refetches (network tab or just watch for a loading flicker).
- [ ] KPI cards (Total Spend, Impressions, Conversions, Avg ROAS) render without crashing. Since there's no live platform integration yet (pre-MVP), these will show `$0` / `—` across the board — that's expected, not a bug. What actually matters here is that the cards, charts, and empty-state messaging render cleanly with zero data rather than erroring out, since this is exactly the state real users will see until platform connections ship.
- [ ] "Campaigns by Platform" pie chart and "Budget Allocation" bar chart populate using the 6 campaigns' budgets.
- [ ] "Top Performing Campaigns" table lists your campaigns.
- [ ] "View Audience Overlap" link in the table header routes correctly.

---

## 11. Audience overlap detection

Go to `/analytics/audience-overlap`. This is the section your Meta/Google Ads data (step 6A/6B) was built to exercise.

- [ ] "Campaigns Analyzed" count matches your active/eligible campaign count.
- [ ] The Meta ↔ Google Ads pair (identical brand/product/region/promotion) shows up under **"High Overlap Pairs — Action Required"** with a red ≥50% badge. Note: this overlap detection is based on shared taxonomy (naming) values, not real audience-size data from Meta/Google — since there's no live platform integration yet, the "wasted spend" dollar estimate is likely derived from budget fields you entered rather than actual ad-account audience data. Confirm it shows *some* non-zero number and doesn't crash; don't worry about whether the dollar figure is "realistic."
- [ ] The Meta/Google Ads ↔ DV360 pairs (same brand/product, different region) show a lower overlap percentage than the Meta↔Google pair — confirms the score is actually sensitive to which fields match, not just a flat number.
- [ ] The LinkedIn campaign (Adidas/NA only, no shared product) shows minimal or no overlap with the Nike campaigns.
- [ ] Platform filter dropdown on this page narrows the pairs shown.
- [ ] "All Campaign Pairs" table (below the high-overlap section) lists every pair, sorted by overlap % descending.

---

## 12. Assets

Go to `/assets`.

- [ ] Upload any PNG or JPG from your machine via "Upload Asset" — confirm it appears in the grid and hovering shows the filename overlay.
- [ ] Try selecting a non-image file (e.g. a `.txt` or `.pdf`) in the file picker — the picker should restrict to images; if your OS lets you bypass that, confirm the app handles a rejected upload gracefully rather than crashing.
- [ ] Upload 2–3 more images and confirm the grid layout holds up (2/4/6 columns depending on screen width).

---

## 13. Exports

Go to `/exports`. Since there's no live platform API integration yet, this is currently the *only* way campaign data leaves Camparc — these CSVs are meant to be manually uploaded into each platform's own Ads Manager/Editor, not pushed automatically. That makes correct formatting here more important than usual pre-MVP.

- [ ] Generic CSV export with "All Platforms" — download, open the file, confirm all 6 campaigns appear with sensible columns.
- [ ] Switch Platform to "Meta" and Format to "Platform Native Format" — confirm the format dropdown only unlocks native format once a specific platform is picked (not "All Platforms").
- [ ] Download the Meta native export; compare its columns/formatting against the generic export — they should differ (that's the point of "native" format).
- [ ] Use a "Quick Export by Platform" card (e.g. TikTok) and confirm it downloads immediately without going through the form above.
- [ ] "Export History" table lists every export you just made, each with correct type (CSV vs Native CSV), platform, status, and date.

---

## 14. Settings — workspace & team

Go to `/settings`.

- [ ] Rename the workspace: change "Acme Marketing" → `Acme Marketing (QA)`, Save, confirm the sidebar/header workspace label updates and the slug underneath stays unchanged.
- [ ] **Invite a team member:** Name `Sam Rivera`, Email `sam.rivera+qa@yourdomain.com` *(use an alias of an inbox you actually control, in case the backend sends a real invite email)*, Role `Manager`. Submit — confirm Sam appears in the Team Members list.
- [ ] **Invite a second:** Name `Jamie Lee`, Email `jamie.lee+qa@yourdomain.com`, Role `Viewer`.
- [ ] Change Sam's role from Manager → Admin using the inline row dropdown; refresh the page and confirm it stuck.
- [ ] Remove Jamie via the trash icon; confirm the confirmation modal appears before the row actually disappears.
- [ ] If your environment actually delivers the invite (real SMTP configured) or you have DB access, try logging in as Sam/Jamie in a separate browser to verify role-gated navigation: a **Viewer** should not see "New Campaign" actions, Settings, Exports, or Assets in the sidebar; a **Manager** should see everything except Theme & Branding (admin-only).

---

## 15. Theme & branding (admin only)

Go to `/settings/theme`.

- [ ] Upload a light-mode logo (any small PNG/SVG) and a separate dark-mode logo; confirm both previews render.
- [ ] Change colors: Primary → `#E11D48`, Success → `#16A34A`, Danger → `#DC2626`. Watch the live preview panel on the right update instantly as you pick each color, before saving.
- [ ] Click "Save Theme", confirm a success toast, then refresh the page and confirm the colors and logo persisted.
- [ ] Log in as a non-admin (Manager/Viewer, if you set one up in step 14) and confirm they get redirected away from `/settings/theme`.

---

## 16. Dark mode & responsive layout

- [ ] Toggle dark mode via the sun/moon icon in the header; confirm sidebar, header, cards, and the user-menu dropdown (which uses inline styles, not just Tailwind classes) all flip correctly — this is a common spot for missed dark-mode styling.
- [ ] Shrink the browser to a phone-width viewport; confirm the sidebar collapses, the hamburger icon opens a mobile drawer with the correct role-filtered nav items, and the drawer closes both on link-click and on tapping the backdrop.
- [ ] Collapse/expand the desktop sidebar via its chevron toggle and confirm nav labels hide/show correctly and tooltips appear on hover when collapsed.

---

## 17. Auth edge cases & session handling

- [ ] Refresh the browser mid-session — you should stay logged in (token persisted, not booted to `/login`).
- [ ] Sign out via the header user-menu; confirm redirect to `/login`, and that manually navigating to `/dashboard` afterward bounces you back to login.
- [ ] Try logging in with a wrong password — confirm the toast shows the backend's actual error message (e.g. "Invalid credentials"), not a silent failure.
- [ ] Try registering with an email you already used in step 2 — confirm a clear duplicate-account error, not a generic failure.

---

## What to flag as a bug vs. expected behavior

Report as a **bug**: anything that crashes the page, a form that silently does nothing on submit, a filter/sort that doesn't actually change the results, a role that can see/do something it shouldn't (or is blocked from something it should be allowed), data that doesn't persist after a refresh, or a toast/error message that doesn't match what actually happened.

Probably **not a bug** (flag only if it feels surprising): Analytics showing `$0`/`—` for spend and ROAS, and audience-overlap dollar estimates that look arbitrary — both are because there's no live Meta/Google/TikTok/DV360/LinkedIn API integration yet (planned post-MVP), so every number in this app right now is derived from what you manually typed into the campaign wizard, not real ad-account data. Also not necessarily a bug: the taxonomy delete-with-children behavior in step 4 (worth confirming intent, but a considered decision either way is fine).
