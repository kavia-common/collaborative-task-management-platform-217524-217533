# Troubleshooting

This guide lists common preview issues and quick fixes for TaskBoards.

## Frontend

- Blank page or API errors:
  - Ensure `.env` has REACT_APP_API_BASE_URL and REACT_APP_WS_URL.
  - Open the in-app Developer diagnostics (Footer → Developer) to view:
    - Backend `/status` details
    - WebSocket URL and state
    - Envs in use by the app
  - If `/status` is unavailable, set `REACT_APP_DEMO_MODE=true` to explore without a backend.

- WebSocket disconnected:
  - You will see a toast and a banner. The client auto-retries. Check the WS URL is correct and CORS/WS origins on the backend include the frontend origin.

- CORS errors:
  - Confirm your backend CORS configuration includes the frontend origin (exact scheme://host:port). Comma-separated origins are supported on the backend. Reload the frontend after adjustments.

- Calendar or Boards slow with many tasks:
  - Calendar is lazy-loaded and its subview is memoized. If you still see slowness, ensure filters reduce the set or paginate on the backend.

## Backend

- `/status` endpoint not reachable:
  - Verify backend is running and accessible. The endpoint should return JSON with fields like `db_configured`, `secret_key_configured`, `cors_origins`, etc.
  - If DB is not configured, the backend should still respond with status info; DB-dependent endpoints should return HTTP 503 with a JSON body including an `action` hint.

- 503 from DB-dependent endpoints:
  - This indicates DB is not configured. The backend returns a structured JSON body including an `action` hint and `correlation_id`.
  - Use the Setup Checklist from the frontend banner or consult `taskboards_backend/SETUP_DB.md`.

- CORS issues:
  - The backend parses comma-separated CORS origins. Use exact origins or `*` during local development. Review backend logs for the effective origins on startup.

## Quick Checks

- Network tab: Look for `/status` call.
- Console: Check toast messages and errors.
- Environment: Verify variables in `.env`.
- Realtime: Confirm WS URL resolves and is reachable.
