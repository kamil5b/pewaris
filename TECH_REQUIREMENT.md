

Its not a generic node canvas. You have **two distinct systems**:

1. **Family/harta canvas** — visual editing and interaction.
2. **Inheritance rules engine** — deterministic domain logic that derives heirs, mahjub status, and shares.

The critical architectural principle should be:

> **Canvas is a UI for manipulating facts. It is not the source of truth for inheritance decisions.**

## Recommended architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         ASTRO APP                            │
│                  Static / GitHub Pages                      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 React Canvas App                      │  │
│  │                                                       │  │
│  │  Family Canvas        Property Canvas       Results   │  │
│  │  ┌─────────────┐     ┌─────────────┐      ┌───────┐ │  │
│  │  │ Anggota     │     │ Harta       │      │ Heirs │ │  │
│  │  │ Marriage    │     │ Ownership   │      │Mahjub │ │  │
│  │  │ Children    │     │ Connections │      │Shares │ │  │
│  │  └──────┬──────┘     └──────┬──────┘      └───┬───┘ │  │
│  │         │                   │                  │     │  │
│  └─────────┼───────────────────┼──────────────────┼─────┘  │
│            │                   │                  │        │
│            └───────────────────┼──────────────────┘        │
│                                ▼                           │
│                     ┌──────────────────┐                   │
│                     │   Domain Model   │                   │
│                     └────────┬─────────┘                   │
│                              ▼                             │
│                     ┌──────────────────┐                   │
│                     │ Inheritance      │                   │
│                     │ Rules Engine     │                   │
│                     └────────┬─────────┘                   │
│                              ▼                             │
│                     Simulation Result                      │
│                                                             │
│                         Zustand                            │
│                              │                              │
│                              ▼                              │
│                         IndexedDB                           │
└─────────────────────────────────────────────────────────────┘
```

# Tech stack

### Core

```text
Astro
React
TypeScript
Zustand
Canvas 2D
IndexedDB
Zod
Tailwind CSS
```

I'd use **TypeScript heavily** here because your domain rules are complicated enough that strong types will pay off.

---

# Most important separation

Don't do this:

```text
Canvas
  ↓
Zustand
  ↓
"calculate who inherits"
```

Instead:

```text
Canvas
  ↓
Application State
  ↓
Domain Model
  ↓
Rules Engine
  ↓
Inheritance Result
```

The rules engine should ideally be **completely independent of Astro, React, Canvas, and Zustand**.

For example:

```text
src/
├── domain/
│   ├── anggota.ts
│   ├── hubungan-horizontal.ts
│   ├── hubungan-vertical.ts
│   ├── harta.ts
│   └── pemilik-harta.ts
│
├── inheritance/
│   ├── candidates.ts
│   ├── relationship.ts
│   ├── eligibility.ts
│   ├── mahjub.ts
│   ├── furudh.ts
│   ├── ashabah.ts
│   ├── awl.ts
│   ├── radd.ts
│   └── calculate.ts
│
├── application/
│   ├── create-anggota.ts
│   ├── create-marriage.ts
│   ├── create-child.ts
│   ├── create-harta.ts
│   └── simulate-waris.ts
│
├── store/
│   ├── family-store.ts
│   ├── asset-store.ts
│   ├── viewport-store.ts
│   └── history-store.ts
│
├── canvas/
│   ├── renderer.ts
│   ├── coordinates.ts
│   ├── hit-testing.ts
│   └── interactions/
│
└── components/
    ├── canvas/
    ├── anggota/
    ├── harta/
    ├── toolbar/
    └── results/
```

---

# Domain model

Your database schema translates naturally into TypeScript.

```ts
type Anggota = {
  id: string
  nama: string
}

type HubunganHorizontal = {
  id: string
  anggotaAId: string
  anggotaBId: string

  tanggalMulai: string
  tanggalMulaiSah: string

  tanggalBerakhir: string | null
  tanggalBerakhirSah: string | null
  jenisAkhir: JenisAkhir | null
}

type HubunganVertical = {
  id: string
  anakId: string
  hubunganHorizontalId: string
  tanggalLahir: string
}

