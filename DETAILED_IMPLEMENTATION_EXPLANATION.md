# VectorShift Assessment - Detailed Implementation Explanation

This document explains what the original assessment asked for, what was implemented, why each change was made, and how the implementation evolved. Sections 2-9 preserve the original implementation walkthrough; Section 10 is the authoritative map for the current feature-based source paths and line numbers.

## 1. Overall Architecture

The application has five main layers:

1. `frontend/src/app/` owns lightweight routing and route-level lazy loading.
2. `frontend/src/pages/landing/` owns the public landing experience.
3. `frontend/src/features/pipeline-builder/` owns Builder components, nodes, API access, graph utilities, and Zustand state.
4. `frontend/src/shared/styles/` owns design tokens and the small amount of truly global CSS.
5. `backend/main.py` receives the submitted graph and returns graph statistics.

`frontend/src/app/App.jsx` lines 4-22 lazy-load the Builder and select the route. `frontend/src/features/pipeline-builder/BuilderPage.jsx` lines 10-54 composes the header, mobile palette layer, command/canvas workspace, and submission action.

---

## 2. Assessment Part 1 - Node Abstraction

### Actual task

The four supplied nodes repeated similar JSX for titles, fields, handles, dimensions, and styling. The task required one reusable abstraction and five additional nodes that demonstrate its flexibility.

### What changed

`frontend/src/nodes/BaseNode.js` became the reusable node renderer.

- Lines 5-10 map simple side names such as `left` and `right` to React Flow positions.
- Lines 12-18 calculate field default values. Defaults may be static strings or functions based on the node ID.
- Lines 20-27 automatically resize textareas to their content height.
- Lines 29-41 distribute multiple handles cleanly down one side when no explicit position is provided.
- Lines 43-55 define the configuration API: title, subtitle, fields, handles, width, minimum height, children, and field-change callback.
- Lines 58-65 build initial field state from saved node data or field defaults.
- Lines 67-73 synchronize missing default values into the global pipeline store so submission includes them.
- Lines 75-88 update both local input state and Zustand node data whenever a user edits a field.
- Lines 90-142 render select, textarea, or standard input controls from configuration objects.
- Lines 144-183 generate React Flow handles with unique IDs, positions, and labels.
- Lines 185-191 render the shared header, fields, and optional content in one consistent structure.

### Why this design

Adding a node now means describing its fields and handles instead of duplicating an entire component. Bug fixes and styling changes in `BaseNode` automatically apply to every node.

### Refactored supplied nodes

- `frontend/src/nodes/inputNode.js` lines 3-27 configures Input fields and one output handle.
- `frontend/src/nodes/outputNode.js` lines 3-30 configures Output fields and one input handle.
- `frontend/src/nodes/llmNode.js` lines 3-26 configures its model selector, two inputs, and response output.
- `frontend/src/nodes/textNode.js` lines 20-67 uses the same abstraction while adding dynamic Text behavior.

### Five additional nodes

All five are configuration-based examples in `frontend/src/nodes/utilityNodes.js`:

- Transform: lines 3-23.
- Filter: lines 25-43.
- API: lines 45-70.
- Branch: lines 72-91.
- Merge: lines 93-114.

They demonstrate select fields, text fields, multiple inputs, multiple outputs, custom labels, and custom handle positions without rewriting shared UI code.

---

## 3. Assessment Part 2 - Styling

### Actual task

The supplied frontend had almost no visual design. The requirement was an appealing and unified interface.

### What changed

The complete design system is in `frontend/src/index.css`.

- Builder page structure and dedicated workspace: lines 557-625.
- Node palette and palette controls: lines 627-792.
- Compact command toolbar: lines 681-737.
- Canvas frame: lines 799-808.
- Shared node card and field styling: lines 810-910.
- Handle labels: lines 911-940.
- Submit button and interaction states: lines 954-988.
- Mobile responsive behavior: lines 990-1179.

### Why these changes

The builder needs strong visual hierarchy: navigation first, node creation second, editing commands third, canvas as the main workspace, and submission last. Shared CSS keeps every node visually consistent and avoids the original jumbled labels and fields.

### Landing page and separate builder

`frontend/src/App.js` lines 79-200 implement the landing page. Lines 202-247 implement a separate full-space Builder. The small client-side router at lines 43-77 and 249-263 switches between `/` and `/builder` without adding a routing dependency.

This separation was added because embedding a working canvas inside the landing page reduced usable workspace and mixed marketing content with operational controls.

