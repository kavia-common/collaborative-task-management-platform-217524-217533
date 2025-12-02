# TaskBoards Frontend (React)

Ocean Professional themed frontend for a collaborative task management app with Kanban, Calendar, filters, CSV export, and realtime presence.

## Quick Start

1) Copy the sample env and set your backend URLs
   cp .env.example .env
   # Edit .env for REACT_APP_API_BASE_URL and REACT_APP_WS_URL

2) Install and run
   npm install
   npm start
   # App runs at http://localhost:3000

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
- Ocean Professional theme

## Notes

- Replace demo data and mocked login with backend API calls as endpoints become available.
- Keep environment variables in .env (do not commit secrets).
- For production builds: npm run build
