# Phase 2 - Rules Engine

## Goal
Build the inheritance calculation engine as pure functions. Testable without UI.

## Tasks

### 2.1 Create Candidate Resolver
```
src/inheritance/candidates.ts
```
Given board data + pewarisId:
- Find all anggota
- Determine which are potential heirs based on relationships
- Return list of candidates with relationship type

### 2.2 Create Relationship Resolver
```
src/inheritance/relationship.ts
```
Derive relationships from graph:
```ts
function getRelationship(fromId, toId, board): RelationshipType
```
Relationship types:
- SUAMI, ISTRI
- AYAH, IBU
- ANAK_LAKI, ANAK_PEREMPUAN
- SAUDARA_LAKI, SAUDARA_PEREMPUAN
- KAKEK, NENEK
- CUCU_LAKI, CUCU_PEREMPUAN

### 2.3 Create Eligibility Rules
```
src/inheritance/eligibility.ts
```
Check if candidate is eligible:
- Still alive at tanggalKematian?
- Has valid relationship?
- No disqualifying conditions?

### 2.4 Create Mahjub Engine
```
src/inheritance/mahjub.ts
```
Determine who is blocked:
```ts
function determineMahjub(candidates, relationships): MahjubResult[]
```
Rules:
- Ayah blocks Kakek
- Anak blocks Cucu
- etc.

### 2.5 Create Furudh Calculator
```
src/inheritance/furudh.ts
```
Calculate fixed shares:
```ts
function calculateFurudh(eligibleHeirs, hartaWarisBersih): FurudhResult[]
```
Share rules:
- Suami: 1/2 (no children) or 1/4 (with children)
- Istri: 1/4 (no children) or 1/8 (with children)
- Ayah: 1/6 (with children) or 1/6 + ashabah (without)
- Ibu: 1/6 (with children) or 1/3 (without, max 1/3)
- etc.

### 2.6 Create Ashabah Calculator
```
src/inheritance/ashabah.ts
```
Calculate residue shares:
```ts
function calculateAshabah(eligibleHeirs, furudhResult, remainder): AshabahResult[]
```
Rules:
- Anak laki-laki : Anak perempuan = 2 : 1
- Other sibling rules

### 2.7 Create 'Awl Handler
```
src/inheritance/awl.ts
```
Handle when shares exceed estate:
```ts
function handleAwl(furudhResult, ashhabResult, estate): AwlResult
```
Proportionally reduce all shares.

### 2.8 Create Radd Handler
```
src/inheritance/radd.ts
```
Handle return of residue tofurudh heirs when no ashabah:
```ts
function handleRadd(furudhResult, remainder): RaddResult
```

### 2.9 Create Main Calculator
```
src/inheritance/calculate.ts
```
Orchestrate the full calculation:
```ts
function simulateInheritance(
  facts: BoardData,
  context: SimulationContext
): InheritanceResult
```

Pipeline:
```
Candidates
  ↓
Relationships
  ↓
Eligibility
  ↓
Mahjub
  ↓
Furudh
  ↓
Ashabah
  ↓
Awl / Radd
  ↓
Final Result
```

### 2.10 Create Result Types
```
src/inheritance/result.ts
```
```ts
type InheritanceResult = {
  pewarisId: string
  hartaWarisanBersih: number
  ahliWaris: AhliWarisResult[]
  mahjub: MahjubResult[]
  calculation: CalculationStep[]
}

type AhliWarisResult = {
  anggotaId: string
  hubungan: string
  bagian: Fraction
  nominal: number
  alasan: string[]
}

type MahjubResult = {
  anggotaId: string
  hubungan: string
  alasan: string[]
  terhalangOleh: string[]
}
```

### 2.11 Write Tests
```
src/inheritance/__tests__/
├── candidates.test.ts
├── mahjub.test.ts
├── furudh.test.ts
├── ashabah.test.ts
├── awl.test.ts
├── radd.test.ts
└── calculate.test.ts
```
Test cases:
- Basic scenario: pewaris + suami + 2 anak
- Scenario with mahjub
- Scenario with furudh only
- Scenario with ashabah only
- Awl scenario
- Radd scenario

## Exit Criteria
- [ ] All functions are pure (no side effects)
- [ ] No UI/framework imports
- [ ] All test cases pass
- [ ] Result includes explanations
- [ ] Fraction arithmetic is exact

## Files Created
```
src/inheritance/
├── candidates.ts
├── relationship.ts
├── eligibility.ts
├── mahjub.ts
├── furudh.ts
├── ashabah.ts
├── awl.ts
├── radd.ts
├── calculate.ts
├── result.ts
├── index.ts
└── __tests__/
    └── *.test.ts
```
