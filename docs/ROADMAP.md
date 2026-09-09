# Pewaris - Development Roadmap

## Architecture Principle

> **Canvas is a UI for manipulating facts. It is not the source of truth for inheritance decisions.**

```
Database (facts) → Domain Model → Rules Engine → Inheritance Result
```

## Tech Stack

- Bun (runtime & package manager)
- Astro (static shell, GitHub Pages)
- React (interactive UI)
- TypeScript (strong types for complex domain)
- Zustand (application/UI state)
- Canvas 2D (visual rendering)
- IndexedDB (local persistence)
- Zod (validation)
- Tailwind CSS (styling)

## Directory Structure Target

```
src/
├── domain/           # Pure TypeScript entities
├── inheritance/      # Pure rules engine
├── application/      # Use cases / orchestration
├── store/            # Zustand stores
├── canvas/           # Canvas rendering & interactions
├── components/       # React components
└── db/               # IndexedDB layer
```

---

## Phase Overview

| Phase | Name | Depends On | Deliverable |
|-------|------|------------|-------------|
| 0 | Project Scaffolding | — | Astro + React + Tailwind running |
| 1 | Domain Model | — | Pure TS types & validation |
| 2 | Rules Engine | 1 | Inheritance calculation (CLI-testable) |
| 3 | State Management | 1 | Zustand stores |
| 4 | IndexedDB | 3 | Local persistence |
| 5 | Canvas Rendering | 3 | Visual family tree |
| 6 | Canvas Interactions | 5 | Add/edit/connect nodes |
| 7 | Harta UI | 3 | Property management |
| 8 | Results Display | 2 | Inheritance results panel |
| 9 | Integration | 4,6,7,8 | Full app working |
| 10 | Deployment | 9 | GitHub Pages |

---

## Phase Details

→ [Phase 0](./phase-0.md) - Project Scaffolding
→ [Phase 1](./phase-1.md) - Domain Model
→ [Phase 2](./phase-2.md) - Rules Engine
→ [Phase 3](./phase-3.md) - State Management
→ [Phase 4](./phase-4.md) - IndexedDB Persistence
→ [Phase 5](./phase-5.md) - Canvas Rendering
→ [Phase 6](./phase-6.md) - Canvas Interactions
→ [Phase 7](./phase-7.md) - Harta UI
→ [Phase 8](./phase-8.md) - Results Display
→ [Phase 9](./phase-9.md) - Integration
→ [Phase 10](./phase-10.md) - Deployment

---

## Key Design Decisions

### Domain Model is Pure TypeScript
No React, no Astro, no UI dependencies. Can be tested independently.

### Rules Engine is a Pure Function
```ts
simulateInheritance(facts, context) → InheritanceResult
```
Input: board data + simulation context. Output: result with explanations.

### Fractions are Exact
```ts
type Fraction = { numerator: bigint; denominator: bigint }
```
No floating-point. Convert to money only at final stage.

### Canvas State ≠ Domain State
- Domain: Anggota, Hubungan, Harta, PemilikHarta
- Canvas: zoom, pan, selectedIds, activeTool

### Marriage Timeline is Truth
No `isCurrentSpouse` flag. Status derived from tanggal_mulai/berakhir at date of death.

### pewarisId is Simulation State
Not stored in database. User selects per simulation.
