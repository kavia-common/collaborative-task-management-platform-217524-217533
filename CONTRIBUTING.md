# Contributing to TaskBoards

Thank you for considering contributing!

## Quick Dev Setup

- Frontend (no DB required):
  - cd collaborative-task-management-platform-217524-217533/taskboards_frontend
  - cp .env.example .env
  - set REACT_APP_DEMO_MODE=true to use mock data without a backend
  - npm install
  - npm start

- Backend:
  - See SETUP_DB.md for database configuration steps
  - Start the FastAPI app and ensure /status returns dbConfigured=true before using full functionality

## Coding Guidelines

- Follow "Ocean Professional" visual style and keep components small and accessible (aria-labels, roles, focus order)
- Prefer functional components and hooks
- Add JSDoc-like comments and keep public functions preceded with "PUBLIC_INTERFACE" comments as markers
- Include error handling and avoid hard-coded secrets or environment values; use .env variables instead

## Commit Conventions

- Conventional Commits (recommended):
  - feat: new user-visible feature
  - fix: bug fix
  - docs: documentation only changes
  - style: formatting, missing semi-colons, etc.
  - refactor: code change that neither fixes a bug nor adds a feature
  - perf: performance improvement
  - test: adding missing tests or correcting existing tests
  - chore: build process or auxiliary tools

## Pull Requests

- Keep PRs small, scoped, and with a clear description
- Mention related issues
- Ensure lint passes

Happy hacking!
