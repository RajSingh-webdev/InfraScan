# InfraScan

InfraScan is a responsive infrastructure risk dashboard built for monitoring bridges, tunnels, dams, and buildings. It brings together asset health, alert triage, analytics, inventory management, and work order tracking in one operational workspace.

## Highlights

- Live dashboard with risk summary cards, asset selection, map focus mode, trend charts, and failure impact analysis
- Alert center that links operators back to the affected asset for faster investigation
- Fleet analytics for risk distribution, trends, and operational planning
- Inventory management with filtering, sorting, asset detail views, and local demo persistence
- Work order tracking with priority, status, due date, and cost management

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui and Radix UI
- React Router
- TanStack React Query
- Recharts
- Vitest and Playwright configuration

## App Sections

- `/` Dashboard: map-driven overview with risk summaries, analytics, and failure impact insights
- `/alerts` Alerts: active alert triage and quick navigation back to related assets
- `/analytics` Analytics: fleet-wide charts and KPI summaries
- `/operations` Operations: prioritized operational decision support
- `/inventory` Inventory: asset browsing, filtering, creation, and updates
- `/inventory/:id` Asset Detail: focused view for a single infrastructure asset
- `/workorders` Work Orders: create, manage, and track maintenance tasks

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install and Run

```sh
npm install
npm run dev
```

The Vite dev server will print the local URL in the terminal after startup.

## Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run preview` serves the production build locally
- `npm run lint` runs ESLint
- `npm test` runs Vitest

Note: the test runner is configured, but the repository currently does not include active Vitest test files.

## Data and Persistence

- Demo data lives in `src/data/mockData.ts`
- Asset and work order edits are stored in browser `localStorage`
- The app includes a reset action in the navigation to restore the original demo dataset

## Project Structure

```text
.
|-- public/
|-- src/
|   |-- components/
|   |-- data/
|   |-- hooks/
|   |-- lib/
|   |-- pages/
|   `-- main.tsx
|-- index.html
|-- package.json
|-- vite.config.ts
`-- vitest.config.ts
```

## Development Notes

- This project is currently driven by mock infrastructure data
- The UI is optimized for operational dashboards across desktop and smaller screens
- Some older starter-template metadata may still remain in non-README files and can be cleaned up separately
