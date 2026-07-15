# Watts Unified owned tools

This is the owner-controlled migration workspace for the published projects in the HighLevel AI Studio folder **Watts Unified Solutions**.

## What's included

- `published-projects.json`: verified published-project inventory and hostname map.
- `tools/<slug>/public`: deployable static build for each published tool.
- `shared/owned-runtime.js`: secure shared form and calculator behavior.
- `backend`: Cloudflare Worker API and D1 lead-storage schema.
- `scripts`: recovery and mirroring utilities.

The unpublished **Family Protection Assessment** project is intentionally excluded.

## Current Cloudflare resources

- Worker API: `api.wattsunified.com`
- Shared owned assets: `assets.wattsunified.com`
- D1 database: `watts-unified-leads`
- Separate Pages projects exist for the owned tools and previews.

The retirement calculator and veteran roadmap were rebuilt as owner-controlled tools. Other published exports were mirrored with local assets and secure owned form handling.

## Safety rule

Do not delete a HighLevel project or disconnect a remaining HighLevel hostname until its Cloudflare version passes visual, calculator, form-delivery, mobile, HTTPS, and redirect checks.

See [MACBOOK_SETUP.md](MACBOOK_SETUP.md) for continuing on macOS and [MIGRATION_STATUS.md](MIGRATION_STATUS.md) for the cutover status.
