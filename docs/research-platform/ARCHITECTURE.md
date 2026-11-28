# Research Centre & Team Platform — Architecture

**Status:** Architecture baseline; implementation has not started.
**Owner:** Musombi William
**Public entry points:** `research-centre.html` and `team.html`
**Current hosting:** Static GitHub Pages portfolio.

## 1. Current-state findings

The portfolio is a static website. The Research Centre form currently creates an email draft; the Team form does the same. Neither form submits to a server, persists applications, creates accounts, authenticates users, or grants access. The site README explicitly documents these limitations.

The Research Centre describes itself as an independent initiative, not a university, registered laboratory, or accredited research institution. Platform copy and workflows must preserve that distinction.

## 2. Deployment boundary — mandatory

**Do not put backend source code, environment files, database dumps, uploads, credentials, or private application configuration in the GitHub Pages repository.**

The current Pages workflow stages the repository contents into the deployed website directory (excluding only `.git` and `.github`). Therefore, adding a backend folder to this repository risks publishing its source and configuration as static website files.

Use two independently deployed components:

1. **Public portfolio:** existing static GitHub Pages site. It contains public pages and browser code only.
2. **Private application service:** a separate private backend repository and independently deployed API service. It owns authentication, authorization, database access, email delivery, file access, audit events, and GitHub integration.

The portfolio calls the API over HTTPS. The API origin is public configuration; API secrets are never shipped to the browser.

## 3. Proposed technology baseline

| Layer | Baseline | Rationale |
|---|---|---|
| API | Node.js LTS + TypeScript + Express | Familiar ecosystem, explicit middleware and broad hosting portability |
| Database | PostgreSQL | Relational integrity for users, memberships, invitations, projects and tasks |
| Data access | Prisma ORM with checked-in migrations | Typed access and reproducible schema evolution |
| Validation | Zod schemas at request boundaries | Reject malformed input before business logic |
| Authentication | Email verification + Argon2id password hashing + opaque server-managed sessions | No third-party identity dependency required for the first release |
| Session transport | Secure, HttpOnly, SameSite cookies; CSRF protection | Avoid browser-accessible bearer tokens and reduce session theft exposure |
| File storage | Private S3-compatible object storage | Database stores metadata; documents remain private objects |
| Background work | PostgreSQL-backed job queue initially | Avoid unnecessary Redis/worker infrastructure before measured need |
| Email | Provider adapter configured by environment | Verification, recovery, invitations and notifications |
| API contract | OpenAPI 3.1 | Reviewable, versioned API surface |
| Tests | Vitest or Jest, Supertest, PostgreSQL integration tests | Test authorization and persistence against a real database engine |
| Packaging | Docker | Portable deployment; provider selection can follow budget and operational constraints |

Versions must be pinned and supported at implementation time. Hosting provider and production service URLs are deliberately not assumed here.

## 4. Product capabilities

### Public visitor
- Browse public research domains, active tracks and approved public outputs.
- Submit a research idea or collaboration application.
- See a clear acknowledgement and application reference after server acceptance.
- Cannot access private projects, member profiles, files or team activity.

### Applicant
- Verify email address.
- View application status and respond to requests for additional information.
- Does not become a member merely by submitting an application.

### Researcher / collaborator
- Access only projects to which they have an active membership.
- Create and update permitted research records, tasks and comments.
- Upload and retrieve authorized documents through short-lived signed URLs.
- Connect an eligible GitHub repository only after explicit authorization.

### Team owner / administrator
- Create projects and invite collaborators.
- Assign project roles and manage project membership.
- Review applications and invitations within granted scope.
- View audit events relevant to their administrative responsibilities.

### Platform administrator
- Manage platform-wide users, applications, policy and abuse response.
- Platform administration must be separate from ordinary project ownership and protected by stronger controls.

## 5. Authorization model

Use deny-by-default authorization. Every API request that reads or changes a private resource must verify both the actor's role and the resource's tenant/project relationship. Never rely on hidden UI controls as authorization.

Suggested roles:

- `platform_admin`: platform-wide administration.
- `researcher`: approved platform member.
- `team_owner`: owner of a team.
- `team_admin`: manages team membership and team projects.
- `collaborator`: contributes to explicitly assigned projects.
- `viewer`: read-only access to explicitly assigned projects.

Roles are scoped. A project role does not grant access to another project. A team role does not automatically grant platform-wide administration.

## 6. Initial relational data model

Use UUID primary keys, UTC timestamps, foreign keys, unique constraints, explicit indexes and soft deletion only where retention policy requires it.

