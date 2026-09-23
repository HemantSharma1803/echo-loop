# ECHO//LOOP

> **Every action leaves a trace.**

ECHO//LOOP is a cinematic 2D/2.5D sci-fi time-loop puzzle adventure built for the **EVOX 1.0 — Build a Game** challenge. The core mechanic is a deterministic temporal Echo system: actions from a completed loop are recorded and replayed by a past version of the player, allowing multiple timelines to cooperate on puzzles.

## Why it stands out

- **Temporal Echo gameplay:** your previous actions become active puzzle-solving entities.
- **Deterministic replay:** Echoes replay recorded movement/state rather than acting as random NPCs.
- **Layered puzzles:** pressure plates, switches, timed gates, Echo-only interactions, temporal memory, resonance, synchronization, phase objects and paradox systems.
- **Narrative integration:** the facility story, Unknown Echo mystery and temporal mechanics reinforce each other.
- **Replay & mastery:** level records, secrets, achievements, Echo history and best-run traces are stored locally.
- **Static-browser architecture:** React + TypeScript + Vite with no required backend or database.

## Tech stack

- React 19 + TypeScript
- Vite
- HTML5 Canvas rendering
- Tailwind CSS via Vite plugin
- Lucide React icons
- Web Audio API based sound system
- Browser `localStorage` for optional progression persistence

## Run locally

### Requirements

- Node.js 20+ recommended
- npm

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

### Production validation

```bash
npm run lint
npm run build
```

The production bundle is generated in `dist/`.

## GitHub Pages deployment

This repository includes `.github/workflows/deploy.yml`. It builds the project, type-checks it, uploads the Vite `dist/` artifact, and deploys it to GitHub Pages whenever `main` is updated.

### One-time GitHub setup

1. Create a GitHub repository and push this project to the `main` branch.
2. Open **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Push to `main` or run **Actions → Deploy ECHO//LOOP to GitHub Pages → Run workflow**.
5. After the workflow succeeds, GitHub shows the live Pages URL in the deployment/environment summary.

The Vite configuration uses a relative asset base so the game works correctly when hosted under a GitHub Pages project path.

## Controls

- **WASD / Arrow Keys:** move
- **E / Space / Enter:** interact
- **R:** manually reset the current loop
- **Esc / P:** pause
- **F1 / `:** toggle the development diagnostics overlay during development

Touch controls are available on supported devices and can be configured in Settings.

## Persistence

The game stores progression locally in the browser. Saved data includes level records, discovered secrets, narrative progression, achievements and best-run information. Clearing site storage resets local progression.

## Privacy & security

ECHO//LOOP does not require a server, database, account, or API key to play. Do not commit `.env.local` or other secret files. The repository ignores `.env*` files by default (while keeping `.env.example`).

## Project structure

```text
src/
├── components/   UI, HUD, menus, cinematic overlays
├── engine/       game loop, Echo replay, puzzles, temporal systems, levels
├── audio/        Web Audio sound system
└── types/        shared TypeScript models
.github/
└── workflows/    GitHub Pages deployment
```

## Competition concept

**Game:** ECHO//LOOP

**Tagline:** Every action leaves a trace.

**Genre:** Cinematic sci-fi time-loop puzzle adventure.

**Core innovation:** the player's own previous actions become deterministic Echoes that can cooperate with the current timeline.

## License

The project source retains the Apache-2.0 license header used by the original AI Studio project files.
