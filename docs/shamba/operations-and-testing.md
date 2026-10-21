# Shamba Hub — Operations, Testing, and Release Runbook

[← Documentation index](index.md) · [Architecture](architecture.md) · [API reference](api-reference.md) · [Trust & safety](trust-and-safety.md)

## 1. Environments and configuration

Shamba uses the existing RevelaCode backend service and Jumuiya API client. The frontend builds its API root from these Vite environment values in order:

- VITE_API_URL
- VITE_REVELACODE_URL
- VITE_BACKEND_URL

The client normalizes the configured backend base, strips trailing /api or /api/jumuiya when supplied, and uses /api/jumuiya as the common root. Example endpoint: https://<backend-host>/api/jumuiya/shamba/health.

Keep production URLs in deployment configuration, not hard-coded in Shamba components. Do not commit API keys, JWT secrets, database URIs or model-provider credentials into the documentation repository.

Backend startup registers the existing Jumuiya platform and shared error handlers. Shamba is mounted at /api/jumuiya/shamba, with the trust blueprint nested under /trust. Mongo collection/index initialization follows the current shared Jumuiya database initialization. Use the supported backend service startup process; do not build a parallel Shamba application or database connection.

## 2. Pre-merge and release order

Farmer-profile approval is a new gate in the proposed repair. Use this release sequence:

1. Review and merge the backend verification changes first.
2. Deploy the backend and run smoke tests against the deployed API.
3. Review the frontend diff and confirm it uses the existing authenticated useJumuiyaApi service and expected API root.
4. Resolve the known Netlify Deploy Preview failure for redirect/header/pages-changed checks before promoting the frontend.
5. Merge/deploy the frontend after its GitHub Actions production build and auth tests pass.
6. Test signed-in farmer and administrator journeys against the deployed services.
7. Keep rollback commit/release references and inspect server logs during rollout.

