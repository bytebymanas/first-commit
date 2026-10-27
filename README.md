# FirstCommit

From curious beginner to confident contributor. FirstCommit helps contributors explore public GitHub repositories, read their open issues, get an AI explanation when a provider is configured, compare issue requirements with their skills, and follow a contribution checklist.

## Current functionality

- Responsive React landing page with navigation, learning steps, repository shortcuts, and official open-source program links.
- Express API with a health check and server-side GitHub repository and issue requests.
- Repository workspace for public GitHub repositories: overview metadata, README and common contribution guide locations, live open issues (excluding pull requests), label and keyword filters, beginner-label prioritization, and original issue links. Repository URLs must point to `https://github.com/owner/repo`; `owner/repo` shorthand is also accepted.
- Optional AI explanation and chat through an OpenAI-compatible chat-completions endpoint. The app reports missing provider configuration instead of returning generated-looking fallback text.
- English/Hinglish explanation selection, skill readiness guidance, technical terms, maintainer questions, and a locally saved contribution checklist.

The AI receives the current issue from GitHub, but does not inspect repository source. File suggestions and difficulty are estimates and should be verified against the project. The sample sandbox on the landing page is clearly marked as sample content and is not live issue data.

README and contribution files are loaded through the server's GitHub API service and displayed as text previews (up to 12,000 characters); use the provided GitHub links to read full documents. Repositories without these files remain browseable.

## Project structure

- `client/` — React, TypeScript, Vite app and CSS/Tailwind styling.
- `server/` — Express API, GitHub service, configurable AI provider, validation, and middleware.
- `docs/` — project documentation space.
- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` — pnpm workspace and dependency lockfile.
- `.env.example` — placeholder configuration; contains no credentials.

## Prerequisites

- Node.js 20 or newer
- pnpm 10 (or Corepack bundled with a recent Node.js release)

## Install and run

```sh
corepack enable
pnpm install
pnpm dev
```

The Vite app runs at `http://localhost:5173` and proxies `/api` requests to the Express server on `http://localhost:4000`.

If those ports are already in use, set both server and Vite ports; the Vite proxy follows `PORT`. In PowerShell:

```powershell
$env:PORT = '4001'
$env:VITE_PORT = '5174'
$env:CLIENT_ORIGIN = 'http://localhost:5174'
pnpm dev
```

For Windows PowerShell, copy the example environment file with:

```powershell
Copy-Item .env.example .env
```

The app can browse GitHub issues without an AI key or a GitHub token. To use AI explanations and chat with an OpenAI-compatible provider, set `AI_API_KEY` and `AI_MODEL` in the root `.env`. `AI_BASE_URL` defaults to Hugging Face's OpenAI-compatible inference router; set it to another compatible provider endpoint when needed. The model name is intentionally blank by default. For Hugging Face, use a token with Inference Providers access and a model available to that account. An optional Kaggle GPU tunnel can be configured with `KAGGLE_KERNEL_URL`; see `docs/kaggle_kernel.py` for the tunnel endpoint setup. No Kaggle URL is assumed or enabled by default.

| Variable | Required | Purpose |
| --- | --- | --- |
| `AI_API_KEY` | For AI | Provider credential. Keep it server-side. |
| `AI_BASE_URL` | No | OpenAI-compatible API base URL; defaults to `https://router.huggingface.co/v1`. |
| `AI_MODEL` | For AI | Provider model identifier. No model is selected by default. |
| `KAGGLE_KERNEL_URL` | No | Optional tunnel URL for the Kaggle inference endpoint; only configure while that service is running. |
| `GITHUB_TOKEN` | No | Optional token to raise GitHub API limits. |
| `PORT` | No | Express port; defaults to `4000`. |
| `CLIENT_ORIGIN` | No | Allowed browser origin; defaults to Vite at `http://localhost:5173`. |

Do not commit `.env` or put provider keys in frontend variables. An empty `AI_API_KEY`/`AI_MODEL` means AI endpoints return a setup message while issue browsing stays available.

## Available commands

```sh
pnpm dev          # Start client and server together
pnpm client       # Start only Vite
pnpm server       # Start only Express
pnpm build        # Build client and compile server
pnpm typecheck    # Type-check both workspaces
```

There is no configured linter or automated test suite yet. `docker-compose.yml` is empty, so Docker Compose is not a supported run path.
