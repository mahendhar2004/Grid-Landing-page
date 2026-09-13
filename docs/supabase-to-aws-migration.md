# Moving the landing page off Supabase onto AWS — findings

**Status: superseded — Option C was taken and the client-side work is done.**
**Date:** 2026-09-13 · updated 2026-09-13 with two answers from the owner and three
facts checked against the migrations · **updated again 2026-09-13: the code has
been written.**

> ### The migration happened
>
> This document below still reads as a decision to be made. It is kept for the
> reasoning, not as a description of the current code. What is true now:
>
> - **`@supabase/supabase-js` is removed from this repo.** `src/lib/supabase.ts`
>   is deleted and nothing imports it. The public bundle no longer ships a
>   database client at all.
> - **All four consumers moved to the Grid v2 API** through the new
>   `src/lib/publicApi.ts` (deliberately separate from `src/admin/lib/api.ts`,
>   which carries an admin bearer token that must never be attached to a public
>   request):
>
>   | Page | Was | Now |
>   |---|---|---|
>   | `Testimonials` | `reviews` where `is_featured` | `GET /v1/public/testimonials` |
>   | `ContactPage` | insert `contact_messages` | `POST /v1/public/contact` |
>   | `ReviewPage` | insert `reviews` | `POST /v1/public/review` |
>   | `BugReportPage` | insert `bug_reports` + Supabase Storage | `POST /v1/public/bug-report` + presigned S3 |
>
> - **Screenshots go to S3 by presigned POST**, one target per file, rate limited
>   by IP before the URL is minted, and constrained to the
>   `public-bug-reports/` prefix. The client no longer chooses the object key.
> - **The admin console is now connected end to end.** Featuring a review in the
>   console's Reviews inbox is what puts it on this homepage; before this change
>   the console wrote to Postgres and the site read Supabase, so the button did
>   nothing visible.
>
> **Still true and still outstanding:** none of this works until the AWS stack is
> actually deployed and `VITE_API_URL` points at a real API. Until then the forms
> show their "temporarily unavailable" message and the testimonial strip renders
> nothing — the same degradation as an unconfigured Supabase build, which is why
> `isApiConfigured` mirrors the old `supabase === null` contract exactly.