---

## 4. Assessment Part 3 - Text Node Logic

### Actual task

The Text node had to grow as text increased and create a left-side handle whenever the text contained a valid JavaScript variable inside double curly brackets.

### What changed

The logic is in `frontend/src/nodes/textNode.js`.

- Line 5 defines the variable pattern. It accepts names such as `input`, `_value`, or `$item`, but rejects invalid JavaScript identifiers.
- Lines 7-18 extract variables into a `Set`, which removes duplicates.
- Line 21 stores the current text.
- Line 24 recalculates variables only when the text changes.
- Lines 26-27 calculate width from the longest line, with safe minimum and maximum widths.
- Lines 29-31 tell React Flow to recalculate handle geometry after variables change.
- Lines 40-49 configure the autosizing textarea.
- Lines 50-59 convert every detected variable into a target handle and retain one text output handle.
- Lines 60-64 update local Text-node state when the shared BaseNode field changes.

Vertical growth is handled by `BaseNode.js` lines 20-27 and 114-125, where the textarea height is reset and then set to its `scrollHeight`.

### Example

Typing `Write about {{topic}} for {{audience}}` produces two left handles named `topic` and `audience`. Repeating `{{topic}}` does not create a duplicate because extraction uses a Set.

---

## 5. Assessment Part 4 - Backend Integration

### Actual task

Submit the current nodes and edges to `POST /pipelines/parse`. The backend must return the number of nodes, number of edges, and whether the graph is a directed acyclic graph. The frontend must show those values in an alert. A PDF or downloadable report was not required.

### Frontend flow

`frontend/src/submit.js`:

- Line 7 defines the backend URL and allows deployment override through `REACT_APP_API_URL`.
- Lines 9-16 read nodes and edges from Zustand and track loading state.
- Lines 18-28 send `{ nodes, edges }` as JSON to `/pipelines/parse`.
- Lines 30-32 reject non-success HTTP responses.
- Lines 34-44 display `num_nodes`, `num_edges`, and `is_dag` in the required user-friendly alert.
- Lines 45-49 display an error alert and always restore the button state.
- Lines 52-57 render the button and prevent repeat submission while the request is active.

### Backend flow

`backend/main.py`:

- Lines 9-15 enable frontend-to-backend requests during local development.
- Lines 18-20 define and validate the request shape.
- Lines 23-40 build an adjacency list from node IDs and directed edges.
- Lines 41-61 perform depth-first search using `visiting` and `visited` states. Reaching a `visiting` node means a cycle exists, so the graph is not a DAG.
- Lines 68-74 expose `/pipelines/parse` and return the exact required response.

### Final result

For a graph with nine nodes, nine edges, and no directed cycle, the alert correctly displays:

```text
Pipeline summary

Nodes: 9
Edges: 9
Valid DAG: Yes
```

---

## 6. Builder Usability Phase 1 - Recent Changes

These changes were production-usability improvements beyond the four mandatory assessment tasks.

### Step 1 - Correct zoom and node scale

Problem: automatic fitting on a nearly empty canvas could make the first node appear excessively large.

Implementation:

- `frontend/src/builderUtils.js` lines 20-34 defines a 1x starting viewport, zoom range `0.4-1.5`, and Fit View capped at 1x.
- `frontend/src/ui.js` lines 195-200 passes those settings to React Flow and enables the 20px snap grid.

Why: nodes should initially render at their authored dimensions, while still allowing controlled zooming.

### Step 2 - Prevent poor initial placement

Problem: dropping or tapping multiple nodes at the same position caused overlap.

Implementation:

- `builderUtils.js` lines 3-18 defines grid spacing and estimated dimensions for every node.
- Lines 46-53 implement rectangle collision detection with a 40px safety gap.
- Lines 55-75 build distance-sorted nearby positions.
- Lines 77-101 snap the requested location to the grid and return the nearest non-overlapping position.
- `ui.js` lines 81-116 uses this calculation for desktop drag-and-drop.
- `store.js` lines 57-74 uses the same calculation for click/tap creation.

Why: one shared placement rule keeps desktop and mobile behavior consistent.

### Step 3 - Auto-layout

Problem: a valid pipeline could still become visually tangled and hard to read.

Implementation:

- `@dagrejs/dagre` was added in `frontend/package.json` line 6.
- `builderUtils.js` lines 103-142 creates a Dagre graph, supplies node dimensions and edges, lays it out left-to-right, then grid-snaps the returned positions.
- `store.js` lines 115-121 exposes `autoLayout` and records the layout as one undoable history operation.
- `commandToolbar.js` line 48 connects Auto Layout to the button.

