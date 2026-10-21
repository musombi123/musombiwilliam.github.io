# Shamba Hub — Complete Documentation

**Product:** Jumuiya Shamba Hub  
**Ecosystem:** RevelaCode / Jumuiya  
**Audience:** product owners, frontend and backend engineers, QA, administrators, agronomy partners, and operational support  
**Last reviewed:** 21 October 2026

Shamba is the agriculture and farm-operations hub within Jumuiya. It brings farmer onboarding, registered farm records, crop and harvest tracking, farm activity logs, agricultural intelligence, weather and market snapshots, recommendations, alerts, a shared agriculture marketplace view, farm-rights review, soil-photo preflight, and marketplace safety reporting into one workspace.

This is implementation-oriented documentation. It reflects source contracts inspected on the Shamba source branches associated with the farmer-verification repair. It distinguishes existing contracts from features dependent on configured providers or unmerged changes. **A draft pull request is not a production release.**

## Documentation map

| Document | Purpose |
|---|---|
| [Architecture and user journeys](architecture.md) | Product scope, components, lifecycle, data ownership and feature boundaries |
| [REST API reference](api-reference.md) | Endpoints, methods, access rules, payload examples and error conventions |
| [Trust, verification and soil safety](trust-and-safety.md) | Farmer-profile approval, farm-rights review, soil-photo limitations, moderation and privacy |
| [Operations, testing and release runbook](operations-and-testing.md) | Configuration, CI, smoke tests, deployment order, troubleshooting and known gaps |

## At a glance

- **Frontend:** React/JSX and Tailwind CSS. Main shell: **src/Dashboard/ShambaHub.jsx**; API client: **src/services/jumuiyaApi.jsx**.
- **Backend:** existing RevelaCode backend and Jumuiya Flask blueprints. Main routes: **backend/jumuiya/shamba/routes.py**; trust/safety routes: **backend/jumuiya/shamba/trust_routes.py**.
- **API root:** **/api/jumuiya**; Shamba base: **/api/jumuiya/shamba**.
- **Storage:** MongoDB through the shared Jumuiya database/collection gateway. Browser and AI services must not connect directly to MongoDB.
- **Authentication:** user operations use the existing authenticated session and server-derived identity. Administrator queues and decisions require the backend-recognized **admin** or **super_admin** role.
- **Region:** examples use Kenyan counties and KES where relevant. Location and currency labels are data, not proof of farm rights.
- **Human review:** farmer-profile approval and farm-rights review are separate decisions. Neither is government land-title certification.

## Important source and release status

The repair is proposed in these companion pull requests:

- [Backend Shamba verification PR #20](https://github.com/musombi123/RevelaCode-Backend/pull/20)
- [Frontend Shamba verification and Trust Centre PR #63](https://github.com/musombi123/RevelaCode-Frontend/pull/63)

The targeted backend regression suite and frontend production builds passed on the reviewed source branch. At the time these docs were prepared, the PRs remained draft and the frontend Netlify Deploy Preview's auxiliary redirect/header/pages-changed checks were failing. Do not claim production is updated until the backend is deployed first, the preview issue is resolved, and the frontend is subsequently merged/deployed.

## Core workflow

1. A signed-in farmer submits a Shamba farmer profile.
2. An authorized Shamba administrator approves it, rejects it with a note, or requests more information.
3. Only a profile explicitly marked approved can create a farm under the repaired backend contract.
4. Each farm has its own rights-review state. The farm owner may submit a lawful land/lease/authorization/community reference through Trust & Safety.
5. An administrator reviews the separate farm-rights case. Protected farm operations remain blocked until rights status is verified.
6. The farmer uses crops, activities, harvests and eligible farm snapshots, recommendations, alerts, weather, market and AI-context operations.
7. Farmers may report marketplace safety concerns. An authorized moderator can action a report; the backend attempts to suspend the referenced active listing.

## Non-negotiable safety rules

- Never silently approve legacy farmer profiles. Missing review state should default conservatively to not_submitted.
- Never let client-supplied owner IDs or role labels override the authenticated identity or backend role checks.
- Never describe platform review as government land registration, title certification or legal advice.
- A camera image is not a laboratory test. Do not claim it measures pH, NPK, salinity, contaminants or underground layers.
- Do not request national ID/passport numbers in the farm-rights reference field.
- A soil-service quote request is not a confirmed appointment or payment.
- Keep tokens, secrets, raw personal documents and unnecessary evidence details out of logs and public documentation.

## Source repositories

- [Frontend](https://github.com/musombi123/RevelaCode-Frontend)
- [Backend](https://github.com/musombi123/RevelaCode-Backend)
- [Documentation repository](https://github.com/musombi123/musombiwilliam.github.io)

These docs explain the system. The deployed application repositories and tested revisions remain the source of truth for executable behavior.
