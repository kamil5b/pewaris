# Pewaris - System Summary

## Architecture

```
Astro (Static Shell)
    │
React App (client:load)
    │
    ├── Canvas UI (family visualization)
    │   ├── FamilyCanvas.tsx
    │   ├── CanvasToolbar, ContextMenu, ConnectModal, AddAnggotaModal
    │   └── canvas/ (renderer, nodes, connections, layout, coordinates)
    │
    ├── Zustand Stores (Application State)
    │   ├── family-store (anggota, relationships)
    │   ├── asset-store (harta, ownership)
    │   ├── simulation-store (pewarisId, tanggalKematianPewaris, result)
    │   └── canvas-store (zoom, pan, selection, tools)
    │
    ├── Domain Model (Pure TypeScript)
    │   ├── anggota.ts (id, nama, gender, tanggalLahir, tanggalKematian)
    │   ├── hubungan-horizontal.ts (marriage with timeline)
    │   ├── hubungan-vertical.ts (child linked to marriage)
    │   ├── harta.ts (property + ownership)
    │   ├── simulation.ts (BoardData, SimulationContext)
    │   └── fraction.ts (BigInt exact arithmetic)
    │
    ├── Inheritance Engine (Pure Functions)
    │   ├── relationship.ts (graph traversal)
    │   ├── candidates.ts (resolve heirs from graph)
    │   ├── eligibility.ts (alive check + requirements)
    │   ├── mahjub.ts (blocking rules)
    │   ├── furudh.ts (fixed shares)
    │   ├── ashabah.ts (residue distribution)
    │   ├── awl.ts (proportional reduction)
    │   ├── radd.ts (residue return)
    │   └── calculate.ts (orchestrator)
    │
    └── IndexedDB (Persistence)
        ├── connection.ts, schema.ts, sync.ts
        ├── useAutoSave, useLoadData
        └── exportImport
```

## Domain Model

### Anggota
```ts
type Anggota = {
  id: string
  nama: string
  gender: Gender  // 'LAKI_LAKI' | 'PEREMPUAN'
  tanggalLahir: string
  tanggalKematian: string | null  // NULL jika masih hidup
}
```

### HubunganHorizontal (Marriage)
```ts
type HubunganHorizontal = {
  id: string
  anggotaAId: string
  anggotaBId: string
  tanggalMulai: string
  tanggalMulaiSah: string        // Tanggal sah untuk status hukum
  tanggalBerakhir: string | null
  tanggalBerakhirSah: string | null  // Tanggal sah untuk status hukum
  jenisAkhir: JenisAkhir | null  // 'CERAI_HIDUP' | 'CERAI_MATI'
}
```

### HubunganVertical (Parent-Child)
```ts
type HubunganVertical = {
  id: string
  anakId: string
  hubunganHorizontalId: string
  isNasabAyah: boolean  // apakah anak punya hubungan nasab dengan ayah
  isAdopted: boolean    // apakah anak angkat
}
```

### Harta (Tirkah)
```ts
type Harta = {
  id: string
  anggotaId: string  // Pemilik awal
  nama: string
  nilaiBeli: number
  nilaiSekarang: number
}

type PemilikHarta = {
  id: string
  hartaId: string
  anggotaId: string
  persentase: number
}
```

### SimulationContext
```ts
type SimulationContext = {
  pewarisId: string
  tanggalKematianPewaris: string  // Tanggal kematian pewaris (hak waris terbuka)
}
```

## Key Distinction

- **`tanggalKematian`** (on Anggota) = when a person died
- **`tanggalKematianPewaris`** (in SimulationContext) = when the pewaris died (hak waris terbuka)

## Relationship Derivation

All relationships are **derived** from the graph:

```
ANGGOTA
   │
   ├── HUBUNGAN_HORIZONTAL (marriage)
   │   └── findSpouse(id, board, tanggalKematianPewaris) → string | null
   │
   └── HUBUNGAN_VERTICAL (parent-child)
       └── findChildren(id, board, tanggalKematianPewaris) → string[]
```

