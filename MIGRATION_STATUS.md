# Migration status - 2026-07-15

## Live owner-controlled services

- `api.wattsunified.com` - Cloudflare Worker API with D1 storage, validation, honeypot protection, origin restrictions, and rate limiting.
- `assets.wattsunified.com` - shared owned runtime hosted on Cloudflare Pages.
- `financialreview.wattsunified.com` - active Cloudflare Pages deployment.
- `wattsunified.com` and `www.wattsunified.com` - active owner-controlled Cloudflare deployment.

## Uploaded Cloudflare previews

- Family Checklist - `watts-owned-family-checklist.pages.dev`
- Financial Snapshot - `watts-owned-financial-snapshot.pages.dev`
- Tax Buckets - `watts-owned-tax-buckets.pages.dev`
- Veteran Roadmap - `watts-owned-veteran-roadmap.pages.dev`
- Retirement Calculator - `watts-owned-retirement-calculator.pages.dev`
- Debt Free - `watts-owned-debt-free.pages.dev`
- MDB Blueprint - `watts-owned-mdb-blueprint.pages.dev`

## Completed build work

- Retirement Calculator rebuilt as a responsive working calculator with secure lead capture.
- Veteran Roadmap rebuilt because the published GHL stylesheet endpoint was invalid.
- Family Checklist and Financial Snapshot forms connected to the owned API.
- Tax Buckets given owned live calculation behavior.
- Published tool assets captured locally where available.
- Shared backend typecheck and Cloudflare deployment dry-run passed.

## Still required before final GHL removal

1. Complete visual, interaction, mobile, and form-delivery checks for every preview.
2. Confirm the intended destination for the GHL **Client Page Rebuild** project; `connect.wattsunified.com` currently redirects to the main site.
3. Attach each production subdomain to its matching Pages project, one at a time.
4. Verify HTTPS and the public page after each individual cutover.
5. Remove the matching GHL domain assignment only after that hostname passes.

## Guardrails

- Only published projects are in scope.
- **Family Protection Assessment** is unpublished and excluded.
- Do not perform a blanket CNAME removal.
