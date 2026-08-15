# Watts Unified Solutions Opportunity Site

Multi-page replacement for `https://opportunity.wattsunified.com/`.

## Pages

- `/` — Opportunity Home
- `/business-owner/` — Licensed Business Owner path
- `/referral-partner/` — Strategic Referral Partner path
- `/overview/` — Opportunity Overview
- `/faq/` — Frequently Asked Questions
- `/get-started/` — Next Steps

## Brand direction

Light, gold-forward Watts Unified Solutions presentation using cream/white backgrounds and restrained slate/navy accents. The site includes the $199 initial registration, state-dependent licensing costs, and approximately $35/month E&O information without using public income promises.

## Cloudflare Pages deployment

Recommended project name: `watts-owned-opportunity`

Deploy the static site directory:

```bash
pnpm exec wrangler pages deploy tools/opportunity/public \
  --project-name watts-owned-opportunity \
  --branch main \
  --commit-dirty=true
```

After the Pages preview is verified, connect `opportunity.wattsunified.com` to the new Pages project. Keep the existing production hostname connected until the preview is confirmed working.

## Production verification

Before cutover verify:

1. Home page and all five subpages return HTTP 200.
2. Header and footer navigation works on desktop and mobile.
3. Logo and S. Alex Watts portrait load correctly.
4. All scheduling CTAs reach `https://wattsunified.com/schedule`.
5. `$199` registration information appears on the home, overview, FAQ, business-owner, and get-started pages.
6. `robots.txt` and `sitemap.xml` resolve correctly.
7. Existing `opportunity.wattsunified.com` remains untouched until the new Pages deployment is verified.
