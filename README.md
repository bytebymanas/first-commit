# FirstCommit

FirstCommit is intended to help people get started contributing to open-source projects. This repository currently contains a project scaffold; its client and server source files are placeholders and the application is not runnable yet.

## Repository structure

- `client/src/` — planned frontend entry point, pages, components, styles, context, and API client. The files are currently empty.
- `server/src/` — planned backend entry point, routes, controllers, services, models, middleware, and utilities. The files are currently empty.
- `client/tsconfig.json` and `server/tsconfig.json` — TypeScript configuration placeholders; currently empty.
- `server/tests/` — reserved for backend tests; currently empty.
- `docs/` — reserved for project documentation.
- `.env.example` — placeholder names for environment settings. No current source code reads these values.
- `docker-compose.yml` — currently empty; no Compose services are defined.

## Prerequisites

Node.js and npm are needed once the client and server applications have package manifests and runnable entry points. The repository does not currently declare required versions or dependencies.

## Setup and run

There are currently no installation, development, build, lint, type-check, or test scripts. The root `package.json` declares `client` and `server` as npm workspaces, but neither workspace has a `package.json`; therefore npm workspace installation and workspace commands cannot run successfully yet. No application run command is available.

To make the project runnable, the next implementation step needs to add the chosen client and server toolchains, workspace manifests and scripts, non-empty entry points and TypeScript configs, then define any required environment variables and Compose services. Until then, installing dependencies or copying `.env.example` will not start an application.

## Environment settings

`.env.example` lists `GITHUB_TOKEN`, `HF_TOKEN`, `MODEL_ID`, `PORT`, and `CLIENT_ORIGIN` as placeholders. No implementation currently consumes them. Keep real credentials in a local `.env` file and never commit that file.
