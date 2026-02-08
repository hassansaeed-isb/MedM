# Psychologist Clinic Management System (Frontend)

Next.js frontend for managing psychologist clinics: appointments, doctor availability, session timing, payments, commissions, and multi-clinic operations.

## Features

- **Roles:** Admin / Clinic Owner, Receptionist, Doctor (Psychologist)
- **Receptionist:** Dashboard, bookings (create with patient details), slot view (free/next available), payments (Cash, Card, Other)
- **Doctor:** Dashboard, approve/reject bookings, start/end sessions with extra time & charges, earnings & commission reports
- **Admin:** Clinic performance, doctor utilization, revenue and reports (daily/weekly/monthly)
- **Slot statuses:** Free, Pending Approval, Booked, In Session, Completed
- **Mock data:** All data is in-memory (no backend yet). Ready to swap to API later.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo login

- Use any email and select a role (Admin, Receptionist, Doctor), then **Sign in**.
- Or use the quick links: **Skip login → Receptionist / Doctor / Admin** (you’ll be redirected to sign in if the app expects a user).

## Deploy (Vercel)

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com), import the repo and deploy (defaults work for Next.js).
3. Or with Vercel CLI: `npm i -g vercel` then `vercel`.

If `npm run build` fails on Windows (SWC binary), the app will still build on Vercel (Linux).

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – run production build locally
- `npm run lint` – run ESLint

## Tech

- Next.js 14 (App Router), TypeScript, Tailwind CSS, date-fns, lucide-react.
