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
  tanggalMulai: string | null
  tanggalMulaiSah: string | null      // NULL = tidak sah secara hukum → bukan pasangan
  tanggalBerakhir: string | null
  tanggalBerakhirSah: string | null   // Tanggal sah untuk status hukum
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

### Candidate
```ts
type KategoriWaris = 'FURUDH' | 'ASHABAH' | 'PENGGANTI'

type Candidate = {
  anggotaId: string
  kategori: KategoriWaris
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
   │   ├── findSpouses(id, board, tanggalKematian) → string[] (poligami)
   │   └── findSpouse(id, board, tanggalKematian) → string | null
   │
   └── HUBUNGAN_VERTICAL (parent-child)
       └── findChildren(id, board, tanggalKematian?) → string[]
```

From these primitives, derive:
- **Spouse**: active marriage at tanggalKematian (requires `tanggal_mulai_sah !== null`, uses tanggal_mulai_sah / tanggal_berakhir_sah)
- **Children**: VERTICAL entries where isAdopted=false AND (isNasabAyah=true OR ibu's child); excludes those born after tanggalKematian
- **Sons / Daughters**: children filtered by gender
- **Parents**: `findParentsOf` (reverse lookup), `findFather`, `findMother`
- **Siblings**: `findSiblingsKandung` (ayah+ibu sama), `findSiblingsSeayah`, `findSiblingsSeibu`
- **Grandparents**: `findGrandfather`, `findGrandmothers`
- **Grandchildren**: `findGrandchildrenFromSon`, `findGrandchildrenFromDaughter`
- **Paman**: `findPaman` (saudara laki-laki ayah)
- **Pengganti**: `findCucuPengganti` (cucu dari anak yang meninggal sebelum pewaris, Pasal 185)

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
│ 1. resolveCandidates│ ← resolve semua kandidat dari graph
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. checkEligibility │ ← lahir sebelum tanggal warisan + hidup
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 3. determineMahjub  │ ← blocking rules (Pasal 186 KHI)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 4. handleReplacement│ ← Pasal 185 (cucu sebagai pengganti)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 5. classifyHeirs    │ ← furudh, ashabah, pengganti (dari kategori)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 6. calculateFurudh  │ ← semua bagian tetap (Pasal 174-184 KHI)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 7. calculateAshabah │ ← distribusi sisa (prioritas KHI, 2:1)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 8. handleAwl        │ ← pengurangan proporsional jika total > 1
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 9. handleRadd       │ ← kembalikan sisa ke furudh non-pasangan
└──────────┬──────────┘
           ▼
     InheritanceResult
```

## Key Rules

### Marriage Timeline
- Pasangan aktif jika: `tanggalMulaiSah !== null && (tanggalBerakhirSah === null || tanggalBerakhirSah > tanggalKematianPewaris)`
- Jika `tanggalMulaiSah === null` → pernikahan tidak sah → **bukan pasangan**, dan **`isNasabAyah` otomatis false**
- Status hukum ditentukan oleh **tanggal sah**, bukan tanggal faktual

### Eligibility (Pasal 172-173 KHI)
- Lahir sebelum tanggal kematian pewaris (`tanggalLahir <= tanggalWarisan`)
- Masih hidup saat pewaris meninggal (`tanggalKematian > tanggalWarisan` atau NULL)
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

### Furudh Shares (Pasal 174-184 KHI)

| Ahli Waris | Kondisi | Bagian |
|-----------|---------|--------|
| Suami | Ada anak/pengganti | 1/4 |
| Suami | Tidak ada anak/pengganti | 1/2 |
| Istri (banyak) | Ada anak/pengganti | 1/4 ÷ jumlah istri |
| Istri (banyak) | Tidak ada anak/pengganti | 1/2 ÷ jumlah istri |
| Ayah | Ada anak | 1/6 |
| Ayah | Tidak ada anak | 1/3 |
| Ibu | Ada anak (1+) | 1/6 |
| Ibu | Tidak ada anak | 1/3 |
| Anak perempuan 1 | Tidak ada anak laki-laki | 1/2 |
| Anak perempuan 2+ | Tidak ada anak laki-laki | 2/3 total |
| Cucu perempuan 1 | Tanpa cucu laki-laki | 1/6 |
| Cucu perempuan 2+ | Tanpa cucu laki-laki | 1/3 total |
| Saudara kandung perempuan 1 | Tanpa anak | 1/2 |
| Saudara kandung perempuan 2+ | Tanpa anak | 2/3 total |
| Saudara seayah perempuan 1 | Tanpa anak + tanpa kandung perempuan | 1/2 |
| Saudara seayah perempuan 2+ | Tanpa anak + tanpa kandung perempuan | 2/3 total |
| Saudara seibu (1) | Tanpa anak | 1/6 |
| Saudara seibu (2+) | Tanpa anak | 1/3 total |
| Kakek | Selalu (bila tidak mahjub) | 1/6 |
| Nenek (garis ayah) | Ada anak | 1/6 |
| Nenek (garis ayah) | Tidak ada anak | 1/3 |
| Nenek (garis ibu) | Selalu | 1/6 |

**Catatan Poligami:** Bagian istri dibagi proporsional sesuai jumlah istri aktif. Contoh: 2 istri + anak → masing-masing 1/8.

### Ashabah (Urutan Prioritas)
1. Anak laki-laki (+ anak perempuan, rasio 2:1)
2. Cucu laki-laki dari anak laki-laki (pengganti)
3. Saudara laki-laki kandung
4. Saudara laki-laki seayah
5. Paman

### Mahjub (Pasal 186 KHI)
| Pemahjub | Yang Terhalang |
|----------|---------------|
| Anak laki-laki | Cucu perempuan, saudara, kakek, nenek, saudara seibu |
| Anak pewaris | Cucu perempuan |
| Saudara kandung laki-laki | Saudara seayah, kakek |
| Saudara kandung perempuan | Saudara seayah perempuan |
| Suami/Istri | Kakek, nenek |
| Saudara seayah laki-laki | Kakek |
| Nenek garis ayah | Nenek garis lainnya |

**Catatan:** Anak perempuan **tidak** mahjub oleh anak laki-laki — keduanya tetap menerima bagian melalui ashabah (2:1).

### Tirkah (Harta Warisan)
- Objek waris adalah tirkah (harta peninggalan yang benar-benar menjadi milik pewaris)
- Bukan sekadar nilai aset

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
8. **Pasal 185 (ahli waris pengganti)**: teratasi di kandidat, tetapi batasan bagian pengganti masih perlu divalidasi lebih lanjut
9. **Hutang pewaris belum di-handle** (perlu dikurangkan dari tirkah sebelum dibagi)
10. **Wasiat belum di-handle** (batas 1/3 dari tirkah, Pasal 200)
11. **Wasiat wajibah anak angkat belum di-handle** (Pasal 209, batas 1/3)
12. **Anak angkat dimodelkan non-nasab** — belum ada wasiat wajibah engine
13. **Mahjub belum selengkap tabel KHI** — masih fokus pada inti kasus umum
14. **Cucu laki-laki dari anak perempuan** belum diterapkan sebagai pengganti (hanya dari anak laki-laki)