Why: Dagre is a proven graph-layout engine and is safer than inventing graph ranking and spacing logic manually.

### Step 4 - Undo and redo history

Problem: users could not safely recover from accidental edits.

Implementation:

- `store.js` line 10 limits history to 50 operations so memory cannot grow forever.
- Lines 12-15 clone nodes, node data, and edges into a snapshot.
- Lines 17-22 wrap structural changes by pushing the old state into `past`, clearing `future`, and clearing drag state.
- Lines 38-44 add `past`, `future`, and `dragSnapshot` to the store.
- Lines 53-55 record node creation.
- Lines 76-102 record node/edge removal.
- Lines 104-113 record new connections.
- Lines 123-139 record one history item for a completed drag instead of one item for every mouse-move event.
- Lines 141-155 implement Undo: restore the latest `past` state and place the current state in `future`.
- Lines 157-171 implement Redo: restore the first `future` state and place the current state back in `past`.

Button path:

1. `commandToolbar.js` lines 31-34 reads history availability and actions from Zustand.
2. Lines 42-43 render Undo and Redo and disable them when no state is available.
3. Clicking calls `store.js` line 141 or 157.
4. Zustand replaces nodes and edges.
5. `ui.js` lines 182-187 receives the new arrays and React Flow rerenders.

Keyboard path:

- `ui.js` lines 128-157 handles `Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z`.
- Lines 130-138 deliberately ignore shortcuts while typing inside an input, textarea, select, or editable element.

### Step 4 continued - Delete

- `store.js` lines 173-195 gathers selected node and edge IDs.
- Lines 186-193 remove selected nodes, explicitly selected edges, and every edge connected to a deleted node.
- The operation uses `withHistory`, so Undo can restore the complete graph.
- `commandToolbar.js` line 46 connects the Delete icon.
- `ui.js` lines 149-151 connects Delete and Backspace keyboard keys.
- `ui.js` line 202 disables React Flow's independent delete handler so deletion has only one predictable, undoable path.

### Step 4 continued - Duplicate

- `store.js` lines 197-203 finds selected nodes and exits safely if nothing is selected.
- Lines 205-227 generate new IDs, copy data, and use collision-aware placement near the original.
- Lines 228-243 duplicate edges only when both connected nodes are part of the selected subgraph.
- Lines 239-240 rewrite handle IDs so copied edges connect to copied handles rather than originals.
- Lines 245-255 deselect originals, select copies, append copied edges, and save history.
- `commandToolbar.js` line 45 connects the Duplicate icon.
- `ui.js` lines 146-148 connects `Ctrl/Cmd+D`.

### Step 5 - Mobile node-palette drawer

Problem: a permanently expanded palette consumed most of a phone screen, and HTML drag-and-drop is unreliable on touch devices.

Implementation:

- `App.js` line 203 owns `paletteOpen` state.
- Lines 205-218 close the drawer with Escape.
- Lines 233-240 render the backdrop and palette with close callbacks.
- Line 242 passes an open callback into the canvas command toolbar.
- `toolbar.js` lines 7-17 defines the nine available node types.
- Lines 20-25 call `addNodeOfType` and close the drawer after selection.
- Lines 28-44 render the responsive palette.
- `draggableNode.js` lines 12-22 changed palette items into buttons that support both desktop drag and click/tap creation.
- `store.js` lines 57-74 creates a correctly identified, non-overlapping, undoable node for a tap.
- `index.css` lines 1115-1178 turn the mobile palette into a fixed bottom drawer with a backdrop and slide transition.

Why: desktop users retain precise drag placement, while phone users receive a normal tap-based workflow.

### Step 6 - Compact command toolbar

Problem: temporary text controls occupied too much space and mixed node creation with editing commands.

Implementation:

- `lucide-react` was added at `frontend/package.json` line 10.
- `commandToolbar.js` lines 1-9 import standard icons.
- Lines 12-23 define one accessible icon-button component with disabled state, `aria-label`, and tooltip.
- Lines 25-37 derive command availability and actions from the store.
- Lines 39-52 render Undo, Redo, Duplicate, Delete, Auto Layout, Fit View, and the mobile Nodes button.
- `ui.js` line 176 places the command toolbar directly above the canvas.
- `ui.js` lines 124-126 connect Fit View to the live React Flow instance.
- `index.css` lines 681-737 provide stable 36px controls, separators, focus states, and disabled states.
- `index.css` lines 1097-1102 show the Nodes button only on mobile.

