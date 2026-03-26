# EcoFlow

## Requirements

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for the database)

## Installation

Install dependencies for both frontend and backend:

```bash
npm run install:all
```

## Running the Application

### 1. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container on port `5432`. The database and schema are created automatically on first run.

### 2. Start the app

```bash
npm run dev
```

This concurrently starts:
- Frontend dev server (Vite) — `http://localhost:5173`
- Backend dev server (Express) — `http://localhost:3000`

Both services restart automatically on code changes.

### Stopping the database

```bash
docker compose down
```

To also remove the stored data:

```bash
docker compose down -v
```
## Frontend Leaflet Setup for Transit Maps *MANDATORY
```
cd frontend
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

## Manual Setup

If you prefer to run frontend and backend separately:

### Frontend
```bash
cd frontend
npm install
npm run dev
```


### Backend
```bash
cd backend
npm install
npm run dev
```

## Project Structure

EcoFlow follows an **MVC (Model-View-Controller)** architecture across both the frontend and backend.

```
EcoFlow/
├── backend/
│   ├── index.js              # Entry point – starts the Express server
│   ├── package.json
│   ├── controllers/          # Handle incoming request logic & send responses
│   ├── models/               # Data models & database schemas (e.g. Mongoose)
│   ├── routes/               # Route definitions – map URLs to controllers
│   └── services/             # Business logic, decoupled from controllers
│
└── frontend/
    └── src/
        ├── assets/           # Static files (images, fonts, icons)
        ├── components/       # VIEW – Reusable UI components
        │   ├── common/       # Generic shared components (buttons, inputs, etc.)
        │   └── layout/       # Structural components (navbar, sidebar, footer)
        ├── pages/            # VIEW – Page-level components, one per route
        ├── controllers/      # CONTROLLER – Handles user interaction & app logic
        │   └── hooks/        # Custom React hooks (encapsulate stateful logic)
        ├── models/           # MODEL – TypeScript interfaces, types & data shapes
        │   └── types/        # Shared type definitions used across the app
        ├── services/         # API calls & external service communication
        ├── store/            # Global state management (Redux / Zustand / etc.)
        ├── utils/            # Pure helper / utility functions
        ├── App.tsx           # Root component – sets up routing & providers
        └── main.tsx          # Entry point – mounts the React app to the DOM
```
