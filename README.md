# projectcamp

A RESTful project management application with secure authentication, role-based access control, task management, and team collaboration.

## Stack

- **Backend:** Node.js, Express, Drizzle ORM, PostgreSQL
- **Frontend:** React, Vite, Tailwind CSS
- **Auth:** JWT in httpOnly cookies
- **Files:** Cloudinary + Multer

## Getting started

### 1. Backend

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=8000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_jwt_secret
BASE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173

C_NAME=your_cloudinary_cloud_name
C_API_KEY=your_cloudinary_api_key
C_API_SECRET=your_cloudinary_api_secret
```

Run the API:

```bash
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The Vite dev server proxies `/api` requests to the backend so cookie auth works seamlessly.

## API overview

| Area | Base path |
|------|-----------|
| Auth | `/api/v1/auth` |
| Projects | `/api/v1/projects` |
| Tasks | `/api/v1/tasks` |

## Email verification

Update your verification email link to point at the frontend for a better UX:

```
http://localhost:5173/verify-email/{token}
```

The frontend page will call the backend verify endpoint automatically.
