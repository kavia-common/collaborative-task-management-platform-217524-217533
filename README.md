# collaborative-task-management-platform-217524-217533

## QuickStart

- Frontend (no DB required):
  - cd taskboards_frontend
  - cp .env.example .env
  - Set REACT_APP_DEMO_MODE=true to explore with mock data
  - npm install && npm start
  - Use the in-app Developer diagnostics (footer → Developer) to view backend `/status`, WS state, and envs in use.

- Backend:
  - See taskboards_backend/SETUP_DB.md for database configuration
  - Start backend and ensure `/status` shows `db_configured=true` and `secret_key_configured=true` for full functionality
  - Ensure CORS includes the frontend origin; the backend logs effective CORS origins on startup.

See CONTRIBUTING.md for more details. For help, check TROUBLESHOOTING.md.