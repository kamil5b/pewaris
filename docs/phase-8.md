# Phase 8 - Results Display

## Goal
Display inheritance calculation results with explanations.

## Tasks

### 8.1 Create Results Panel Component
```
src/components/results/ResultsPanel.tsx
```
- Trigger calculation
- Display results
- Show/hide details

### 8.2 Create Simulation Controls
```
src/components/results/SimulationControls.tsx
```
- Select pewaris (dropdown or click)
- Set tanggal kematian (date picker)
- Calculate button

### 8.3 Create Ahli Waris List
```
src/components/results/AhliWarisList.tsx
```
For each heir:
- Name
- Relationship
- Share fraction
- Nominal amount
- Reason (expandable)

### 8.4 Create Mahjub List
```
src/components/results/MahjubList.tsx
```
For each blocked:
- Name
- Relationship
- Reason blocked
- Blocked by whom

### 8.5 Create Calculation Steps
```
src/components/results/CalculationSteps.tsx
```
Expandable step-by-step:
- Step 1: Determine candidates
- Step 2: Check eligibility
- Step 3: Apply mahjub
- Step 4: Calculate furudh
- Step 5: Calculate ashabah
- Step 6: Handle awl/radd
- Final: Distribution

### 8.6 Create Harta Waris Summary
```
src/components/results/HartaWarisSummary.tsx
```
- Total harta
- Pewaris's share
- Deductions
- Net warisan

### 8.7 Create Fraction Display
```
src/components/results/FractionDisplay.tsx
```
Renders fraction as:
- `1/6`
- `1/4`
- `2/3`
- Or mixed number if needed

### 8.8 Create Result Export
```
src/components/results/export-result.ts
```
```ts
function exportResult(result: InheritanceResult): string
```
Format as readable text or PDF-ready.

## Exit Criteria
- [ ] Can select pewaris
- [ ] Can set tanggal kematian
- [ ] Calculation runs
- [ ] Ahli waris displayed with shares
- [ ] Mahjub displayed with reasons
- [ ] Calculation steps are explainable
- [ ] Harta waris bersih shown

## Files Created
```
src/components/results/
├── ResultsPanel.tsx
├── SimulationControls.tsx
├── AhliWarisList.tsx
├── MahjubList.tsx
├── CalculationSteps.tsx
├── HartaWarisSummary.tsx
├── FractionDisplay.tsx
└── export-result.ts
```
