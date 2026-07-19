# Watts Blueprint Platform

Isolated Cloudflare Pages environment for `blueprint.wattsunified.com`.

## Isolation contract

- Cloudflare project: `watts-blueprint`
- Deployment root: `blueprint-platform/public`
- No imports from `tools/main-site`, `wattsunified.com`, or any existing calculator project
- No shared analytics, tracking scripts, stylesheets, build output, service workers, or runtime storage
- Each migrated tool owns its assets and code inside its route directory

## Planned route layout

```text
public/
  retirement-wealth/
    index.html
    styles.css
    script.js
    assets/
  debt-free/
    index.html
    assets/
  tax-buckets/
    index.html
    assets/
  retirement/
    index.html
    assets/
```

Deployments from other Watts projects cannot modify this environment. Only a deployment whose directory is `blueprint-platform/public` and whose project name is `watts-blueprint` can update it.
