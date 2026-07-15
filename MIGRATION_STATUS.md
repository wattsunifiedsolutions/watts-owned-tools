# Migration status - 2026-07-15

## Live owner-controlled services

- `api.wattsunified.com` - Cloudflare Worker API with D1 storage, validation, honeypot protection, origin restrictions, and rate limiting.
- `assets.wattsunified.com` - shared owned runtime hosted on Cloudflare Pages.
- `financialreview.wattsunified.com` - active Cloudflare Pages deployment.
- `wattsunified.com` and `www.wattsunified.com` - active owner-controlled Cloudflare deployment.
- `familychecklist.wattsunified.com` - active owned Cloudflare Pages deployment.
- `financialsnapshot.wattsunified.com` - active owned Cloudflare Pages deployment.
- `taxbuckets.wattsunified.com` - active owned Cloudflare Pages deployment.
- `retirementcalculator.wattsunified.com` - active owned Cloudflare Pages deployment.
- `veteranroadmap.wattsunified.com` - active owned Cloudflare Pages deployment.
- `debtfree.wattsunified.com` - active owned Cloudflare Pages deployment.
- `mdbblueprint.wattsunified.com` - active owned Cloudflare Pages deployment.

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

1. Confirm the intended destination for the GHL **Client Page Rebuild** project; `connect.wattsunified.com` was intentionally left unchanged.
2. Remove the matching GHL domain assignments for the seven moved tool domains only after confirming no other GHL automation depends on them.

## Production cutover completed on 2026-07-15

The following published tool subdomains were moved from GHL `vibe.ludicrous.cloud` CNAMEs to owned Cloudflare Pages builds:

- `familychecklist.wattsunified.com` -> `watts-owned-family-checklist.pages.dev`
- `financialsnapshot.wattsunified.com` -> `watts-owned-financial-snapshot.pages.dev`
- `taxbuckets.wattsunified.com` -> `watts-owned-tax-buckets.pages.dev`
- `retirementcalculator.wattsunified.com` -> `watts-owned-retirement-calculator.pages.dev`
- `veteranroadmap.wattsunified.com` -> `watts-owned-veteran-roadmap.pages.dev`
- `debtfree.wattsunified.com` -> `watts-owned-debt-free.pages.dev`
- `mdbblueprint.wattsunified.com` -> `watts-owned-mdb-blueprint.pages.dev`

Final public verification returned HTTP 200 for all seven moved tool URLs with no GHL markers and no Cloudflare cross-user error.

## Guardrails

- Only published projects are in scope.
- **Family Protection Assessment** is unpublished and excluded.
- Do not perform a blanket CNAME removal.
