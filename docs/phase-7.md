# Phase 7 - Harta UI

## Goal
UI for managing property (harta) and ownership (pemilik harta).

## Tasks

### 7.1 Create Harta Panel Component
```
src/components/harta/HartaPanel.tsx
```
- List of all harta
- Add new harta button
- Total value display

### 7.2 Create Harta Form
```
src/components/harta/HartaForm.tsx
```
Fields:
- Nama
- Nilai Beli
- Nilai Sekarang
- Owner(s) with percentage

### 7.3 Create Pemilik Editor
```
src/components/harta/PemilikEditor.tsx
```
- Add/remove owners
- Set percentage per owner
- Validate total = 100%

### 7.4 Create Harta List Item
```
src/components/harta/HartaListItem.tsx
```
- Name
- Current value
- Owners summary
- Edit/delete actions

### 7.5 Create Ownership Validation
```
src/components/harta/use-ownership-validation.ts
```
```ts
function validateOwnership(hartaId: string): {
  isValid: boolean
  total: number
  errors: string[]
}
```

### 7.6 Create Harta Summary
```
src/components/harta/HartaSummary.tsx
```
- Total assets
- Total by owner
- Ownership distribution chart (optional)

## Exit Criteria
- [ ] Can add harta
- [ ] Can edit harta
- [ ] Can delete harta
- [ ] Can set ownership percentages
- [ ] Ownership validation works (total = 100%)
- [ ] Summary shows totals

## Files Created
```
src/components/harta/
├── HartaPanel.tsx
├── HartaForm.tsx
├── PemilikEditor.tsx
├── HartaListItem.tsx
├── use-ownership-validation.ts
└── HartaSummary.tsx
```
