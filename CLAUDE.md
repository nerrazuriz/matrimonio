# Matrimonio PWA

PWA para matrimonio con 300+ invitados. Vite + React + TypeScript + Tailwind CSS + Supabase.

## Stack
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS 3
- **Backend**: Supabase (PostgreSQL + Realtime + Storage)
- **Hosting**: Vercel (free tier)
- **PWA**: vite-plugin-pwa (Workbox)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Maps**: Leaflet + OpenStreetMap (planned)

## Commands
- `npm run dev` — Dev server
- `npm run build` — Production build (runs tsc then vite build)
- `npm run preview` — Preview production build

## Architecture
- `src/pages/` — Page components (one per route)
- `src/components/` — Reusable UI components organized by feature
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utilities and service clients (Supabase, cn, etc.)
- `src/types/` — TypeScript type definitions

## Theme
Colors defined as CSS variables in `src/index.css` (RGB values for Tailwind opacity support).
Fonts: Playfair Display (headings) + Inter (body) via Google Fonts.

## Path alias
`@/*` maps to `./src/*` (configured in tsconfig.app.json and vite.config.ts).