| Table | Purpose / key relationships |
|---|---|
| `users` | Identity, normalized unique email, password hash, account state, verification timestamp |
| `user_sessions` | Hashed opaque session token, user, expiry, rotation/revocation metadata |
| `email_verification_tokens` | Hashed single-use token, user, expiry and consumption timestamp |
| `password_reset_tokens` | Hashed single-use token, user, expiry and consumption timestamp |
| `applications` | Public research/team applications, status, applicant contact, review metadata |
| `teams` | Team name, owner and lifecycle state |
| `team_memberships` | User, team, scoped role, status; unique active membership constraint |
| `invitations` | Team/project invite, normalized target email, hashed token, role, expiry, inviter and accepted timestamp |
| `projects` | Team, title, abstract, visibility, status, creator |
| `project_memberships` | User, project, scoped role and membership status |
| `research_proposals` | Project-linked proposal, objective, methods, hypothesis, status and review |
| `documents` | Private object key, owner/project, MIME type, byte size, checksum, classification and scan state |
| `tasks` | Project, title, description, status, priority, assignee, due date and creator |
| `comments` | Authored discussion attached to a task or research record |
| `github_installations` | GitHub App installation metadata; no private key stored in database |
| `github_repositories` | Explicitly connected repository metadata and project association |
| `audit_logs` | Actor, action, resource, timestamp, request correlation ID and minimal safe metadata |
| `outbox_events` | Transactional events for reliable email and background processing |

Do not store uploaded document bytes in PostgreSQL. Do not store raw session, invitation, verification or reset tokens; store cryptographic hashes and compare safely.

## 7. API surface — version 1

All endpoints use `/api/v1`, JSON request/response bodies, a consistent error envelope, request IDs, schema validation and documented status codes.

### Authentication
- `POST /auth/register` — create a pending account; require verified email before activation.
- `POST /auth/verify-email` — consume a one-time verification token.
- `POST /auth/login` — authenticate and issue a secure session cookie.
- `POST /auth/logout` — revoke current session.
- `GET /auth/session` — return current safe user/session summary.
- `POST /auth/password/forgot` — always return a non-enumerating response.
- `POST /auth/password/reset` — consume a one-time reset token and revoke prior sessions.

Account registration should initially be invitation- or approval-gated. Public application submission is not equivalent to account provisioning.

### Applications
- `POST /applications` — submit a research idea or team application with rate limiting and validation.
- `GET /admin/applications` — authorized reviewers only.
- `PATCH /admin/applications/:id` — update status and reviewer notes.
- `POST /admin/applications/:id/invite` — issue an expiring invitation after approval.

### Teams and projects
- `GET /teams`, `POST /teams`
- `GET /teams/:teamId`, `PATCH /teams/:teamId`
- `GET /teams/:teamId/members`, `POST /teams/:teamId/invitations`
- `GET /projects`, `POST /projects`
- `GET /projects/:projectId`, `PATCH /projects/:projectId`
- `GET /projects/:projectId/members`, `PATCH /projects/:projectId/members/:userId`

### Research workspace
- `GET /projects/:projectId/proposals`, `POST /projects/:projectId/proposals`
- `GET /proposals/:proposalId`, `PATCH /proposals/:proposalId`
- `GET /projects/:projectId/tasks`, `POST /projects/:projectId/tasks`
- `PATCH /tasks/:taskId`, `POST /tasks/:taskId/comments`

### Documents and integrations
- `POST /projects/:projectId/documents/upload-intent` — authorize metadata and issue a short-lived upload URL.
- `POST /documents/:documentId/complete` — verify object metadata/checksum and mark upload complete.
- `GET /documents/:documentId/download` — authorize and issue a short-lived download URL.
- `POST /projects/:projectId/github/connect` — initiate GitHub App installation flow.
- `GET /integrations/github/callback` — validate signed state and bind authorized installation.

Never accept arbitrary storage keys or GitHub repository IDs without verifying ownership and project authorization.

## 8. Security baseline — release blockers

- Argon2id password hashing with parameters calibrated on deployment hardware.
- Email verification and single-use, expiring password-reset tokens.
- Opaque random session IDs; only hashes stored server-side; rotation on login and privilege changes.
- Secure, HttpOnly, SameSite cookies; CSRF token/origin validation for state-changing browser requests.
- HTTPS only; strict CORS allowlist for the exact portfolio origin(s).
- Rate limits for login, registration, reset, verification, invitations and public applications.
- Generic login/reset responses to prevent account enumeration.
- Zod validation, output encoding, safe parameterized queries and request body/file size limits.
- Resource-level authorization on every private query and mutation.
- Private buckets, short-lived signed URLs, content-type allowlists, upload size limits and malware scanning before download/preview.
- GitHub App with least-privilege permissions; installation tokens minted server-side; never put GitHub App private keys or installation tokens in browser code.
- Secrets supplied through deployment secret manager/environment; `.env` ignored; only placeholders in `.env.example`.
- Structured logs with request IDs; never log passwords, tokens, full private document contents or unnecessary personal data.
- Immutable or append-only audit events for authentication, role changes, invitations, exports and document access.
- Dependency scanning, secret scanning, security headers and tested backup/restore procedures.

