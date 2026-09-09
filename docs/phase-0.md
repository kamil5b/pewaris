# Phase 0 - Project Scaffolding

## Goal
Get Astro + React + TypeScript + Tailwind running on GitHub Pages.

## Tasks

### 0.1 Initialize Astro Project
```bash
bun create astro@latest . -- --template minimal --no-install
```

### 0.2 Add React Integration
```bash
bunx astro add react
```

### 0.3 Add Tailwind CSS
```bash
bunx astro add tailwind
```

### 0.4 Add Dependencies
```bash
bun add zustand zod
bun add -d @types/node
```

### 0.5 Configure `astro.config.mjs`
```ts
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  site: 'https://kamil5b.github.io',
  base: '/pewaris',
  integrations: [react(), tailwind()],
})
```

### 0.6 Create Base Layout
```
src/layouts/Layout.astro
```
- HTML boilerplate
- Tailwind directives
- Slot for page content

### 0.7 Create Index Page
```
src/pages/index.astro
```
- Minimal placeholder
- Verify React component renders

### 0.8 Verify Dev Server
```bash
bun run dev
```
- Page loads
- React component renders
- Tailwind classes apply

### 0.9 Verify Build
```bash
bun run build
bun run preview
```
- Static output in `dist/`
- Works with base path `/pewaris`

## Exit Criteria
- [ ] `bun run dev` starts without errors
- [ ] React component renders inside Astro page
- [ ] Tailwind styles apply
- [ ] `bun run build` produces static output
- [ ] Preview works with `/pewaris` base path

## Files Created
```
├── astro.config.mjs
├── package.json
├── bun.lockb
├── tsconfig.json
├── tailwind.config.mjs
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
```
