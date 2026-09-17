# Grid Console — how this is built

The console can ban people, change prices and delete organisations. It is a
small app with large consequences, so the rules below are not style
preferences: each one exists because its absence already caused a specific
failure, named next to it.

**Read this before adding a page, a filter or an endpoint.** There is one way
to do each, and it is short.

## The shape

```
src/admin/
  api/
    endpoints.ts   every route the console can call, as one `api` object
    types.ts       every shape the API returns, declared once
  components/
    ui.tsx           Button, Field, Panel, Badge, ErrorNote, EmptyNote
    AsyncScreen.tsx  loading / error / empty / data, rendered identically
    ErrorBoundary.tsx  keeps one broken screen from taking the console down
  lib/
    api.ts           fetch, auth headers, idempotency, refresh-on-401
    useAsyncData.ts  reads: fetch, reload, stale-response protection
    usePagedData.ts  reads, paged: the same, plus offset and "is there more"
    useAdminAction.ts writes: busy, error, reload-after-success
    coordinates.ts   Hub pin formatting and validation
  screens/           one file per tab, no API knowledge beyond `api.*`
  AdminApp.tsx       tabs, and the per-screen error boundary
```

## The rules

**1. Screens never write a URL.** Everything goes through `api.*` in
`api/endpoints.ts`. Twenty URL strings were spread across eight screens, with
`'/v1/admin/organizations'` appearing three times under three different
response types, and nothing anywhere listed what the console actually talked
to. A route change was a grep and a hope.

**2. A shape is declared once, in `api/types.ts`.** `AdminOrganization` and
`OrganizationRow` were the same concept in two files with different fields, so
a field added to one was invisible to the other.

**3. Reach the API as `api.thing.call()`, never as a bare named import.**
`import { organizations }` collided with the obvious local name for the fetched
list on the very screen that needed it, and because the call sat inside a
callback the local won at runtime — `organizations.list` became a TypeError on
an array rather than a compile error.

**4. Encode the server's rules in the types.** Where a route refuses a
combination, make it unstatable. `ReportDecision` is a discriminated union
because `banDurationDays: null` means *permanent ban* while omitting it is an
error — as an optional number those two are indistinguishable at the call
site, and the first version of that function silently broke permanent bans.

**5. Reads use `useAsyncData` or `usePagedData`, writes use
`useAdminAction`.** A list that can exceed one page uses `usePagedData`;
anything bounded (pricing, tiers, the counts) uses `useAsyncData`. Neither is
optional. `useAsyncData` carries stale-response protection: every screen has a
filter, switching it fires a second request, and without a guard the slower
response wins — on a moderation queue that means acting on the wrong report.
`useAdminAction` clears the previous error before a retry, clears `busy` in
`finally` so a throw cannot wedge the buttons, and awaits the reload only
after the write resolves.

**5b. A list says how much of itself you are seeing.** Every screen here was
one capped fetch — 100 rows, 200 for the audit log — with no "load more" and
**no sign that anything had been cut off**, so at 101 open reports the console
showed 100 and looked complete. `MoreRow` renders the count and the button
together, because "100" reads as a total unless something says otherwise.
Every one of these routes has accepted `offset` from the start; nothing was
sending it.

**5c. Every destructive action has its inverse wired.** Ban had no unban and
Remove had no restore — both routes existed from the first day with no caller,
which made two of the three things this console can do one-way doors. If a new
action takes something away, the change that adds it adds the way back.

**6. Distinguish "empty" from "not loaded".** `AsyncScreen` treats `null` as
loading and `[]` as empty, with different copy. On a queue, "nothing to do"
and "we could not tell you" must never look alike.

**7. Every destructive action takes a reason.** The server requires it for the
audit log; the endpoint signatures make it a required argument so it cannot be
forgotten in an object literal.

**8. A screen crash must not take the console with it.** Each screen renders
inside its own `ErrorBoundary`, keyed by tab. One `undefined.toFixed()`
blanked the entire console once — and a white page is indistinguishable from a
failed deploy, a dropped session, or the API being down.

**9. Optional until proven deployed.** A field added to the API in the same
change as the UI reading it is optional in `types.ts` until that API is live.
The console deploys independently of the backend and has shipped first at
least once.

## Adding things

**A new endpoint** — add a function to the right group in
`api/endpoints.ts`, with its request and response types. If the route refuses
some combination of arguments, express that as a union rather than a comment.

**A new screen** — a file in `screens/`, reading through `useAsyncData` and
writing through `useAdminAction`, rendering through `AsyncScreen`. Add it to
`TABS` and the switch in `AdminApp.tsx`; the boundary is already there.

**A new filter** — local `useState`, passed to `api.*`, listed in the hook's
`deps`. The stale-response guard handles the race; do not add your own. Check
the route's own query schema before building one: `category` on reports,
`status` on triage and `targetType`/`targetId` on the audit log were all
supported by the API for months while the console sent none of them, so the
first question is whether the filter already exists server-side.

Note the difference between the two hooks here. `useAsyncData` restarts when
the *identity* of its fetcher changes, which works only because every call
site passes a fresh arrow each render — hand it a stable function and the
filter silently stops resetting the list. `usePagedData` keys on a signature
of `deps` instead, so its deps must be scalars and its reset does not depend
on the caller accidentally allocating.

**Access** — there is one way in: an emailed code to an address on the
`admin_users` allowlist. No password, no second credential, no bypass. The
sign-in screen refuses a session whose token carries no admin claim, which is
a *message* rather than a boundary — every admin route checks server-side on
every request, and that is the check that matters.
