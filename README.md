# EcoFlow

## Installation

Install dependencies for both frontend and backend:

```bash
npm run install:all
```

This will install all required packages for the frontend and backend applications.

## Running the Application

To run both frontend and backend concurrently in development mode:

```bash
npm run dev
```

This command will start:
- Frontend development server
- Backend development server

Both services will run simultaneously and restart automatically when you make changes to the code.

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
