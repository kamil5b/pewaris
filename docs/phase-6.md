# Phase 6 - Canvas Interactions

## Goal
Allow user to add, edit, connect, and delete nodes on canvas.

## Tasks

### 6.1 Create Tool System
```
src/canvas/interactions/tools.ts
```
```ts
type ToolHandler = {
  onMouseDown: (e: MouseEvent) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: (e: MouseEvent) => void
  onDoubleClick: (e: MouseEvent) => void
}
```

### 6.2 Implement Select Tool
```
src/canvas/interactions/select.ts
```
- Click to select node
- Shift+click for multi-select
- Drag to select area
- Click empty to deselect

### 6.3 Implement Hand Tool
```
src/canvas/interactions/hand.ts
```
- Drag to pan
- Scroll to zoom

### 6.4 Implement Connect Tool
```
src/canvas/interactions/connect.ts
```
- Click source node
- Drag to target node
- Show preview line
- On release: create connection
- Validate connection type

### 6.5 Create Node Editing
```
src/canvas/interactions/edit-node.ts
```
- Double-click node to edit
- Open inline editor or modal
- Update store on save

### 6.6 Create Context Menu
```
src/components/canvas/ContextMenu.tsx
```
Right-click options:
- Edit node
- Add child
- Add marriage
- Delete

### 6.7 Create Add Node Flow
```
src/canvas/interactions/add-node.ts
```
- Click "Add Anggota" button
- Click on canvas to place
- Or drag from toolbar

### 6.8 Create Delete Flow
```
src/canvas/interactions/delete.ts
```
- Select node(s)
- Press Delete key
- Confirm if has connections
- Remove from store

### 6.9 Create Connection Validation
```
src/canvas/interactions/validate-connection.ts
```
Rules:
- Cannot connect anggota to themselves
- Cannot create duplicate marriage
- Cannot create circular parent-child

## Exit Criteria
- [ ] Can add new anggota
- [ ] Can edit anggota name
- [ ] Can connect two anggota (marriage)
- [ ] Can add child to marriage
- [ ] Can delete anggota
- [ ] Can delete connections
- [ ] Connection validation works

## Files Created
```
src/canvas/interactions/
├── tools.ts
├── select.ts
├── hand.ts
├── connect.ts
├── edit-node.ts
├── add-node.ts
├── delete.ts
└── validate-connection.ts

src/components/canvas/
└── ContextMenu.tsx
```