Why: icon controls preserve canvas space and separate commands from the node catalog.

### Auto-growing canvas

- `ui.js` lines 159-172 finds the lowest node bottom using each node's measured or estimated height.
- It keeps a minimum 560px canvas and adds bottom padding after the lowest node.
- The computed height is applied at lines 177-180.
- `index.css` lines 617-620 provides the minimum and a smooth height transition.

Why: dragging nodes downward should expand the workspace rather than clip nodes behind the submit area.

---

## 7. Tests and Verification

### Unit tests

`frontend/src/builderUtils.test.js` verifies:

- viewport scale and zoom limits at lines 11-22,
- left-to-right non-overlapping Dagre layout at lines 25-41,
- grid snapping and collision-safe placement at lines 44-57.

`frontend/src/store.test.js` verifies:

- Undo and Redo at lines 10-23,
- tap-created IDs and placement at lines 26-33,
- duplication at lines 36-48,
- delete and Undo restoration at lines 51-70.

Current automated result: 2 suites, 9 tests, all passing. The production build compiles successfully.

### Rendered testing

Desktop and 390px mobile checks covered landing-to-builder navigation, palette creation, Undo, Redo, Duplicate, Delete, Auto Layout, Fit View, drawer open/close, tap placement, submission alert, overlap, overflow, and console errors.

The earlier mobile handle-label clipping finding is resolved. `frontend/src/features/pipeline-builder/nodes/BaseNode.module.css` lines 97-100 move left and right labels inside the node at widths below 720px. Rendered QA after Duplicate and Fit View confirmed both nodes and visible labels remain inside a 390px viewport.

---

## 8. Where the Additional Buttons Are

The current source renders the additional controls in `frontend/src/commandToolbar.js` lines 39-52, and `frontend/src/ui.js` line 176 places them between the Node Palette and canvas.

Their order is:

1. Undo.
2. Redo.
3. Duplicate selected.
4. Delete selected.
5. Auto Layout.
6. Fit workflow to view.
7. Open node palette, mobile only.

If an already-open browser tab does not show this bar, the tab is running an older cached JavaScript bundle. A hard refresh loads the current production bundle. Disabled buttons appear lighter until their required state exists; for example, Duplicate and Delete remain disabled until a node or edge is selected.

---

## 9. End-to-End Mental Model

1. The palette creates a node configuration.
2. The store assigns an ID and collision-safe position.
3. React Flow renders the correct configured component through `nodeTypes` derived in `features/pipeline-builder/nodes/nodeRegistry.js` lines 25-27.
4. BaseNode renders fields and handles and saves edits into Zustand.
5. Connections are stored as animated directed edges.
6. Editing commands transform store state and create history snapshots.
7. Submit serializes the current node and edge arrays.
8. FastAPI counts the graph and runs cycle detection.
9. The browser displays the required summary alert.

That separation is the main architectural decision: node rendering, graph state, canvas interaction, and backend validation each have one clear owner.

---

## 10. Current Scalable Architecture Migration

This section records the latest change from a flat `src/` directory and one global stylesheet to feature-based React architecture. It supersedes historical paths such as `App.js`, `ui.js`, `store.js`, `toolbar.js`, `submit.js`, and `index.css` mentioned earlier in this document.

### Why the architecture changed

The flat structure was acceptable for a small assessment, but it made ownership less obvious as the landing page and Builder grew. The goal was to improve scalability and maintenance without changing the application's state model or rendered behavior.

`.jsx` was selected for files that render JSX because it communicates file intent to developers and editor tooling. It does not make React faster or slower; Create React App compiles `.js` and `.jsx` through the same Babel pipeline.

CSS Modules were selected because they scope class names at build time. They avoid accidental selector collisions without introducing a runtime styling library, context provider, or per-render style generation.

### Route and lazy-loading layer

`frontend/src/app/App.jsx`:

- Line 1 imports `lazy` and `Suspense`.
- Line 4 declares a dynamic import for `BuilderPage`.
- Lines 7-10 track the current browser path and react to `popstate`.
- Lines 12-19 render the Builder only on `/builder`; every other path renders the landing page.
- Because the Builder import is dynamic, React Flow, Dagre, Zustand Builder code, and Builder CSS remain in asynchronous chunks until the user opens the Builder.

