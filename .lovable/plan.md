
# PathForge — GCSE → Career & Life Planner (UK)

A signed-in app that turns a Year 11 student's GCSEs, dream job, dream home, and location into a concrete plan: application strategy, CV (PDF export), dream-house budget, free peer tutoring, a personal finance advisor, and a college/uni finder. Each AI tool has named, persistent chat threads.

## Stack & integrations

- TanStack Start + Tailwind + shadcn (existing template)
- Lovable Cloud (auth: email/password + Google; Postgres + RLS)
- Lovable AI Gateway (`google/gemini-3-flash-preview`) via `createServerFn` and a streaming `/api/chat` route using AI SDK + AI Elements
- `@react-pdf/renderer` for CV export
- All currency in £, UK-centric copy

## Information architecture (routes)

```
/                         Landing (hero, features, CTA → /auth)
/auth                     Sign in / Sign up (email + Google)
/_authenticated/
  onboarding              Multi-step intake (GCSEs, job, company, salary,
                          house plan, current + dream location, part-time job)
  dashboard               Overview cards + links to every tool
  plan                    AI-generated "best applicant" plan + chat threads
  cv                      CV builder, AI assist, live preview, PDF export
  house                   Dream house designer + cost estimator
  tutoring                Free peer tutoring board (offer help / request help)
  finance                 Personal finance advisor: savings plan to dream
                          house, includes education costs & part-time income
  education               College + university finder with AI Q&A chatbot
  chats/$tool/$threadId   Per-tool thread page (plan|cv|house|finance|education)
```

Each chat-enabled tool (plan, cv, house, finance, education) lists its threads in a sidebar, "New thread" creates a row and routes to `/chats/<tool>/<id>`.

## Data model (Lovable Cloud)

- `profiles(id, full_name, current_location, dream_location, part_time_wage_hourly, part_time_hours_week, created_at)`
- `user_roles(user_id, role)` + `has_role()` (per role-security pattern)
- `gcse_subjects(id, user_id, subject, predicted_grade)`
- `career_goals(user_id, job_title, job_link, job_description, company, posted_salary)`
- `house_plans(user_id, mode enum 'renovate'|'redecorate', notes, est_cost, target_year)`
- `cvs(id, user_id, content_json, updated_at)` — structured CV doc
- `ai_plans(id, user_id, kind, content_md, updated_at)` — cached generated plans
- `chat_threads(id, user_id, tool, title, updated_at)`
- `chat_messages(id, thread_id, user_id, role, parts_json, created_at)`
- `tutoring_posts(id, user_id, type 'offer'|'request', subject, level, body, contact, created_at)`
- `finance_snapshots(user_id, target_house_cost, target_year, monthly_save, debt_estimate, breakdown_json)`

All tables: explicit GRANTs, RLS on, policies scoped to `auth.uid()`. Tutoring posts readable by all authenticated users; writable by owner.

## Server functions / routes

- `src/routes/api/chat.ts` — streaming chat endpoint; system prompt switches on `tool` + loads user context (GCSEs, goals, house, finance) so every chatbot is personalised. Persists user + assistant messages to `chat_messages` via `onFinish`.
- `generatePlan`, `generateCv`, `estimateHouseCost`, `buildFinancePlan`, `findEducation` — `createServerFn` wrappers using `generateText` + `Output.object` for structured results.
- `exportCv` happens client-side via `@react-pdf/renderer` → download.

## AI behaviour

- All prompts UK-aware (GCSE/A-level, £, UCAS, apprenticeships).
- Plan = ranked action list (subjects to push, A-level/BTEC/apprenticeship route, skills, portfolio, work experience, networking) tied to the chosen job + company.
- Finance advisor = simple cashflow model: part-time income now → 6th form/uni costs → graduate salary ramp → house deposit & mortgage math, with a "minimise debt" lens.
- Education finder = asks clarifying questions (subject area, vocational vs academic, distance), then returns nearby colleges + chosen-uni course suggestions (Gemini knowledge; clearly labelled as guidance, not booking).

## UI

- AI Elements (`conversation`, `message`, `prompt-input`, `tool`, `shimmer`) installed for every chat surface.
- Custom warm, optimistic visual identity (not generic AI). Generated logo, not Sparkles. Cohesive design tokens in `styles.css`.
- Dashboard cards summarise progress per area.

## Build order

1. Enable Cloud, add migrations (profiles, roles, all tables, GRANTs, RLS).
2. Auth pages + `_authenticated` layout (managed).
3. Design system + logo + landing page.
4. Onboarding wizard writing to all intake tables.
5. Dashboard.
6. Streaming chat infra (`/api/chat` + thread list component) reused across 5 tools.
7. Plan, CV (+PDF export), House, Finance, Education pages.
8. Tutoring board.
9. Sitemap, robots, llms.txt, SEO meta per route.

## Out of scope (will be stubs with clear notes)

- Real-time uni/college DB lookups (we use AI suggestions with a "verify on official site" disclaimer).
- Real payments / mortgage broker integration.
- Email/social sharing of CV beyond PDF download.

## Heads-up

This is a large build — expect it across this turn to take a while and to land as a working v1 you can then refine page-by-page.
