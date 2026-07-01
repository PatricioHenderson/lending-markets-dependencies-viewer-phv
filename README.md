# Lending Markets Dependencies Viewer

Yarn workspace monorepo for rendering lending market dependency graphs.

## Packages

- `packages/app`: Next.js graph explorer.
- `packages/backend`: Express API that builds the dependency graph JSON used by the app.

## Run

```bash
yarn install
yarn start
```

The root `start` command launches:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:4000`

## Backend API

```text
GET /api/graph?protocol=spark&chainId=1&marketId=USDC&llm=openai
POST /api/graph
```

`protocol` supports `aave-v3`, `morpho`, `spark`, and `maple`.

Required environment variables depend on the selected market:

- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to expand token dependencies.
- `THE_GRAPH_API_KEY` for Aave V3 graph generation.

Optional:

- `PORT`, `HOST`, `CORS_ORIGIN`
- `OPENAI_MODEL`, `ANTHROPIC_MODEL`
- `NEXT_PUBLIC_API_URL` for the frontend API base URL.
