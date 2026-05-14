# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint (Next.js core-web-vitals config)
npm start        # Start production server
```

No test suite is configured.

## Architecture

**Next.js 14** app (TypeScript, Tailwind CSS, Recharts) — a healthcare insurance executive dashboard showing payor metrics across five tabs: Overview, Service Quality, Utilization & Cost, Disease Management, and Referral Patterns.

### Key files

- `src/app/page.tsx` — The entire dashboard UI lives here (~229 lines). It handles tab state, CSV loading via PapaParse, and renders all tab-specific sub-components (StatBox, ServiceCategoryCard, AdherenceChart, AvgDeliveryTimeChart, FacilityTable). These sub-components are defined inline within the file, not in separate files.
- `src/components/MetricCard.tsx` — Reusable dual-chart card with hover effects, a "View segments" dropdown, and support for primary/secondary chart data series.
- `src/components/Nav.tsx` — Header with Verse logo; currently unused by the root layout.
- `src/app/layout.tsx` — Root layout applying the DM Sans font and global metadata.

### Data flow

CSV files in `public/data/` are fetched client-side with PapaParse on component mount. The eight CSVs cover: total order volume, total spend (both with by-LOB variants), average delivery time, facility metrics, and device adherence for CGM and CPAP.

### Styling

Custom blue palette defined in `tailwind.config.js` (primary shades: `#093a5b` → `#68c3fb`). Path alias `@/*` resolves to `src/*`.

### Deployment

Configured for Vercel (`vercel.json`). Build output is `.next/`.
