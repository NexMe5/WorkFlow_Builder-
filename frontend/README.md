# Pipeline Studio Frontend

React 18 and React Flow frontend for the VectorShift technical assessment.

## Setup

```powershell
npm.cmd ci
npm.cmd start
```

The frontend runs at `http://localhost:3000` and expects the backend at `http://localhost:8000`.

To use another backend, copy `.env.example` to `.env`, change `REACT_APP_API_URL`, and restart the development server.

## Routes

- `/` - animated Pipeline Studio landing page.
- `/builder` - full workflow Builder.

## Commands

```powershell
$env:CI='true'
npm.cmd test -- --watchAll=false --runInBand
npm.cmd run build
```

## Architecture

- `src/app/` - route selection and lazy loading.
- `src/pages/landing/` - landing page and local styles.
- `src/features/pipeline-builder/` - Builder components, nodes, store, graph utilities, and API client.
- `src/shared/styles/` - global reset and design tokens.

The Builder route is lazy-loaded. CSS Modules scope component styles at build time, while `nodeRegistry.js` is the single source for React Flow node types and palette entries.

See the repository-level `SUBMISSION_README.md` for full frontend and backend startup instructions.
