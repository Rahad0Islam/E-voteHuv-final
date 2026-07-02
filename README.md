# E-VoteHub

A digital voting platform with online campaigning — secure registration, vote events, ballots, posts, and real-time updates.

🔗 **Live app:** [https://evotehub.vercel.app/](https://evotehub.vercel.app/)

## Repository layout

```
E-voteHuv-final/
├── Back-end/   # Node.js + Express + MongoDB API (deployed on Vercel)
└── Front-end/  # React + Vite + Tailwind UI
```

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client, Chart.js, SweetAlert2
- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth, Multer (memory uploads), Cloudinary, Socket.IO, Nodemailer

## Features

- Email-OTP registration and login (JWT in httpOnly cookies)
- Admin-managed vote events with ballot images
- Nominee and voter registration flows
- Two voting modes: online (OTP) and on-campus (rotating code)
- Real-time event updates via Socket.IO
- Campaign posts with pictures and videos (Cloudinary)
- Profile and cover image uploads
- Public profile pages

## Quick start

You need Node.js 18+ and a MongoDB connection string.

### 1. Back-end

```bash
cd Back-end
npm install
npm run dev
```

Create a `.env` in `Back-end/` with:

```env
PORT=8002
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=https://evotehub.vercel.app

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESS_TOKEN_SECRET=your_refresh_token_secret

CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

The API runs on `http://localhost:8002` by default.

### 2. Front-end

```bash
cd Front-end
npm install
npm run dev
```

The app runs on `http://localhost:5173`. The dev server is already configured to call the local API and the deployed origin listed in `Back-end/src/app.js`.

## Deployment

Both apps ship with `vercel.json` files configured for Vercel:

- **Back-end:** Vercel serverless functions (`@vercel/node` build)
- **Front-end:** Static Vite build

Set the environment variables above in the Vercel project for the `Back-end` deployment. Uploads go straight from the browser to Cloudinary via the API — no local disk writes, which keeps it compatible with Vercel's read-only filesystem.

## API overview

Base URL: `/api`

- `v1/users` — auth, profile, public profiles
- `V1/admin` — vote events, ballots, nominee/voter management
- `v1/post` — campaign posts, comments, reactions

See `Back-end/src/Routes/` for the full surface area.

## Author

Md Rahad Islam