`frontend/src/app/RouteLink.jsx` lines 1-24 centralizes history navigation. It updates `window.history`, dispatches `popstate`, and preserves normal browser behavior for modified clicks.

### Landing-page ownership

`frontend/src/pages/landing/LandingPage.jsx` lines 43-161 owns landing markup and content. `LandingPage.module.css` owns only that page's layout, hero animation, section styling, and responsive rules. No Builder selector is coupled to the landing page.

### Builder feature boundary

`frontend/src/features/pipeline-builder/BuilderPage.jsx`:

- Lines 10-23 own mobile palette state and Escape dismissal.
- Lines 29-39 render the Builder header.
- Lines 40-50 compose the backdrop, palette, command/canvas workspace, and submit action.

The rest of the feature is grouped by responsibility:

- `api/pipelineApi.js` lines 1-16 owns the backend base URL, JSON request, and HTTP error handling.
- `components/PipelineCanvas.jsx` lines 43-210 owns React Flow integration, drop projection, shortcuts, dynamic canvas height, and viewport settings.
- `components/NodePalette.jsx` lines 11-45 owns the node catalog drawer and tap creation.
- `components/NodePaletteItem.jsx` lines 3-25 owns desktop drag and click/tap interaction for one catalog item.
- `components/CommandToolbar.jsx` lines 13-54 owns accessible command controls and enabled/disabled state.
- `components/SubmitButton.jsx` lines 14-47 owns submission loading state and the required result alert.
- `store/pipelineStore.js` lines 38-281 owns nodes, edges, history, graph commands, and immutable field updates.
- `lib/builderUtils.js` lines 3-142 owns pure placement, dimensions, viewport constants, collision detection, and Dagre layout.

### Central node registry

`frontend/src/features/pipeline-builder/nodes/nodeRegistry.js` is the single catalog of node types:

- Lines 13-23 map type names to React components, labels, and palette variants.
- Lines 25-27 derive the `nodeTypes` object consumed by React Flow.
- Lines 29-34 derive the palette data consumed by `NodePalette`.

This removes a former duplication risk where adding a node required separately editing the canvas registration and palette list.

### Shared node abstraction

`frontend/src/features/pipeline-builder/nodes/BaseNode.jsx` remains the common component for all nine node types:

- Lines 15-29 resolve defaults and autosize textareas.
- Lines 32-42 calculate automatic handle distribution.
- Lines 46-58 define the reusable node configuration contract.
- Lines 61-88 synchronize local field controls with Zustand node data.
- Lines 92-140 render input, select, and textarea fields from configuration.
- Lines 143-193 group and render React Flow handles with stable IDs and labels.
- Lines 196-202 render the common header, field area, and optional content.

`BaseNode.module.css` lines 1-95 defines the shared visual contract. Lines 97-100 provide the narrow-screen label containment rule. A node-specific component therefore describes data and handles, while `BaseNode` and its module guarantee consistent layout.

### Styling ownership

The former 1,069-line `index.css` was removed and replaced with:

- `shared/styles/tokens.css`: colors, surfaces, radii, and shadows.
- `shared/styles/globals.css`: reset, body defaults, control font inheritance, route loading state, and reduced-motion behavior.
- `pages/landing/LandingPage.module.css`: landing-only presentation.
- `features/pipeline-builder/BuilderPage.module.css`: Builder page shell and mobile backdrop.
- `components/*.module.css`: palette, command toolbar, canvas, and submission styles.
- `nodes/BaseNode.module.css`: the shared node UI.

CSS Modules generate scoped class names during the build. Components receive normal strings through imports such as `styles.toolbar`; React does not perform extra style computation on each render.

### Performance impact

The structural move does not increase component render work. Component boundaries, Zustand selectors, and React Flow node rendering are preserved. The meaningful performance improvement is route-level code splitting: the optimized landing bundle is about 50.47 kB gzip, while the Builder and React Flow stay in lazy chunks until `/builder` is opened.

### Regression verification

- Jest: 2 suites, 9 tests, all passed.
- Production build: compiled successfully.
- Desktop 1440x900: landing route, lazy Builder navigation, 9 palette entries, 6 visible command controls, add, duplicate, undo, redo, delete, auto-layout, fit-view, and overflow checks passed.
- Mobile 390x780: palette hidden initially, drawer open, 9 entries, tap creation, automatic close, duplicate, fit-view, node bounds, label bounds, and overflow checks passed.
- Browser console: no application errors.
