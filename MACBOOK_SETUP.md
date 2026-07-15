# Continue this project on a MacBook

## 1. Install the required tools

Install Homebrew if it is not already installed, then run:

```bash
brew install git gh pnpm
```

Node.js can be installed with Homebrew or your preferred version manager. Use a current supported Node.js release.

## 2. Sign in and clone

```bash
gh auth login
gh repo clone wattsunifiedsolutions/watts-owned-tools
cd watts-owned-tools
pnpm install
```

## 3. Sign in to Cloudflare

```bash
pnpm exec wrangler login
pnpm exec wrangler whoami
```

Never commit Cloudflare tokens, `.dev.vars`, `.env` files, or Wrangler login files. They are excluded by `.gitignore`.

## 4. Validate the backend

```bash
pnpm run typecheck
pnpm exec wrangler deploy --dry-run --config backend/wrangler.jsonc
```

## 5. Preview a tool locally

Each tool is a static site under `tools/<slug>/public`. For example:

```bash
cd tools/retirement-calculator/public
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser.

## 6. Deploy a tool preview

Example:

```bash
pnpm exec wrangler pages deploy tools/retirement-calculator/public \
  --project-name watts-owned-retirement-calculator \
  --branch main \
  --commit-dirty=true
```

Use the project mappings in `MIGRATION_STATUS.md` for the other tools.

## Final cutover rule

Keep each GHL CNAME connected until its matching Cloudflare preview is fully tested. Change and verify one production hostname at a time.
