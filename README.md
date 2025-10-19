# PIXI.js Polygon Boolean Operations

Interactive demo for drawing polygons and performing boolean operations (merge/union and split/difference) using `polybooljs`, rendered with `pixi.js-legacy` and bundled by Vite.

## Features

- Draw polygons with a pen tool; auto-close when clicking near the start point
- Rubberband selection: drag a rectangle to select multiple polygons
- Single-click selection: toggle a polygon selection in Select mode
- Merge: unions selected polygons that touch; shows an error if not touching
- Split: draw a slice boundary to cut an intersecting polygon into multiple pieces
- Resolution-independent coordinates via delta scaling on resize
- Inline error feedback in `#error-container`

## Controls

- Toolbar buttons: `Select`, `Pen`, `Split`, `Merge`
- Select: single-click a polygon to toggle selection; drag a rectangle to multi-select
- Pen: left-click to add nodes; move to preview edge; click near first node to close; right-click to cancel/reset
- Split: switch to `Split`, then draw a slice boundary (same interaction as Pen); splits the first polygon that the boundary intersects
- Merge: click `Merge` to union all currently selected polygons; mode returns to `Select` after merging

## Getting Started

- Prerequisites: Node.js 18+ (PNPM or NPM)
- Install: `pnpm install` (or `npm install`)
- Dev: `pnpm dev` (or `npm run dev`) then open the local Vite URL
- Build: `pnpm build` (or `npm run build`)
- Preview: `pnpm preview` (or `npm run preview`)

## Tech Stack

- Rendering: `pixi.js-legacy`
- Boolean ops: `polybooljs` (intersect, difference, union via segments/combine/selectUnion)
- Tooling: Vite + Tailwind CSS

## Architecture & Reactivity

- Reactive store: `src/services/Store.js` uses a JavaScript `Proxy` to observe mutations on `mode`, `deltaValues`, `polygons`, and `selectedPolygons`.
- Selective Rerendering: The Proxy `set` traps emit events (`modeChanged`, `deltaValuesChanged`, `polygonsChanged`, `polygonsSelected`, or `rerenderStage` as fallback).
- UI rerender: View layers subscribe via `window.addEventListener` and repaint interactively:
  - `renderPolygons` listens to store events to redraw and highlight selections.
  - Tools (Pen/Selection) respond to `deltaValuesChanged` to recompute/paint on resize.
  - `rubberbandSelectionStart`/`rubberbandSelectionEnd` temporarily disable/enable polygon interactions during rectangle selection.

## Key Files

- `src/pixi/index.js`: initialize app and render scenes/polygons
- `src/pixi/modes.js`: mode switching (`select`, `pen`, `split`, `merge`)
- `src/pixi/tools/pen.js`: polygon drawing interactions
- `src/pixi/tools/selection.js`: rubberband rectangle selection
- `src/pixi/merge.js` & `src/pixi/slice.js`: boolean operations
- `src/utils/index.js`: coordinate scaling, polygon helpers, polybool adapters
- `src/services/Store.js`: proxy store (`mode`, `deltaValues`, `polygons`, `selectedPolygons`) emitting UI events

## Data Model & Representation

- Polygons are stored as flat arrays: `[x, y, x, y, ...]` and auto-closed by repeating the first `[x, y]`
- Operations convert polygons to `polybooljs` `regions` format for computation

## Notes

- Merge requires selected polygons to touch; otherwise an error is shown
- Split affects the first polygon that intersects the drawn boundary
- Global debug: `window.app`, `window.store`, `window.pixiStore` are available
