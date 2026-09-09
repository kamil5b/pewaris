# Phase 5 - Canvas Rendering

## Goal
Render family tree on Canvas 2D. Nodes and connections visible.

## Tasks

### 5.1 Create Canvas Component
```
src/components/canvas/FamilyCanvas.tsx
```
- HTML canvas element
- Resize observer
- RequestAnimationFrame loop

### 5.2 Create Renderer
```
src/canvas/renderer.ts
```
```ts
function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: CanvasRenderState
): void
```
Render pipeline:
1. Clear canvas
2. Apply transform (pan/zoom)
3. Draw connections
4. Draw nodes
5. Draw selection indicators
6. Draw active tool feedback

### 5.3 Create Node Renderer
```
src/canvas/nodes.ts
```
```ts
function drawAnggotaNode(
  ctx: CanvasRenderingContext2D,
  node: AnggotaNode,
  isSelected: boolean
): void
```
Visual:
- Rectangle with rounded corners
- Name text
- Gender indicator (if applicable)
- Selection highlight

### 5.4 Create Connection Renderer
```
src/canvas/connections.ts
```
```ts
function drawMarriageConnection(
  ctx: CanvasRenderingContext2D,
  conn: MarriageConnection
): void

function drawParentChildConnection(
  ctx: CanvasRenderingContext2D,
  conn: ParentChildConnection
): void
```
Visual:
- Horizontal line for marriage
- Vertical line for parent-child
- Dashed for inactive

### 5.5 Create Coordinate System
```
src/canvas/coordinates.ts
```
```ts
function screenToCanvas(x, y, transform): Point
function canvasToScreen(x, y, transform): Point
```

### 5.6 Create Hit Testing
```
src/canvas/hit-testing.ts
```
```ts
function hitTest(
  x: number,
  y: number,
  nodes: AnggotaNode[]
): string | null
```

### 5.7 Create Layout Engine
```
src/canvas/layout.ts
```
```ts
function autoLayout(
  anggota: Anggota[],
  horizontal: HubunganHorizontal[],
  vertical: HubunganVertical[]
): AnggotaNode[]
```
Basic tree layout algorithm.

### 5.8 Create Canvas State Hook
```
src/canvas/use-canvas-state.ts
```
```ts
function useCanvasState(): CanvasRenderState
```
Combines:
- Family store data
- Canvas store (zoom, pan)
- Node positions

## Exit Criteria
- [ ] Canvas renders anggota nodes
- [ ] Marriage connections visible
- [ ] Parent-child connections visible
- [ ] Pan works
- [ ] Zoom works
- [ ] Nodes are selectable

## Files Created
```
src/canvas/
├── renderer.ts
├── nodes.ts
├── connections.ts
├── coordinates.ts
├── hit-testing.ts
├── layout.ts
└── use-canvas-state.ts

src/components/canvas/
├── FamilyCanvas.tsx
└── CanvasToolbar.tsx
```
