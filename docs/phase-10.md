# Phase 10 - Deployment

## Goal
Deploy to GitHub Pages. Auto-deploy on push.

## Tasks

### 10.1 Create GitHub Actions Workflow
```
.github/workflows/deploy.yml
```
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 10.2 Configure Astro for GitHub Pages
Verify `astro.config.mjs`:
```ts
export default defineConfig({
  site: 'https://kamil5b.github.io',
  base: '/pewaris',
  // ...
})
```

### 10.3 Test Build Locally
```bash
bun run build
bun run preview
```
Verify:
- All assets load
- Base path works
- No 404s

### 10.4 Enable GitHub Pages
- Go to repo Settings → Pages
- Source: GitHub Actions

### 10.5 Verify Deployment
- Push to main
- Check Actions tab
- Visit deployed URL

### 10.6 Create 404 Page
```
src/pages/404.astro
```
- Friendly error message
- Link back to home

### 10.7 Add Meta Tags
```
src/layouts/Layout.astro
```
- Title
- Description
- Open Graph tags
- Favicon

### 10.8 Performance Check
- Lighthouse audit
- Bundle size check
- No large dependencies

## Exit Criteria
- [ ] GitHub Actions workflow runs
- [ ] Build succeeds
- [ ] Deploy to GitHub Pages
- [ ] App accessible at URL
- [ ] All features work in production
- [ ] No console errors
- [ ] Acceptable performance

## Files Created
```
.github/workflows/
└── deploy.yml

src/pages/
└── 404.astro
```
