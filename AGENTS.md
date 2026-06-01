# AGENTS.md

Guidance for AI agents working in this repository.

## Project status

**CFAUTO** (`CFautobooks/CFAUTO`) is currently a **greenfield** repository. The only tracked source file is `README.md` (title: CFAUTO). There is no application code, dependency manifest, Docker setup, CI workflow, or documented dev commands yet.

Until application code and tooling land in this repo, cloud agents cannot run lint, tests, builds, or dev servers defined by the project itself.

## Cursor Cloud specific instructions

### What is (and is not) in this repo

| Expected in a full app repo | Present in CFAUTO today |
|----------------------------|-------------------------|
| `package.json`, `pyproject.toml`, `go.mod`, etc. | No |
| `docker-compose.yml` / services | No |
| Lint / test / dev scripts | No |
| Runnable application | No |

The VM **update script** is intentionally a no-op (`true`) because there are no project dependencies to refresh on startup.

### Services

No services are defined. Nothing must be started for end-to-end testing until a stack is added (for example a web API, frontend, or database).

### When code is added

Update this section with durable, non-obvious notes for future agents, for example:

- Which services are **required** vs **optional** for local dev
- Non-default ports, env files, or auth flows
- Gotchas (hot reload not picking up dependency installs, Docker networking, etc.)

Point agents at the canonical commands in `README.md`, `package.json` scripts, `Makefile`, or `docker compose` rather than duplicating full command lists here unless something is easy to get wrong.

### Git

Standard git workflow applies. Remote: `https://github.com/CFautobooks/CFAUTO`, default branch: `main`.