## 9. Privacy, retention and governance

- Collect only information necessary for applications and collaboration.
- Publish a privacy notice before accepting real applications.
- Define who can review applications, how long rejected applications are retained, and how deletion/access requests are handled.
- Separate public research outputs from private working documents.
- Obtain explicit consent before making contributor names, profiles or contributions public.
- Record consent and administrative actions where appropriate.
- Do not represent the initiative as an accredited institution or promise formal qualifications, employment or grants unless those arrangements actually exist.

## 10. Reliability and operations

- Health endpoints: `GET /health/live` and `GET /health/ready`; readiness checks database connectivity without leaking internals.
- Database migrations run as a controlled deployment step, not concurrently from every application instance.
- Use connection pooling with explicit pool limits based on the selected database plan.
- Use transactional outbox for email/invitation delivery; retry transient failures with bounded exponential backoff and dead-letter visibility.
- Add pagination and stable ordering to list endpoints.
- Back up PostgreSQL and object storage; periodically test restore into an isolated environment.
- Track latency, error rate, database saturation, queue age, email failures and storage usage.
- Scale only from measured load tests; do not claim a traffic capacity before production-like testing.

## 11. Delivery phases and acceptance criteria

### Phase 0 — Architecture and repository boundary
- [x] Confirm static Pages limitations from the current source.
- [x] Identify that Pages stages repository contents into its public artifact.
- [x] Define separate private backend repository and API deployment boundary.
- [x] Define initial data model, API surface and security baseline.

### Phase 1 — Backend foundation
- [ ] Create a separate private backend repository.
- [ ] Add TypeScript/Express application, Dockerfile, health endpoints and structured configuration.
- [ ] Add PostgreSQL schema and versioned migrations.
- [ ] Add automated unit/integration tests and CI.
- [ ] Add OpenAPI contract and `.env.example` with placeholders only.

### Phase 2 — Identity and access
- [ ] Registration, email verification, login/logout and password recovery.
- [ ] Secure cookie sessions, CSRF, CORS and rate limiting.
- [ ] Team/project RBAC and resource-level authorization tests.
- [ ] Invitation approval workflow and audit events.

### Phase 3 — Research workspace
- [ ] Project creation and membership management.
- [ ] Research proposals, tasks, comments and activity history.
- [ ] Private document storage with signed URLs and scanning.
- [ ] Search, pagination and export controls.

### Phase 4 — Portfolio integration
- [ ] Replace email-draft forms with validated API submissions.
- [ ] Add accessible success, failure and retry states.
- [ ] Add login and invitation acceptance entry points.
- [ ] Add authenticated Researcher and Team dashboards.
- [ ] Keep public pages usable if the API is temporarily unavailable.

### Phase 5 — GitHub integration and production hardening
- [ ] GitHub App installation and repository linking.
- [ ] Least-privilege permissions and webhook signature verification.
- [ ] Monitoring, backups, restore drills and load/security testing.
- [ ] Production readiness review and privacy documentation.

## 12. Required configuration (names only)

The backend will need deployment-specific values. Never commit actual values.

```dotenv
NODE_ENV=production
PORT=3000
PUBLIC_APP_URL=https://musombi123.github.io
API_PUBLIC_URL=
DATABASE_URL=
SESSION_SECRET=
CSRF_SECRET=
EMAIL_PROVIDER=
EMAIL_FROM=
EMAIL_API_KEY=
OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_REGION=
OBJECT_STORAGE_ACCESS_KEY_ID=
OBJECT_STORAGE_SECRET_ACCESS_KEY=
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_WEBHOOK_SECRET=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
```

Only configure providers that are actually selected. Secrets must be generated and stored in the hosting provider's secret manager. The public frontend may receive only non-secret values such as the API base URL.

## 13. Open deployment decision

The architecture is provider-portable. Before production deployment, select:
- API hosting provider and region;
- managed PostgreSQL provider and backup policy;
- private object storage provider;
- transactional email provider;
- production API domain and DNS/TLS ownership.

Do not bind the application to a paid service or create recurring costs until the owner approves the provider and plan. Local development and CI must remain possible with documented test services.
