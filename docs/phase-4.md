# Phase 4 - IndexedDB Persistence

## Goal
Persist board data to IndexedDB. Auto-save and load on startup.

## Tasks

### 4.1 Create DB Schema
```
src/db/schema.ts
```
```ts
const DB_NAME = 'pewaris-db'
const DB_VERSION = 1

const stores = {
  anggota: 'id',
  hubunganHorizontal: 'id',
  hubunganVertical: 'id',
  harta: 'id',
  pemilikHarta: 'id',
}
```

### 4.2 Create DB Connection
```
src/db/connection.ts
```
```ts
function openDB(): Promise<IDBDatabase>
function closeDB(): void
```

### 4.3 Create CRUD Operations
```
src/db/anggota-db.ts
src/db/hubungan-db.ts
src/db/harta-db.ts
```
Each provides:
- `getAll() → T[]`
- `getById(id) → T`
- `create(item) → T`
- `update(id, data) → T`
- `remove(id) → void`

### 4.4 Create Sync Layer
```
src/db/sync.ts
```
```ts
function loadAllData(): Promise<BoardData>
function saveAllData(data: BoardData): Promise<void>
```

### 4.5 Create Auto-Save Hook
```
src/db/use-auto-save.ts
```
```ts
function useAutoSave(store, db) {
  // Subscribe to store changes
  // Debounce writes to IndexedDB
  // Save on page unload
}
```

### 4.6 Create Load on Mount
```
src/db/use-load-data.ts
```
```ts
function useLoadData(): {
  isLoading: boolean
  error: Error | null
}
```
- Load data from IndexedDB on app mount
- Populate Zustand stores

### 4.7 Create Export/Import
```
src/db/export-import.ts
```
```ts
function exportData(): Promise<Blob>
function importData(file: File): Promise<void>
```
JSON format for portability.

## Exit Criteria
- [ ] Data persists across page reloads
- [ ] Auto-save works (debounced)
- [ ] Load on mount populates stores
- [ ] Export produces valid JSON
- [ ] Import restores state correctly

## Files Created
```
src/db/
├── schema.ts
├── connection.ts
├── anggota-db.ts
├── hubungan-db.ts
├── harta-db.ts
├── sync.ts
├── use-auto-save.ts
├── use-load-data.ts
├── export-import.ts
└── index.ts
```
