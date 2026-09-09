# Phase 1 - Domain Model

## Goal
Define all domain types with Zod validation. Pure TypeScript, no UI dependencies.

## Tasks

### 1.1 Create Core Types
```
src/domain/anggota.ts
```
```ts
type Anggota = {
  id: string
  nama: string
}
```

### 1.2 Create Relationship Types
```
src/domain/hubungan-horizontal.ts
```
```ts
type JenisAkhir = "CERAI_HIDUP" | "CERAI_MATI"

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
```

### 1.3 Create Vertical Relationship Type
```
src/domain/hubungan-vertical.ts
```
```ts
type HubunganVertical = {
  id: string
  anakId: string
  hubunganHorizontalId: string
  tanggalLahir: string
}
```

### 1.4 Create Harta Types
```
src/domain/harta.ts
```
```ts
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

### 1.5 Create Simulation Types
```
src/domain/simulation.ts
```
```ts
type SimulationContext = {
  pewarisId: string
  tanggalKematian: string
}
```

### 1.6 Create Fraction Type
```
src/domain/fraction.ts
```
```ts
type Fraction = {
  numerator: bigint
  denominator: bigint
}
```
With utility functions:
- `add(a, b) → Fraction`
- `multiply(a, b) → Fraction`
- `compare(a, b) → -1 | 0 | 1`
- `toNumber(f) → number`
- `fromNumber(n) → Fraction`

### 1.7 Create Zod Schemas
```
src/domain/schemas.ts
```
Each type gets a matching Zod schema:
```ts
const anggotaSchema = z.object({
  id: z.string().uuid(),
  nama: z.string().min(1),
})
```

### 1.8 Create Barrel Export
```
src/domain/index.ts
```
Re-exports all types and schemas.

### 1.9 Write Unit Tests
```
src/domain/__tests__/fraction.test.ts
```
- Test fraction arithmetic
- Test edge cases (zero, negative, overflow)

## Exit Criteria
- [ ] All types defined
- [ ] All Zod schemas validate correctly
- [ ] Fraction arithmetic works exactly
- [ ] No UI/framework imports in domain/
- [ ] Tests pass

## Files Created
```
src/domain/
├── anggota.ts
├── hubungan-horizontal.ts
├── hubungan-vertical.ts
├── harta.ts
├── simulation.ts
├── fraction.ts
├── schemas.ts
├── index.ts
└── __tests__/
    └── fraction.test.ts
```