The repair is proposed in [Backend PR #20](https://github.com/musombi123/RevelaCode-Backend/pull/20) and [Frontend PR #63](https://github.com/musombi123/RevelaCode-Frontend/pull/63). These were draft PRs when this document was prepared. Passing GitHub Actions builds is not the same as deploying the feature to production; the Netlify auxiliary preview checks were failing and their detailed diagnostics were not accessible to the authoring session.

## 3. Automated checks

### Backend Shamba regression tests

The backend repair adds tests/test_shamba_farmer_verification.py and wires it into the existing backend validation workflow. The targeted cases cover:
- required farmer identity/profile fields;
- normalization of crop lists and boolean fields;
- rejection of invalid experience and boolean values;
- required notes for reject/request-more-information decisions;
- initial farmer-profile review state;
- initial farm-rights state for new farms;
- blocking farm creation when no approved farmer exists; and
- allowing creation for an approved profile while preserving the separate farm-rights state.

The workflow also compiles Shamba model, schema, service, primary-route and trust-route modules, and continues running existing Elimu/account-document validation tests.

### Frontend checks

The frontend GitHub Actions workflow runs npm run test:auth and npm run build. On the reviewed Shamba source branch, these checks passed after adding the farmer-verification and Trust Centre screens. Rerun these checks after subsequent changes.

Netlify Deploy Preview's additional redirect/header/pages-changed checks have been failing on the proposed branch, so investigate the linked Netlify deploy diagnostics before claiming that the preview is healthy.

## 4. Manual smoke-test matrix

Run these in staging or a safe deployment with a test account and no production user data.

| ID | Actor | Action | Expected result |
|---|---|---|---|
| S-01 | Anonymous | GET Shamba health | Health payload succeeds without exposing private user data. |
| S-02 | Signed-in farmer | GET own farmer profile | Returns own profile or a no-profile/null state. |
| S-03 | Signed-in farmer | Submit profile missing a required field | Validation error; profile is not approved. |
| S-04 | Signed-in farmer | Submit a valid farmer profile | Profile is saved as pending review. |
| S-05 | Regular user | Read farmer-review queue | Denied by backend role authorization. |
| S-06 | Admin | Read farmer-review queue | Only pending/more-info profiles are returned, within the queue limit. |
| S-07 | Admin | Approve complete profile | Server persists approved state, reviewer and review timestamp. |
| S-08 | Admin | Reject/request-more-info without note | Request is rejected by validation. |
| S-09 | Farmer with pending/rejected profile | Create farm directly through API | Fails with a verification-required response; no farm record is inserted. |
| S-10 | Farmer with approved profile | Create farm | Succeeds; new farm rights state remains not_submitted/pending-verification. |
| S-11 | Farm owner | Submit invalid rights reference or omit declaration/consent | Validation error and no new case. |
| S-12 | Farm owner | Submit a valid rights reference | Review case created as pending; farm state updates to pending. |
| S-13 | Farmer | Read crops/activities/harvest/insight routes on an unverified farm | Backend denies operation with a farm-verification-required error. |
| S-14 | Admin | Review rights case with note | Allowed decision is saved and attributed to the authenticated reviewer. |
| S-15 | Farmer | Submit unsupported or oversized soil photo | Correct unsupported-type/too-large error; no fabricated analysis response. |
| S-16 | Farmer | Submit well-formed, consented soil photo on a verified farm | Receives triage/analysis metadata and clear limitations; raw image bytes are not retained in the scan record. |
| S-17 | Farmer | Report a marketplace safety issue | Report is queued for human review. |
| S-18 | Admin | Action safety report against active listing | Report action succeeds only if an active listing is actually matched and suspended. |
| S-19 | Admin | Action report for missing/inactive listing | API reports no active listing was matched; UI must not claim suspension. |
| S-20 | Signed-in farmer | Browse Shamba market | Shared marketplace endpoint is queried with hub=shamba; deleted records are not shown as active. |
| S-21 | Any user | Request another user's farm by guessed ID | Returns not found/denied; no cross-owner record exposure. |
| S-22 | Mobile user | Complete profile and navigate Trust Centre | Form controls work at narrow widths; errors and success messages remain visible. |

Also verify logs contain no JWTs, secrets, raw uploaded file bytes, or unnecessary evidence-reference/phone data.

## 5. API health and smoke-test examples

Set variables for the real test environment and use a legitimate test token obtained from the normal login process.

    export BACKEND_ORIGIN="https://<your-backend-host>"
    export ACCESS_TOKEN="<test-access-token>"

    # Public service health
    curl -i "$BACKEND_ORIGIN/api/jumuiya/shamba/health"

    # Authenticated farmer profile lookup
    curl -i       -H "Authorization: Bearer $ACCESS_TOKEN"       "$BACKEND_ORIGIN/api/jumuiya/shamba/farmer"

    # Authenticated farm listing
    curl -i       -H "Authorization: Bearer $ACCESS_TOKEN"       "$BACKEND_ORIGIN/api/jumuiya/shamba/farms"

Use a disposable test account. Never paste a production token into an issue, pull-request comment, chat transcript or shell-history screenshot.

## 6. Common failure diagnostics

| Symptom | Check |
|---|---|
| 401 Unauthorized | Login/token persistence, expiration, frontend API base, auth bridge and request headers. |
| 403 on new farm creation | Farmer profile is not explicitly approved; inspect the returned verification_status detail. Do not bypass the gate. |
| 403 on crops/activities/harvests/insights | Farm-rights status is not verified. Open Trust & Safety and inspect the stored status. |
| 403 on review queue | Current backend role is not admin or super_admin; browser role badges cannot grant permission. |
| 409 duplicate pending rights case | A pending case already exists for the farm. Review the existing case instead of creating duplicates. |
| Duplicate reference conflict | Same evidence-reference hash is associated with another pending or verified farm. Check the evidence/support path without copying sensitive values into logs. |
| Soil scan rejects image | Confirm JPEG/PNG/WebP content, declared MIME, max 5 MB, actual image data, dimensions/quality, observations and consent. |
| Soil scan says AI is unavailable | Check provider configuration and response analysis_mode/ai_called. Do not present metadata-only triage as image-aware inference. |
| Safety report cannot action listing | Check that the ID points to a currently active shared marketplace listing and that the user is an authorized moderator. |
| Frontend build passes but Netlify preview fails | Inspect Netlify deploy logs for configuration, redirect/header or deploy-preview evaluation errors. A successful GitHub build does not prove deployment-preview success. |

## 7. Production safeguards

- Maintain MongoDB backups and test restore procedures before schema changes.
- Do not mass-change old profiles or farm records to verified just to clear UI warnings.
- Use UTC timestamps at the backend; format for local display in the client.
- Preserve shared collection names, ownership selectors and indexes. Review shared database helpers before introducing collections.
- Verify admin endpoints remain protected by authentication and role checks even if frontend admin navigation is hidden.
- Limit personally identifiable data in logs and analytics.
- Validate every upload server-side. Browser file filters are not security controls.
- Distinguish placeholder/unavailable weather or market data from live provider readings.
- Treat AI output as advisory. Display context, timestamp and limitations; avoid false certainty for agricultural diagnosis.
- Keep soil-laboratory and agronomy leads quote-first; never report a paid/confirmed appointment unless an independently implemented booking/payment workflow confirms it.

## 8. Change checklist

Before closing a Shamba change, ensure:

- [ ] Request schema and example payloads are documented.
- [ ] Ownership and administrator permissions are enforced on the backend.
- [ ] Status transitions are explicit, auditable and tested.
- [ ] Errors use the common Jumuiya error envelope.
- [ ] The UI reflects server state and does not manufacture success.
- [ ] Targeted regression tests pass.
- [ ] Frontend authentication and build CI pass.
- [ ] Netlify/production preview checks pass, or their failure is explicitly tracked.
- [ ] Relevant pages in docs/shamba are updated.
- [ ] Release order accounts for backend/frontend compatibility.
