# TaskBoards Frontend (React)

Ocean Professional themed frontend for a collaborative task management app with Kanban, Calendar, filters, CSV export, and realtime presence.

## Quick Start

1) Copy the sample env and set your backend URLs
   cp .env.example .env
   # Edit .env for REACT_APP_API_BASE_URL and REACT_APP_WS_URL

2) Run in Demo mode (no DB required)
   # Enables mock data, realtime banner, and disables server mutations
   REACT_APP_DEMO_MODE=true npm start
   # App runs at http://localhost:3000

3) Connect to a backend (optional)
   - Set REACT_APP_API_BASE_URL to your backend URL (e.g., http://localhost:3001)
   - Set REACT_APP_WS_URL to your backend websocket URL (e.g., ws://localhost:3001/ws)
   - If the backend /status reports dbConfigured=false, a setup banner appears linking to SETUP_DB.md

## Features

- React Router v6 routes: Home, Login, Boards (protected), Calendar (protected)
- AuthContext with token storage (replace with real auth calls)
- API client using REACT_APP_API_BASE_URL
- WebSocket client using REACT_APP_WS_URL (presence)
- Kanban board with drag-and-drop (react-beautiful-dnd)
- Calendar month view (date-fns)
- Filters drawer for search/assignee/priority/tag
- CSV export of filtered tasks
- Presence indicator in header
- Ocean Professional theme (refined spacing and colors)

## Diagnostics

- Footer includes a "Run Diagnostics" button which opens an accessible panel and runs:
  1) GET `${API_BASE}/` expecting 200 OK
  2) GET `${API_BASE}/status` expecting 200 JSON with fields: app_version, db_configured, secret_key_configured, cors_origins, websocket_origins, uptime_seconds
  3) GET `${API_BASE}/api/projects` expecting 503 JSON when DB is not configured (otherwise 200/401 depending on auth)
- Results are displayed with pass/fail badges, status codes, durations, and response snippets.
- A toast summarizes the outcome, e.g., "Diagnostics passed (2/3 OK, 1 guarded)".
- API base resolution:
  - Uses REACT_APP_API_BASE_URL if set
  - Else falls back to window.location.origin with port swap (:3000 -> :3001)

You can still open the Developer diagnostics (footer → Developer) to view `/status`, WS URL/state, and envs in use.

## Demo Mode and Graceful Fallbacks

- Set REACT_APP_DEMO_MODE=true to explore the UI without a database.
- When the backend returns HTTP 503 for DB-dependent routes, the UI automatically switches to a lightweight in-memory demo mode:
  - A top banner "Demo mode (no DB configured)" appears.
  - Mutating actions to the server are disabled; local optimistic interactions still work in-memory.
  - CSV export is disabled when backend is not ready unless in demo mode (then it exports the local/mock data).
  - WebSocket connection status is surfaced in the header.

## Notes

- Replace demo data and mocked login with backend API calls as endpoints become available.
- Keep environment variables in .env (do not commit secrets).
- For production builds: npm run build

## Contributing

See CONTRIBUTING.md for development workflow, coding style, and commit conventions.

## Database Setup

If you want to use a real database with the backend, follow SETUP_DB.md in the backend container root.