> ### What changed in this update
>
> **Open question 1 is answered: this repo is the landing page that ships.**
> `grid-v2/apps/landing` is not the deploy target. So these four endpoints are
> needed for *this* codebase and none of the work is duplicated. It also means
> `grid-v2/apps/landing` is now unowned — decide separately whether it is deleted
> or kept as an internal preview, because right now it is a second Vite app that
> nobody deploys.
>
> **Open question 3 is now partly answerable, and the news is worse than "requires
> a JWT".** I checked the 58 migrations:
>
> | Table | Exists? | Blocker |
> |---|---|---|
> | `bug_reports` | ✅ `20261114090000` | `user_id UUID **NOT NULL** REFERENCES users(id)` |
> | `feedback` | ✅ `20261128090000` | `user_id UUID **NOT NULL** REFERENCES users(id)` |
> | `reviews` / testimonials | ❌ none | must be built |
> | `contact_messages` | ❌ none | must be built |
>
> The two that exist **cannot store an anonymous submission at all.** It is not
> that the handler checks a token — the *schema* demands a real `users` row, with
> a foreign key enforcing it. A visitor to the marketing site has no user row and
> never will. So §3's "requires JWT" understated the gap: dropping `authenticate`
> from a copied handler would fail on insert.
>
> That forces a real schema decision, and it is the first thing to settle:
>
> - **Make `user_id` nullable and add a `source` column** (`APP` / `WEB`). One
>   table per concept, one admin queue to watch. But every existing query,
>   moderation view and type that assumes a submitter now has to handle null,
>   and an anonymous row and a member row are genuinely different things — one
>   is attributable and rate-limited by account, the other is not.
> - **Separate public tables** (`public_bug_reports`, `public_reviews`,
>   `contact_messages`). Nothing existing changes, the anonymous-vs-member
>   distinction stays explicit in the schema, and abuse controls can differ
>   without a `CASE`. Costs a second place to look for bug reports.
>
> **Recommendation: separate tables.** These are submissions from strangers on
> the open internet; the in-app ones are from verified members of a known Hub.
> Collapsing them into one table means every future query has to remember the
> difference anyway, and forgetting once is how an unverified stranger's report
> ends up treated as a trusted member's.
>
> Note this also means §5 step 6 ("verify first whether `reviews` and
> `bug_reports` already exist") is now **done**: `reviews` does not,
> `bug_reports` does but is unusable as-is. Two new migrations minimum, three if
> testimonials get their own table.
>
> **Update, same day — the backend half is now built.** Owner asked for the
> separate tables, so migration `20261214090000_create_public_submissions.sql`
> and five handlers under `src/functions/public/` exist in the Grid_App repo:
>
> | Route | Method | Notes |
> |---|---|---|
> | `/v1/public/contact` | POST | 5/hour per IP |
> | `/v1/public/reviews` | POST | 3/hour. Lands `PENDING`, unfeatured |
> | `/v1/public/testimonials` | GET | Cacheable, not rate limited |
> | `/v1/public/bug-reports` | POST | 5/hour. Screenshot keys constrained to the `public-bug-reports/` prefix |
> | `/v1/public/bug-reports/presigned-url` | POST | 15/hour. Allow-listed content types only |
>
> Tables: `contact_messages`, `public_reviews`, `public_bug_reports`, plus
> `public_rate_limits` — because `rate_limit_counters.user_id` is *also*
> `NOT NULL REFERENCES users(id)`, so the existing rate-limit helper could not
> serve anonymous callers either. That was the second instance of the same
> wall, and it is worth noting the pattern: this codebase assumes an
> authenticated caller everywhere, not just in the handlers.
>
> CORS is now scoped to `CORS_ALLOWED_ORIGINS` (default `grid.in`) rather than
> `false` — never `true`, which would emit `*` across all routes.
>
> **None of this is deployed**, and it cannot be called until the stack is. It
> also does not change the Option A/B/C recommendation below: Option B still
> stands, because the cost was never in writing the handlers.
>
> Still to do on this repo's side when the time comes: swap the four Supabase
> call sites, delete `@supabase/supabase-js`, and export the existing rows.
>
> **Still unverified, unchanged:** whether anything is deployed in AWS, the
> Supabase RLS policies, and how much data is in Supabase today. The RLS audit
> remains the one urgent item — it is a live exposure and costs an afternoon.

---

## The headline

**This is not a migration onto running infrastructure. Nothing is deployed yet.**

The Grid v2 AWS stack is well-specified — 12 CloudFormation templates, a 77 KB
`serverless.yml` defining 178 functions — but every resource named in this document
is **specified in code, not live**. The evidence:

- `grid-v2/infra/bootstrap/README.md` says so directly: *"This directory has no AWS
  CLI / credentials wired up in the coding environment — these templates are written
  for review and deployment on your side."*
- `apps/backend/.env` contains literal placeholders — `AWS_ACCESS_KEY_ID=<your key id>`.
- The deploy workflows (`deploy-staging.yml`, `deploy-prod.yml`) are `workflow_dispatch`
  only — manual, never auto-triggered — and their own comments note nothing has merged
  to main yet.
- There is no `aws` CLI and no `~/.aws` on this machine, so I could not verify live
  state even if it existed.

So the real scope of "migrate these four features to AWS" is:

> **Deploy the entire v2 backend to AWS for the first time, then add four new public
> endpoints to it.**

That is a materially bigger job than swapping a client library, and it should be
planned as such. If the intent was a contained change to the landing page, this
isn't one.

---

## 1. What is on Supabase today

Four features, all called directly from the browser using the Supabase anon key.

| Feature | File | Operation |
|---|---|---|
| Testimonials | `src/components/home/Testimonials.tsx` | `SELECT` from `reviews` where `is_featured`, newest first |
| Contact form | `src/pages/ContactPage.tsx` | `INSERT` into `contact_messages` |
| Review form | `src/pages/ReviewPage.tsx` | `INSERT` into `reviews` |
| Bug report | `src/pages/BugReportPage.tsx` | upload to `bug-report-images` bucket, then `INSERT` into `bug_reports` |

### Data contracts

```
GET  featured reviews  → id, reviewer_name, college, rating, feedback
POST contact           ← name, email, subject, message
POST review            ← reviewer_name, reviewer_email, college, rating (1–5), feedback
POST bug report        ← title, description, category, severity,
                         screenshots[], device_info { source, reporter_name, reporter_email }
```

Bug report uploads: max 3 files, ≤5 MB each, `image/jpeg|png|webp|gif` only.
Categories: `crash, ui_bug, performance, payment_issue, chat_issue, feature_request, other`.
Severities: `low, medium, high, critical`.

### Security problems in the current setup

These are worth fixing regardless of which backend wins — and they are reasons the
migration has genuine value beyond tidiness:

1. **The anon key ships to the browser.** Anyone can read it out of the bundle and
   write rows directly, bypassing the forms entirely. Whether that is actually
   exploitable depends on Supabase Row Level Security policies, which live in the
   Supabase dashboard — **I could not inspect them and have not verified them.**
   If RLS is not tightly configured on these four tables, the tables are effectively
   open to the internet.
2. **All validation is client-side.** `sanitize()`, `isValidEmail()` and the file
   type/size checks run in the browser only.
3. **Rate limiting is `localStorage`.** `RATE_LIMIT_MS = 2 minutes`, keyed on
   `grid_bugreport_last`. Clearing storage or using curl defeats it completely.

Any replacement must re-validate everything server-side. If it merely relays the
payload, the migration buys nothing on security.

---

## 2. What exists on the AWS side

Region **ap-south-1** (billing in us-east-1). Stack names `grid-v2-*`.
**All specified, none confirmed deployed.**

### Infrastructure-as-Code — two layers

**Bootstrap** (`grid-v2/infra/bootstrap/`) — raw CloudFormation, 12 templates:
`vpc`, `iam`, `secrets`, `database`, `storage`, `email`, `billing`, `analytics`,
`moderation`, `waf`, `monitoring`. Deployed by hand, nine stacks in a documented
order, via `aws cloudformation deploy --stack-name grid-v2-vpc ...`.

**Application** (`apps/backend/serverless.yml`) — Serverless Framework v4,
**178 functions across 143 `httpApi` routes**, nodejs22.x on arm64.
Deploy: `npm run deploy:staging --workspace=@grid/backend`.

### Key resources

- **RDS Postgres + RDS Proxy** (`database.yaml`) — one shared instance; staging and
  prod are separate roles/databases on it. IAM auth via `@aws-sdk/rds-signer`.
- **S3** `grid-v2-{dev,staging,prod}-media` behind CloudFront with OAC (`storage.yaml`).
- **SES** domain identity, **Secrets Manager**, **SQS**, Rekognition/Comprehend IAM.
- **No Cognito** — auth is custom JWT plus email OTP.

### Adding an endpoint

Two files, and there is a clear existing pattern:

1. `apps/backend/src/functions/<group>/<action>/handler.ts`
2. a function block in `serverless.yml`

### Migrations

Plain SQL in `apps/backend/migrations/`, **58 files**, named
`YYYYMMDDHHMMSS_description.sql`, applied in lexical order by `scripts/migrate.ts`,
tracked in `schema_migrations`, **SHA-256 checksummed** (editing an applied migration
fails loudly), guarded by a Postgres advisory lock. Run with `npm run migrate`.

### Secrets

AWS Secrets Manager (`grid-v2/{env}/external-api-keys`, db-password, JWT signing,
OTP HMAC), read at runtime by `lib/secrets.ts`. No secrets in environment variables.

---

## 3. The gap

Three of the four features already have backend analogues — **but every one of them
requires a logged-in user.** Authorization is application-level: handlers import
`authenticate` from `src/middleware/jwt-verify.ts`.

| Landing page need | Existing v2 route | Gap |
|---|---|---|
| Bug report + screenshots | `POST /v1/bug-reports` + `GET /v1/bug-reports/presigned-url` | requires JWT |
| Review / rating | `POST /v1/feedback` | requires JWT |
| Contact message | — | nothing exists |
| Testimonials (public read) | — | nothing exists (admin list only) |

A marketing site has no logged-in user, so none of these are usable as-is.

### Three things make this tractable

1. **Anonymous routes are not a new concept.** `auth/send-otp`, `auth/initiate`,
   `auth/verify-otp`, `auth/register-hub`, `config/version` and `health` all omit
   `authenticate`. There is a pattern to copy.
2. **The presigned-upload flow already exists and is exactly right.**
   `bugReportsPresignedUrl` issues an S3 presigned upload under a `bug-reports/`
   prefix; the client PUTs straight to S3, then posts the record. That is precisely
   the two-step flow the screenshot upload needs.
3. **The comment in `serverless.yml` anticipates this exact task:**

   ```yaml
   httpApi:
     cors: false  # no browser client exists yet ... Revisit if/when the
                  # landing page needs to call this API directly.
   ```

### Three things that make it harder

1. **CORS is off.** It must be enabled and scoped to the landing origin — a change
   to a shared config that affects all 143 routes, so it needs care.
2. **There is no proven abuse-control pattern for anonymous writes.**
   `lib/rateLimit.ts` exists, but `auth/send-otp` — a public endpoint that sends
   email — **does not use it.** So there is no working example to copy, and public
   write endpoints without rate limiting are a spam and cost liability (SES
   reputation, Rekognition spend, S3 storage).
3. **Unverified:** whether `reviews` and `bug_reports` tables already exist among
   the 58 migrations. `contact_messages` certainly does not. **Check before assuming.**

---

## 4. Options

### Option A — Stay on Supabase for the website's forms

Keep the four features where they are. Fix the real problems instead: audit and
tighten RLS policies, and move writes behind a Supabase Edge Function that validates
server-side and rate-limits by IP.

- **Cost:** near zero. **Time:** hours.
- **Risk:** low. Nothing else changes.
- **Argument for:** these are *website* features, not *app* features. Coupling the
  marketing site's contact form to the app's production backend means a backend
  deploy can take down the contact form, and vice versa. Separation here is a
  feature, not debt.
- **Argument against:** two backends to reason about; contradicts "AWS for everything".

### Option B — Wait, then migrate after v2 ships

Leave it on Supabase now. Once the v2 stack is genuinely deployed and stable in
production, add the four public endpoints as a follow-up.

- **Cost:** zero now.
- **Risk:** low. Doesn't add scope to a launch that already has open blockers and
  has never been run on a real device.
- **Argument for:** sequencing. Deploying the whole stack for the first time *in
  order to move a contact form* inverts the priority. The stack has to be deployed
  for v2 to launch anyway — do it for that reason, on that timeline.
- **Argument against:** the "two backends" state persists longer.

### Option C — Migrate now

Deploy the bootstrap stacks, deploy the backend, add a `public/` function group with
four unauthenticated handlers, enable scoped CORS, add the `contact_messages`
migration, add rate limiting, then swap the four call sites in this repo.

- **Cost:** real AWS spend begins (RDS runs continuously — this is the main ongoing
  line item, not Lambda). **Time:** days, not hours, and most of it is deployment and
  verification rather than writing the handlers.
- **Risk:** highest. First-ever deployment of the stack, driven by a marketing-site
  requirement. Also introduces the project's first public *write* endpoints, and
  there is no existing rate-limiting pattern to copy.
- **Argument for:** one backend; matches the stated direction.

**My recommendation: Option B**, with the RLS audit from Option A done now, because
that is a live exposure and it is cheap to check. The endpoints themselves are
genuinely small — the cost is in first-time deployment, and that cost is better
carried by the v2 launch than by a contact form.

That said, this is a judgment about sequencing and priorities, not a technical
blocker. If the goal is to consolidate before launch, Option C is achievable.

---

## 5. If you choose Option C — what it takes, in order

1. **Provision AWS access.** No credentials exist in this environment. Needs an
   account, an IAM user/role, and the CLI configured. *Must be done by you.*
2. **Deploy the nine bootstrap stacks** in the documented order (`infra/bootstrap/README.md`).
3. **Run migrations** against the new database (`npm run migrate`).
4. **Deploy the backend** (`npm run deploy:staging --workspace=@grid/backend`).
5. **Enable CORS** in `serverless.yml`, scoped to the landing origin — affects all routes.
6. **Add the `contact_messages` migration.** Verify first whether `reviews` and
   `bug_reports` already exist among the 58.
7. **Write four handlers** under a new `public/` group, mirroring the existing ones
   minus `authenticate`, with full server-side validation.
8. **Add rate limiting** — no existing pattern to copy; needs designing. IP-based,
   plus a honeypot check, and consider a captcha on the bug report given it triggers
   S3 writes.
9. **Swap the four call sites** in this repo and delete `@supabase/supabase-js`.
10. **Migrate existing data** out of Supabase — existing reviews and bug reports.
    *Not yet scoped. How much data is there? Do the featured testimonials need to
    survive?*

Steps 1–4 are the bulk of the work and are entirely v2-stack work, not landing-page work.

---

## 6. Open questions

1. ~~**Do the two landing pages converge?**~~ **Answered 2026-09-13: no.** This
   repo is what gets deployed; `grid-v2/apps/landing` is not the deploy target.
   The endpoints are needed here. Follow-up: decide what happens to that second
   app, since it is currently a Vite project nobody ships.
2. **What do the Supabase RLS policies currently allow?** I could not inspect them.
   This determines whether the current setup is merely untidy or actively exposed.
3. **Is there existing data to preserve?** Featured testimonials are rendered on the
   homepage today, so at minimum those rows matter. *(Partly answered: the
   destination tables do not exist yet, so this is a straight export-and-load
   once they do — not a reconciliation.)*
4. **Who operates this?** Public write endpoints need someone watching spam, cost and
   SES reputation. The contact form currently mails nobody — submissions sit in a
   table. Should the AWS version send via SES?
5. **What is the actual AWS budget?** RDS running continuously is the meaningful
   recurring cost, and it starts the day the bootstrap stacks deploy.

---

## 7. What I verified, and what I did not

**Verified by reading files:** the four Supabase call sites and their exact payloads;
client-side-only validation and localStorage rate limiting; the CloudFormation
templates and their stack names; `serverless.yml` structure, route count and the
`cors: false` line; the migration system and its checksum guard; the presigned-upload
flow; which routes omit `authenticate`; the absence of AWS credentials and CLI.

**Not verified:** whether anything is deployed in AWS (no credentials, no CLI);
Supabase RLS policies (no dashboard access); whether `reviews`/`bug_reports` tables
exist among the 58 migrations; how much data is in Supabase today; actual AWS costs.

Treat every resource name in this document as **specified in code, not confirmed running.**
