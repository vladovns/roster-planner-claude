# Team Roster Planner

A React-based team scheduling application with Swiss labor law compliance, auto-scheduling, drag-and-drop shift assignment, and PDF export.

## Features

- **Monthly Roster View** — Visual calendar with shift assignments
- **Team Management** — Add/edit team members with roles and birthdays
- **Shift Management** — Define shifts with times, colors, and staffing targets
- **Roles & Rules** — Smart shift priorities, exclusions, and fixed days off
- **Leave Management** — Book holidays, sick days, and wish days
- **Auto-Scheduling** — Intelligent assignment respecting all rules
- **PDF Export** — Print-ready monthly roster export
- **Bilingual** — Full English and German support
- **Swiss Labor Law** — ArG max weekly hours and 11-hour rest period checks

## Local Development

```bash
npm install
npm run dev
```

## Deployment on Vercel

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** and import this repository
4. Vercel auto-detects Vite — no configuration needed
5. Click **Deploy**

## Tech Stack

- React 18
- Tailwind CSS 3
- Lucide React Icons
- Vite 6
- html2pdf.js (loaded on demand for PDF export)
