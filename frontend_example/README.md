# GREENN Frontend Demo

This directory contains the frontend demo of GREENN, a tool for analysing the energy efficiency of neural network training.

## Technology Stack

- **React 19** for the user interface.
- **Vite 6** for development and production builds.
- **React Router** for navigation between application views.
- **Mantine** and **Mantine DataTable** for UI components and data tables.
- **Recharts** and **Mantine Charts** for training and energy visualisations.
- **Framer Motion** for interface animations.
- **Axios** for HTTP communication with the backend.
- **jsPDF**, **jsPDF AutoTable** and **html-to-image** for report export.
- **ESLint** for code-quality checks.

## Project Structure

```text
frontend_example/
├── public/                  # Static assets, including the GREENN logo
├── src/
│   ├── assets/              # Frontend assets
│   ├── components/          # Reusable UI and configuration components
│   ├── contexts/            # Shared application state
│   ├── hooks/               # Reusable React hooks and data helpers
│   ├── icons/               # Application icon definitions
│   ├── mock_data/           # Example datasets, projects and reports
│   ├── pages/               # Application pages and layouts
│   ├── services/            # API, storage and file-service clients
│   └── styles/              # Global and component styles
├── index.html               # Vite HTML entry point
├── package.json             # Scripts and dependencies
└── vite.config.js           # Vite configuration
```

## Installation and Development

Use Node.js 22 or a compatible current LTS release. From this directory, install the dependencies and start the development server:

```bash
npm install
npm run dev
```

Vite will print the local URL in the terminal, usually `http://localhost:5173`.

## Available Scripts

```bash
npm run dev       # Start the development server
npm run build     # Build the frontend for production
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Backend Configuration

The demo defaults to the following backend endpoints:

- API: `http://localhost:5172/api`
- WebSocket: `ws://localhost:8080/`

Override them when starting Vite by defining the corresponding environment variables:

```bash
VITE_API_BASE_URL=http://localhost:5172 \\
VITE_BACKEND_WEBSOCKET=ws://localhost:8080/ \\
npm run dev
```

The complete production backend is not included in this demo repository. Example data is available under `src/mock_data/` for exploring the interface.

## Production Build

Create a production bundle with:

```bash
npm run build
```

The generated files are placed in `dist/`. The included `Dockerfile` builds the application and serves this bundle with `serve` on port `3000`.
