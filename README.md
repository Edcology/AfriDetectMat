# AfriDetect Mat

Maternal care workspace for clinical teams — antenatal monitoring, hypertension screening,
appointments, referrals and audit, built from the Figma file
[`Mom`](https://www.figma.com/design/qxXAbwvYaxUa293k7YxKnf/Mom) (page: **Dashboard**, node `63:5016`).

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components, server actions) |
| UI | React 19, Tailwind CSS v4, Plus Jakarta Sans, lucide-react |
| Data | Typed repository over a local JSON store (`./.data/db.json`), seeded per facility |
| Design source | Figma REST API → `design/figma/file.json` (node tree, tokens, 2× PNG renders) |

Everything is server-rendered per request (`instant = false` on the root layout, `connection()`
in the store), so a mutation is visible on the next render — no stale build-time snapshots.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

The first request seeds `.data/db.json` from `src/lib/data.ts`. Delete that folder to reset the
workspace back to the seed.

## What's implemented

### Clinician workspace (`/`)

| Route | |
|---|---|
| `/` | Overview — stats, needs attention, systolic trend, maternal health, upcoming visits, activity |
| `/patients` | Filters, search, trimester/status sort, brand-header table |
| `/patients/[slug]` | 8 tabs: Overview, Health records, Labs, Appointment, Care-plan, Notes, Referral, Activity |
| `/appointments` | Month calendar + Upcoming/Passed/Missed, day drill-down |
| `/monitoring` | Reading log with source/quality + inline "try a reading" |
| `/alerts` | Acknowledge workflow, filtered views |
| `/screening` | Protocol A + diabetes criteria, live screening queue |
| `/referrals`, `/reports`, `/mother-access`, `/facility-admin`, `/notifications`, `/profile`, `/help` | |

### Mother app (`/mother`)

Signed in as **Amara Okafor** (MC-1032), whose record is the same one the clinicians see.

| Route | |
|---|---|
| `/mother` | Home — due-date hero with progress ring, setup banner, next visit, latest readings, messages |
| `/mother/check-in` | Daily check-in — mood, symptoms, note, review |
| `/mother/appointments` | Coming up, what happens at a visit, past visits |
| `/mother/messages` | Care team threads, day-divided chat, composer |
| `/mother/records` | Overview, Reading, Test results, Documents |
| `/mother/learn` + `/mother/learn/[slug]` | Pregnancy, warning-signs and postpartum lessons |
| `/mother/profile` | Profile + setup flow, pregnancy record, consent |

The two apps share one data store, which is the point of the demo:

- a mother check-in that reports **headache** or **swollen feet/ankles** creates a clinic alert
  immediately (severity `urgent` if both are picked) and lands in `/alerts` and the sidebar badge;
- registering a patient in the clinic makes her record available to the mother app;
- granting a record-access request in `/mother-access` is what the mother sees described on
  `/mother/profile`.

### Working mutations (server actions in `src/app/actions.ts`)

- Register a patient → validated booking + optional first reading, lands on the new record
- Schedule a visit → appears on the calendar and the patient's record
- Log a blood pressure reading → screened immediately; ≥160/110 opens an urgent alert
- Acknowledge an alert → attributed to the signed-in clinician, written to activity
- Add a clinical note, update a care plan, send a referral, grant/decline record access,
  mark notifications read
- Mother: submit a check-in (creates an alert when symptoms are concerning), send a message,
  save profile details

### Screening logic (`src/lib/screening.ts`)

Protocol A — hypertension in pregnancy:

- severe at 160/110 mmHg or higher (one reading is enough) → **urgent**
- raised at 140/90 mmHg → **review**, confirmed on two readings ≥4 h apart
- missing urine protein is surfaced as **more data needed**, never treated as normal

The same function drives the dashboard, patient record, monitoring, screening queue and reports,
so the numbers on every page agree.

## Design fidelity

- Calendar, tables, chart and badge geometry were taken from the Figma node tree rather than
  eyeballed: sidebar 266 px (`#181D19`, active `#293B33` + 8 px `#1F8A7A` rail), cards 12/16 px
  radius, 1 px `#C5D4CD` borders, deep-teal primary `#0B4F4A`, page canvas `#F7F9F7`.
- Type scale: 32/40 page titles, 16/20.2 card titles, 12/15.1 labels, 56/60 statistics, Plus
  Jakarta Sans throughout.
- Status language matches the file: Urgent review, Review recommended, Routine monitoring,
  More data needed.

## Where the data lives

`design/figma/file.json` is the raw pull (large, git-ignored). Regenerate it with:

```bash
FIGMA_TOKEN=figd_xxx node scripts/figma-pull.mjs     # tree + 2x PNG renders
node scripts/outline.mjs 63:5017 4                   # print a node subtree with fills/type
```

Screenshot and smoke scripts used while building:

```bash
node scripts/shots.mjs        # design/shots/*.png at 1440×1024 (clinic + mother)
node scripts/smoke.mjs        # clinic: acknowledge → register → log reading
node scripts/smoke-mother.mjs # mother: check-in → clinic alert → message → profile
```

## Not built yet

- Real auth and multi-tenant facilities; the store assumes one facility, one signed-in clinician
  and one mother (Amara Okafor), switchable by URL rather than by login.
- The mother app's OCR flows (the "Extra / edited" Figma page) — scanning an antenatal card into
  the record.
- Interfaces for labs/EMR ingestion — lab results are currently part of each patient record.
- SMS/WhatsApp delivery of check-in reminders.
