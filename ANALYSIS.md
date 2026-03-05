# Team Roster Planner - Program Analysis

## Overview

Single-page React application for team shift scheduling, built with React 18 + Vite 6 + Tailwind CSS 3. The entire application lives in a single 1,772-line component (`src/App.jsx`) with no external state management, routing, or backend. All data is persisted via `localStorage`.

## Architecture

- **Single-file monolith**: All state, business logic, UI, and translations in `App.jsx`
- **No component decomposition**: One `App` component handles 5 tabs + 3 edit modals
- **Client-side only**: `localStorage` persistence + JSON file backup/restore
- **Bilingual**: Inline English/German translation dictionary

## Core Features

### 1. Team Management
- Add/edit/remove/reorder team members (name, role, birthday, max-days-off)
- Color-coded initials avatars

### 2. Shift Management
- Define shift types with name, time range, color, priority (1-99), and per-day-of-week staffing targets
- Net shift hours calculated with Swiss ArG break rules (15min >5.5h, 45min >7h, 60min >9h)

### 3. Roles & Rules Engine
- Assignment preferences: Flexible, Mainly (prioritize a shift), Only (exclusive)
- Hard exclusions (never assign to certain shifts)
- Fixed days off per day-of-week

### 4. Leave Management
- Book holidays, sick days, and wish days over date ranges
- Holiday conflict detection (prevents double-booking)

### 5. Auto-Scheduler (lines 468-747)
Greedy constraint-based scheduler:
- 5-day max consecutive work rule with mandatory rest
- Optional "Min 2 Days Off" toggle
- 11-hour rest period between shifts (Swiss ArG compliance)
- Cross-month streak initialization (looks back 5 days)
- Scoring system: role preferences, shift continuity, near-time-off penalty, streak avoidance
- Force-assignment for members near max-days-off limit

### 6. Roster Grid
- Interactive calendar with click-to-assign modal
- Color-coded cells for shifts, holidays, sick days, birthdays, wish days
- Coverage alerts row for understaffed shifts
- Monthly summary footer (shifts, hours, days off per member)

### 7. PDF Export
- Dynamically loads html2pdf.js from CDN
- Landscape A4 export with cloned DOM

### 8. Data Backup
- Download/upload full state as JSON

## Technical Assessment

### Strengths
- `useMemo`/`useCallback` for performance optimization
- Debounced localStorage persistence (1s timeout)
- Responsive design with mobile breakpoints
- Print CSS support alongside PDF export

### Areas for Improvement
- Monolithic structure (1,772 lines in one component) - should split into sub-components and custom hooks
- `Date.now().toString()` for IDs - not collision-safe
- No input validation on shift time format ("HH:MM - HH:MM")
- Shallow state cloning in some handlers could cause issues with nested objects
- No tests
- No TypeScript (despite `@types/react` in devDependencies)
- Hardcoded 25 holiday days (not configurable)
- Runtime CDN dependency for PDF export
