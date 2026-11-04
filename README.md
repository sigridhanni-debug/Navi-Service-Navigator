# Navi – OIXIO Service Navigator

A responsive web app that helps businesses find the right OIXIO service: a searchable catalogue, a 4-step needs navigator with rule-based recommendations, a contact form, and an open admin area.

Demo app: there is **no login** – every page, including `/admin`, is public.

## Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS 4 · shadcn/ui-style components (Radix) · Lucide icons · Prisma 6 · PostgreSQL on Railway

## Pages

| Route | What it does |
| --- | --- |
| `/` | Catalogue: search + filter chips (business area, company size) |
| `/service/[slug]` | Service detail, related services, "Contact the team" dialog |
| `/navigator` | 4-step questionnaire → top 3 services with match score and reasons |
| `/admin` | "Manage" (footer link): Services CRUD + visibility, Leads table with status and CSV export |

## API

| Method | Route | Notes |
| --- | --- | --- |
| GET | `/api/services?q=&area=ERP,Advisory&size=small&all=1` | `all=1` includes hidden services |
| POST / PUT / DELETE | `/api/services` | PUT body includes `id`; DELETE uses `?id=` |
| GET | `/api/services/[slug]` | Service + related services |
| POST | `/api/recommend` | `{ challenge, size, systems[], timeline }`; stores a `NavigatorAnswer` |
| POST / GET / PATCH | `/api/leads` | `GET ?format=csv` downloads CSV; PATCH `{ id, status }` |

## Data

- Prisma schema: `prisma/schema.prisma` (Service, Lead, NavigatorAnswer); migrations in `prisma/migrations`.
- Services are seeded from `data/services.csv` (`|` separates multiple company sizes / tags).
- The seed is idempotent (upsert by slug). It runs automatically when the server starts and the Service table is empty (`src/instrumentation.ts`). To re-import manually: `npm run seed` with `DATABASE_URL` set.

## Deployment (Railway)

1. In a Railway project, add a **PostgreSQL** database.
2. Add a service from this GitHub repo (branch `main`, auto-deploy on).
3. In the app service variables set `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`.
4. Under Settings → Networking, generate a public domain.

Railway runs `npm run build` (`prisma generate && next build`) and `npm start` (`prisma migrate deploy && next start`, listening on `PORT`).
