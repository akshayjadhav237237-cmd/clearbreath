# Engineering Assumptions

This document records the foundational engineering assumptions for the Clearbreath project.

## Repository and Version Control

- Workspace initialization: Repository initialized with default branch `main` and GitHub remote `akshayjadhav237237-cmd/clearbreath`.
- GitHub workflows run automated verification on branch `main` for pushes and pull requests.

## Dependency and Version Management

- Pinned package versions based on 14-day cutoff before 2026-11-18 (packages published on or before 2026-11-04).
- Exact package versions are pinned in `package.json` to ensure reproducible builds across development and CI.

## Target Platform and Runtime

- Target platform: Modern Evergreen browsers supporting ES2022 and standard Web APIs (DOM, Fetch, Storage, Web Crypto).
- Runtime environment for development and CI scripts is Node.js version 20 LTS.

## Deployment Target

- GitHub Pages deploy configured at path `/clearbreath/`.
- Assets and routing are configured to resolve relative to `/clearbreath/` base URL.

## External Services and AI Integration

- Gemini API key expected via environment or client configuration in later development steps.
- Deterministic fake adapters are used for local testing and CI verification without requiring live external API credentials.