From these primitives, derive:
- **Spouse**: active marriage at tanggalKematianPewaris (using tanggal_mulai_sah / tanggal_berakhir_sah)
- **Children**: VERTICAL entries where isAdopted=false AND (isNasabAyah=true OR ibu's child)
- **Parents**: reverse lookup from VERTICAL
- **Siblings**: share same parents
- **Grandparents**: parents of parents
- **Grandchildren**: children of children

### Child Inheritance Rules (Business Rules)
- Anak angkat (isAdopted=true) → bukan ahli waris nasab dari orang tua angkat
- Anak dengan isNasabAyah=false → tidak mewarisi ayah melalui nasab tersebut
- Anak dengan isNasabAyah=true → dapat mewarisi ayah (tetap cek mahjub)
- Ibu selalu punya hubungan nasab (tidak perlu isNasabIbu)
- Perceraian orang tua tidak menghapus nasab anak

## Inheritance Engine Pipeline

```
BoardData + SimulationContext (tanggalKematianPewaris)
        │
        ▼
┌─────────────────────┐
│ 1. resolveCandidates│ ← finds all potential heirs from graph
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. checkEligibility │ ← alive at tanggalKematianPewaris? + nasab check
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 3. determineMahjub  │ ← blocking rules (Pasal 186 KHI)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 4. handleReplacement│ ← Pasal 185 (cucu as pengganti)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 5. classifyHeirs    │ ← furudh, ashabah, pengganti
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 6. calculateFurudh  │ ← fixed shares (Pasal 174-177 KHI)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 7. calculateAshabah │ ← residue distribution (2:1 male:female)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 8. handleAwl        │ ← proportional reduction if total > 1
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 9. handleRadd       │ ← return remainder to furudh heirs
└──────────┬──────────┘
           ▼
     InheritanceResult
```

## Key Rules

### Marriage Timeline
- Marriage is active if: `tanggalBerakhirSah === null || tanggalBerakhirSah > tanggalKematianPewaris`
- Status hukum ditentukan oleh **tanggal sah**, bukan tanggal faktual

### Eligibility (Pasal 172-173 KHI)
- Ada hubungan darah atau perkawinan dengan pewaris
- Masih hidup pada saat pewaris meninggal
- Beragama Islam (pewaris maupun ahli waris)
- Tidak ada sebab penghalang (mahjub)

**Catatan:**
- MVP asumsikan semua anggota Muslim
- Field `agama` belum ditambahkan ke domain model

### Child Inheritance Rules
- Anak angkat (isAdopted=true) → bukan ahli waris nasab dari orang tua angkat
- Anak dengan isNasabAyah=false → tidak mewarisi ayah melalui nasab tersebut
- Anak dengan isNasabAyah=true → dapat mewarisi ayah (tetap cek mahjub)
- Ibu selalu punya hubungan nasab (tidak perlu isNasabIbu)
- Perceraian orang tua tidak menghapus nasab anak

### Heir Replacement (Pasal 185 KHI)
- Ahli waris yang meninggal lebih dahulu dapat digantikan anaknya (cucu)
- Bagian pengganti tidak boleh melebihi bagian ahli waris yang sederajat
- Masih dalam perdebatan interpretasi hukum

### Furudh Shares (Pasal 174-177 KHI)
- Suami with children: 1/4
- Suami without children: 1/2
- Istri with children: 1/8
- Istri without children: 1/4
- Ayah with children: 1/6
- Ibu with children: 1/6
- Ibu without children: 1/3

### Ashabah Shares
- Children split remainder
- Male:Female ratio = 2:1

### Tirkah (Harta Warisan)
- Objek waris adalah tirkah (harta peninggalan yang benar-benar menjadi milik pewaris)
- Bukan sekadar nilai aset

**TODO (MVP nanti):**
- Hutang pewaris perlu dikurangkan dari tirkah sebelum dibagi
- Wasiat perlu di-handle (batas 1/3 dari tirkah, Pasal 200)
- Wasiat wajibah anak angkat perlu di-handle (Pasal 209, batas 1/3)

**TODO (MVP nanti):**
- Hutang pewaris perlu dikurangkan dari tirkah sebelum dibagi
- Wasiat perlu di-handle (batas 1/3 dari tirkah, Pasal 200)
- Wasiat wajibah anak angkat perlu di-handle (Pasal 209, batas 1/3)

## UI Components

### Canvas
- `FamilyCanvas.tsx` - Main canvas with pan/zoom/drag
- `CanvasToolbar.tsx` - Tool selector (Select/Hand/Connect)
- `AddAnggotaModal.tsx` - Add person form
- `ConnectModal.tsx` - Marriage/child connection form
- `ContextMenu.tsx` - Right-click menu

### Panels
- `HartaPanel.tsx` - Property management (tirkah)
- `ResultsPanel.tsx` - Inheritance results display
- `SimulationControls.tsx` - Pewaris selector + tanggal kematian pewaris + calculate button

### Results Display
- `AhliWarisList.tsx` - Heir list with fractions
- `MahjubList.tsx` - Blocked heirs list
- `CalculationSteps.tsx` - Step-by-step breakdown
- `FractionDisplay.tsx` - Renders fraction as "1/4"

## Data Flow

```
Canvas Interaction
       │
       ▼
Zustand Store (family-store, asset-store)
       │
       ▼
BoardData (facts)
       │
       ▼
SimulationContext (pewarisId, tanggalKematianPewaris)
       │
       ▼
simulateInheritance()
       │
       ▼
InheritanceResult
       │
       ▼
Results UI
       │
       ▼
IndexedDB (auto-save)
```

## Tech Stack

- **Framework**: Astro + React
- **State**: Zustand
- **Validation**: Zod
- **Storage**: IndexedDB
- **Styling**: Tailwind CSS
- **Canvas**: HTML5 Canvas 2D
- **Math**: BigInt fractions (exact arithmetic)

## Deployment

- Static site → GitHub Pages
- Config: `site: 'https://kamil5b.github.io/pewaris'`

## Known Issues / TODO

1. No undo/redo (history-store not implemented)
2. No delete key functionality
3. No node editing (double-click to edit)
4. No responsive layout
5. No export/import UI buttons
6. No GitHub Actions workflow
7. Harta ownership UI incomplete (no PemilikHarta editor)
8. Tests minimal (only 2 integration test cases)
9. **Ahli waris pengganti (Pasal 185) belum diimplementasi**
10. **Rule mahjub belum lengkap sesuai KHI**
11. **Daftar ahli waris belum lengkap sesuai klasifikasi KHI**
12. **Perlu tabel seluruh calon ahli waris + syarat + bagian + mahjub + rule pengganti**
13. **Poligami belum di-handle (bagian istri dibagi proporsional)**
14. **Anak angkat belum di-handle (wasiat wajibah Pasal 209 perlu diimplementasi nanti)**
15. **Hutang pewaris belum di-handle (perlu dikurangkan dari tirkah sebelum dibagi)**
16. **Wasiat belum di-handle (batas 1/3 dari tirkah, Pasal 200)**
