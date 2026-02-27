# Decentralized Land Registry System (Prototype)

Full-stack prototype: **React (Frontend)** + **Node.js/Express (Backend)** with a simulated blockchain-style immutability (JSON store + SHA-256 land title fingerprint). Nigerian terminology: C of O Status, Surveyor-General's Office, NIMC Identity Link.

## What’s in this folder

- **`backend/`** — Express API, JSON file store, parcel CRUD, approve (→ Verified + SHA-256), immutability (no edit/delete when Verified), public verify by Land ID or hash.
- **`frontend/`** — React + Vite + Tailwind: single entry (choose Surveyor / Admin / Public Verify), Surveyor portal (register parcel, My Submissions), Ministry Admin (pending list, review, approve), Public Verification page.

## How to run the website

### 1. Install dependencies

From the **project root** (this folder):

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

Or, if you use the root script:

```bash
npm run install:all
```

(You only need to run this once, or when you add/change dependencies.)

### 2. Start the backend

In a terminal:

```bash
cd backend
npm run dev
```

Leave this running. The API will be at **http://localhost:4000**.

### 3. Start the frontend

In **another** terminal:

```bash
cd frontend
npm run dev
```

The website will open at **http://localhost:5173** (or the URL shown in the terminal).

### 4. Use the site

- Open **http://localhost:5173** in your browser.
- **Login as Surveyor** — register land (Owner, NIN, Phone, Land Description, Lat/Long), submit (simulated signature → Pending), see “My Submissions” (Pending / Verified).
- **Login as Ministry Admin** — see pending registrations, open **Review** for a parcel, click **Approve** to set status to Verified and generate SHA-256 digital land title fingerprint; edit/delete are disabled for Verified records (immutability).
- **Public Verification** — enter a Land ID or SHA-256 hash to see C of O Status (Verified/Pending) and owner name.

## Run both with one command (optional)

From the project root, after `npm install` and installing in `backend` and `frontend`:

```bash
npm run dev
```

This runs backend and frontend together (requires `concurrently`; install with `npm install` at root).

## Tech summary

| Part        | Stack |
|------------|--------|
| Backend    | Node.js, Express, JSON file store, SHA-256 for signature & land title fingerprint |
| Frontend   | React 18, Vite, Tailwind CSS, React Router |
| “Blockchain” | Simulated: Verified records are immutable (no edit/delete); SHA-256 hash as digital fingerprint |

All files for the website and API are in this folder; follow the steps above to run the code.

---

## Deploying to Vercel

**Frontend only on Vercel (recommended)**  
The React app can be hosted on Vercel. The backend must run somewhere else (e.g. [Render](https://render.com), [Railway](https://railway.app), or a VPS) because Vercel does not run long-lived servers.

1. Deploy the **backend** to a service that runs Node (e.g. Render: create a “Web Service”, root directory `backend`, build `npm install`, start `npm start`). Note the API URL (e.g. `https://your-app.onrender.com`).
2. Deploy the **frontend** to Vercel:
   - In the Vercel project, set **Root Directory** to `frontend`.
   - Add an **Environment Variable**: `VITE_API_URL` = your backend URL (e.g. `https://your-app.onrender.com`). No trailing slash.
   - Build command: `npm run build`. Output directory: `dist`.
3. The site on Vercel will call your backend using `VITE_API_URL`; locally you keep using the dev proxy (`/api`).

**Full stack on Vercel**  
To run everything on Vercel you would need to turn the API into [Vercel Serverless Functions](https://vercel.com/docs/functions) and use a persistent store (e.g. Vercel KV or Postgres) instead of the JSON file; that would require code changes beyond this prototype.
# Decentralized-Land-Registry
