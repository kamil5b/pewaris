# Phase 9 - Integration

## Goal
Wire all pieces together. Full app working end-to-end.

## Tasks

### 9.1 Create App Layout
```
src/components/App.tsx
```
```
┌─────────────────────────────────────────────┐
│ Toolbar                                      │
├──────────────┬──────────────┬───────────────┤
│              │              │               │
│   Canvas     │   Harta      │   Results     │
│              │   Panel      │   Panel       │
│              │              │               │
├──────────────┴──────────────┴───────────────┤
│ Status Bar                                   │
└─────────────────────────────────────────────┘
```

### 9.2 Create Main Page
```
src/pages/index.astro
```
```astro
---
import Layout from '../layouts/Layout.astro'
import App from '../components/App'
---

<Layout title="Pewaris">
  <App client:load />
</Layout>
```

### 9.3 Connect Stores to Canvas
- Family store → Canvas renderer
- Canvas interactions → Family store

### 9.4 Connect Stores to Harta Panel
- Asset store → Harta panel
- Harta form → Asset store

### 9.5 Connect Stores to Results
- Simulation store → Results panel
- Family + Asset stores → Calculation

### 9.6 Connect IndexedDB
- Auto-save on store changes
- Load on app mount

### 9.7 Create Keyboard Shortcuts
```
src/components/use-keyboard-shortcuts.ts
```
- Ctrl+Z: Undo
- Ctrl+Y: Redo
- Delete: Remove selected
- Escape: Deselect

### 9.8 Create Responsive Layout
- Mobile: Stack panels
- Tablet: Collapsible side panels
- Desktop: Full layout

### 9.9 Create Error Boundaries
```
src/components/ErrorBoundary.tsx
```
- Catch rendering errors
- Show fallback UI

### 9.10 Integration Testing
- Full flow: Add family → Add assets → Select pewaris → Calculate
- Verify persistence across reload
- Verify undo/redo

## Exit Criteria
- [ ] Full app loads without errors
- [ ] Can add family members on canvas
- [ ] Can add harta
- [ ] Can select pewaris and calculate
- [ ] Results display correctly
- [ ] Data persists across reload
- [ ] Responsive on different screens
- [ ] Keyboard shortcuts work

## Files Created
```
src/components/
├── App.tsx
├── ErrorBoundary.tsx
└── use-keyboard-shortcuts.ts

src/pages/
└── index.astro (updated)
```