type Harta = {
  id: string
  anggotaId: string
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

And:

```ts
type JenisAkhir =
  | "CERAI_HIDUP"
  | "CERAI_MATI"
```

Notice that the nullable database fields stay nullable in the domain model.

---

# Pewaris should NOT be in the database

I agree strongly with this:

```text
pewarisId
```

is application/simulation state.

For example:

```ts
type SimulationContext = {
  pewarisId: string
  tanggalKematian: string
}
```

Then:

```text
Board data
+
SimulationContext
        ↓
Inheritance Engine
        ↓
Result
```

This is much cleaner.

---

# Family graph

Your actual family graph should be derived from:

```text
ANGGOTA
   │
   ├── HUBUNGAN_HORIZONTAL
   │
   └── HUBUNGAN_VERTICAL
```

You shouldn't store:

```text
ayahId
ibuId
suamiId
istriId
kakekId
nenekId
```

because those are **derived relationships**.

For example:

```text
A ───── B
       │
       │ marriage
       │
       ├──── C
       └──── D
```

The engine can derive:

```text
C
├── father = A
├── mother = B
├── sibling = D
└── ...
```

depending on the semantics/rules you define.

---

# Marriage timeline

This is particularly important.

Don't do:

```ts
isCurrentSpouse: boolean
```

Instead you already have the better model:

```text
tanggal_mulai
tanggal_mulai_sah
tanggal_berakhir
tanggal_berakhir_sah
jenis_akhir
```

Then the inheritance engine asks:

```text
Was marriage valid at tanggalKematian?
        │
        ├── YES → spouse candidate
        │
        └── NO  → evaluate historical status/rules
```

That makes historical simulation possible.

For example:

```text
2010 ───────────── 2020 ───────────── 2026
       marriage          divorce        death
```

The answer depends on **when the death occurred**.

---

# Canvas state vs domain state

This distinction is extremely important.

### Domain state

```text
Anggota
HubunganHorizontal
HubunganVertical
Harta
PemilikHarta
```

### Canvas/UI state

```text
selectedNodeIds
viewportX
viewportY
zoom
activeTool
draggingNode
connectingFrom
sidebarOpen
```

Don't mix them.

For example:

```ts
type CanvasState = {
  zoom: number
  panX: number
  panY: number
  selectedIds: string[]
  activeTool: "SELECT" | "HAND" | "CONNECT"
}
```

This state has nothing to do with inheritance.

---

# Inheritance engine

This should be a pure function as much as possible:

```ts
simulateInheritance(
  facts,
  simulationContext
): InheritanceResult
```

Conceptually:

```text
Facts
 │
 │
 ├── Anggota
 ├── Horizontal relationships
 ├── Vertical relationships
 ├── Harta
 └── Ownership
        │
        ▼
Simulation Context
 │
 ├── pewarisId
 └── tanggalKematian
        │
        ▼
┌───────────────────────────┐
│ Candidate Resolver        │
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ Relationship Resolver     │
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ Eligibility Rules         │
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ Mahjub Engine             │
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ Furudh                    │
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ Ashabah                   │
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ 'Awl / Radd               │
└─────────────┬─────────────┘
              ▼
       Final Result
```

---

# Result should be explainable

I'd make the output richer than just:

```text
Ali → 1/6
```

Instead:

```ts
type WarisResult = {
  pewarisId: string

  hartaWarisanBersih: number

  ahliWaris: AhliWarisResult[]
  mahjub: MahjubResult[]

  calculation: CalculationStep[]
}
```

For example:

```ts
type AhliWarisResult = {
  anggotaId: string
  hubungan: string

  bagian: Fraction
  nominal: number

  alasan: string[]
}
```

And:

```ts
type MahjubResult = {
  anggotaId: string
  hubungan: string

  alasan: string[]
  terhalangOleh: string[]
}
```

This gives you an **auditable rules engine**.

That's especially valuable for inheritance software because users will inevitably ask:

> "Kenapa orang ini tidak dapat bagian?"

Your engine should be able to answer that from the result.

---

# Fraction handling

One thing I'd strongly recommend:

**Do not represent inheritance fractions as JavaScript floating-point numbers.**

Don't do:

```ts
0.1666666667
```

Use an exact rational representation:

```ts
type Fraction = {
  numerator: bigint
  denominator: bigint
}
```

So:

```text
1/6
1/4
1/8
2/3
```

remain exact throughout the calculation.

Then convert to money only at the final stage.

This becomes especially important for:

```text
furudh
ashabah
'awl
radd
```

---

# Harta calculation

I'd also separate this from the heir calculation.

```text
Asset Engine
      │
      ▼
Determine ownership
      │
      ▼
Pewaris's ownership
      │
      ▼
Gross inheritance estate
      │
      ▼
Deductions / obligations
      │
      ▼
Net inheritance estate
```

Then:

```text
Net inheritance estate
          │
          ▼
Inheritance Rules Engine
          │
          ▼
Shares
```

So you don't end up with one gigantic `calculate()` function.

---

# The final architecture

I'd target this:

```text
                         ┌───────────────┐
                         │     Astro     │
                         │ Static Shell  │
                         └───────┬───────┘
                                 │
                                 ▼
                       ┌──────────────────┐
                       │   React App      │
                       └────────┬─────────┘
                                │
             ┌──────────────────┼─────────────────┐
             ▼                  ▼                 ▼
        Canvas/UI           Zustand          Simulation
             │                  │                 │
             │                  │                 ▼
             │                  │          ┌─────────────┐
             │                  │          │ Asset Engine│
             │                  │          └──────┬──────┘
             │                  │                 ▼
             │                  │          ┌─────────────┐
             │                  └─────────►│ Rules Engine│
             │                             └──────┬──────┘
             │                                    │
             ▼                                    ▼
       Canvas Renderer                       Waris Result
             │                                    │
             └────────────────────────────────────┘
                              │
                              ▼
                         IndexedDB
```

### In one sentence

**Astro hosts the application, React owns the interactive canvas, Zustand manages application/UI state, Canvas handles visual rendering, IndexedDB stores local facts, and a pure TypeScript domain/rules engine independently calculates harta warisan → kandidat → ahli waris → mahjub → furudh/ashabah → 'awl/radd.**

That separation will let you build the UI freely **without contaminating the inheritance logic with canvas concerns**, which is the most important architectural decision for this project.

It have to deployed in Github page
