# Phase 3 - State Management

## Goal
Create Zustand stores for application state. Separate domain state from canvas state.

## Tasks

### 3.1 Create Family Store
```
src/store/family-store.ts
```
```ts
type FamilyState = {
  anggota: Anggota[]
  hubunganHorizontal: HubunganHorizontal[]
  hubunganVertical: HubunganVertical[]

  addAnggota: (anggota: Anggota) => void
  updateAnggota: (id: string, data: Partial<Anggota>) => void
  removeAnggota: (id: string) => void

  addHubunganHorizontal: (hub: HubunganHorizontal) => void
  updateHubunganHorizontal: (id: string, data: Partial<HubunganHorizontal>) => void
  removeHubunganHorizontal: (id: string) => void

  addHubunganVertical: (hub: HubunganVertical) => void
  updateHubunganVertical: (id: string, data: Partial<HubunganVertical>) => void
  removeHubunganVertical: (id: string) => void
}
```

### 3.2 Create Asset Store
```
src/store/asset-store.ts
```
```ts
type AssetState = {
  harta: Harta[]
  pemilikHarta: PemilikHarta[]

  addHarta: (harta: Harta) => void
  updateHarta: (id: string, data: Partial<Harta>) => void
  removeHarta: (id: string) => void

  addPemilikHarta: (pemilik: PemilikHarta) => void
  updatePemilikHarta: (id: string, data: Partial<PemilikHarta>) => void
  removePemilikHarta: (id: string) => void
}
```

### 3.3 Create Simulation Store
```
src/store/simulation-store.ts
```
```ts
type SimulationState = {
  pewarisId: string | null
  tanggalKematian: string

  setPewaris: (id: string) => void
  setTanggalKematian: (date: string) => void

  result: InheritanceResult | null
  calculate: () => void
}
```

### 3.4 Create Canvas Store
```
src/store/canvas-store.ts
```
```ts
type CanvasState = {
  zoom: number
  panX: number
  panY: number
  selectedIds: string[]
  activeTool: "SELECT" | "HAND" | "CONNECT"

  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  select: (ids: string[]) => void
  setTool: (tool: CanvasTool) => void
}
```

### 3.5 Create History Store
```
src/store/history-store.ts
```
```ts
type HistoryState = {
  past: StateSnapshot[]
  future: StateSnapshot[]

  push: (snapshot: StateSnapshot) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}
```

### 3.6 Create Store Index
```
src/store/index.ts
```
Re-exports all stores.

## Exit Criteria
- [ ] All stores defined
- [ ] No circular dependencies
- [ ] Stores are independent of UI components
- [ ] Actions are pure state transitions

## Files Created
```
src/store/
├── family-store.ts
├── asset-store.ts
├── simulation-store.ts
├── canvas-store.ts
├── history-store.ts
└── index.ts
```
