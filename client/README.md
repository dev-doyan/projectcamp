# ProjectCamp Frontend

React + Vite UI for the ProjectCamp API.

## Setup

```bash
cd client
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` to the backend (default `http://localhost:8000`).

## Environment

Create `client/.env` if your backend runs on a different port:

```env
VITE_BACKEND_URL=http://localhost:8000
VITE_API_URL=/api/v1
```

For production builds, set `VITE_API_URL` to your deployed API base URL.

## Features

- Register / login (cookie-based auth)
- Email verification page
- Project dashboard
- Task management with priorities, status, and due dates
- Team member invites and role management
- File attachments on tasks (Cloudinary)

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build
