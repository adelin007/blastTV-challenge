This repository is an npm workspaces monorepo with:

- `apps/web`: React + TypeScript + Vite + TanStack Query
- `apps/api`: Node.js + Express + TypeScript
- `packages/types`: shared TypeScript types

## Requirements

- Node.js 20+
- npm 10+

## Install

```bash
yarn install
```

## Run in development

```bash
yarn run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:4000`

## Build all packages

```bash
yarn run build
```

## Typecheck all packages

```bash
yarn run typecheck
```
