# Shamba Hub — Trust, Verification, and Soil Safety

[← Documentation index](index.md) · [Architecture](architecture.md) · [API reference](api-reference.md)

## 1. Why there are two verification gates

Shamba separates **who is operating the account** from **the rights associated with a particular farm**.

1. **Farmer-profile approval** checks that the required farmer profile has been submitted and reviewed by an authorized Shamba administrator. It gates creation of a new farm in the proposed repaired backend.
2. **Farm-rights review** applies to each farm record. It requires a lawful rights basis and a reference that can be reviewed. It gates designated crop, activity, harvest, intelligence and related farm operations until the farm state is verified.

Neither status is an official government title certification, legal determination, land registry search, or substitute for professional advice.

## 2. Farmer profile workflow

### Submission

Authenticated users use POST /api/jumuiya/shamba/farmer. The server validates the JSON payload and stores a pending review record. Required fields:

- farmer_name
- phone
- county
- town
- farming_type

Other profile fields include location, farm_name, experience_years, primary_crops, livestock, soil_type, water_source, irrigation_available, primary_goal, target_market and description.

Experience must be a whole number from 0 through 80. Text fields have maximum lengths; crop and livestock fields accept a list or comma-separated text with bounds and case-insensitive deduplication.

The backend controls review fields. Submitting/resubmitting the profile clears the previous review details and returns the profile to pending. The client must not write verification_status, reviewer ID, or reviewed timestamp.

### Review

Only authenticated users in the backend-recognized admin or super_admin role may access:

- GET /api/jumuiya/shamba/farmer/verification-queue
- POST /api/jumuiya/shamba/farmer/{farmer_id}/review

Allowed decisions: approved, rejected, more_info. A reason note is required for rejected or more_info. Approval is refused if required identity/profile fields are missing. Review actions should be logged and attributable to the authenticated reviewer.

### Legacy records

An older record that has no verification_status is not automatically approved. The repaired service returns a conservative not_submitted state. Do not run an unattended bulk migration that sets existing farmers to approved.

## 3. Farm-rights review workflow

### Supported evidence basis

Supported lawful bases:

- registered_owner
- leaseholder
- authorized_manager
- community_land_user
- other_lawful_interest

Supported reference types:

- land_register_reference
- lease_reference
- authority_letter_reference
- community_land_resolution_reference
- other_reference

The farm owner submits a reference and must provide rights_basis, evidence_type, evidence_reference, declaration=true, and privacy_consent=true.

A reference is not an upload of a national ID or passport. The current handler explicitly rejects national ID/passport-number patterns, bounds reference length, rejects duplicate references associated with another pending/verified farm, and prevents duplicate pending cases for the same farm. It stores a hash of the reference for matching and the reference text for reviewer handling; treat that reference as sensitive information.

### Status transitions

| Status | Meaning | Next step |
|---|---|---|
| not_submitted | No current review submission is recorded. | Submit an eligible rights reference. |
| pending | Waiting for an admin reviewer. | Wait for a decision; the API prevents duplicate pending submissions. |
| more_info | Reviewer needs additional information. | Read review notes and submit an updated reference through the supported flow. |
| verified | Platform review marked the rights case verified. | Rights-gated operations may proceed, subject to authorization and input requirements. |
| rejected | Platform reviewer did not verify the case. | Read reviewer notes and follow the documented resubmission/support path. |

The admin endpoint accepts verified, rejected and more_info decisions. A decision must carry a review note. Reviewers should record what they checked and avoid language implying government certification.

### Protected farm operations

The backend's require_farm_rights_review guard resolves the farm for the authenticated user and requires the effective farm-rights status verified. In the inspected route set, the guard is used for crops, activities, harvests, insights/refresh, recommendations, alerts/read state, weather, market, crop analysis, AI context and command center operations.

A frontend disabled button is not a security boundary. The backend guard remains authoritative.

## 4. Trust Centre API map

The nested trust blueprint is registered under /api/jumuiya/shamba/trust.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /overview | Signed-in owner | Returns the authenticated user's farm-rights overview and counts. |
| POST | /farms/{farm_id}/verification | Signed-in farm owner | Submit farm-rights reference. |
| GET | /verification-queue | Admin / super admin | List pending or more-info rights cases. |
| POST | /farms/{farm_id}/verification/review | Admin / super admin | Review a farm-rights case. |
| POST | /farms/{farm_id}/soil-scan | Signed-in user with verified farm rights | Run the guarded soil-photo preflight/triage path. |
| GET | /soil-services | Signed-in user | Return service descriptions and quote-first policy. |
| POST | /farms/{farm_id}/soil-service-requests | Signed-in user with verified farm rights | Submit a laboratory-test or agronomy quote request. |
| GET | /soil-service-requests | Admin / super admin | List outstanding soil-service leads. |
| POST | /safety-reports | Signed-in user | Report a suspicious marketplace listing. |
| GET | /safety-reports | Admin / super admin | Retrieve the moderation queue. |
| POST | /safety-reports/{report_id}/review | Admin / super admin | Action, dismiss, or request more details for a safety report. |

Payload examples and response notes are in the [API reference](api-reference.md).

## 5. Soil Lens — strict limitation language

The current endpoint is a **photo-quality and safe-next-step triage flow**, not a scientific soil scanner.

The handler:
- accepts JPEG, PNG and WebP only;
- limits the uploaded file to 5 MB;
- requires non-empty observations and explicit analysis consent;
- checks that the declared MIME type matches the image content;
- performs deterministic image preflight checks, including size/dimension/detail checks;
- rejects repeated completed scans of an identical image hash;
- does not persist raw image bytes in the scan record;
- calls an available configured image-capable/AI adapter only if preflight allows intake and required capability is configured; and
- returns analysis-mode and AI-called metadata so the UI can distinguish a model response from metadata-only triage.

The response explicitly warns that a photo cannot reliably determine pH, NPK, salinity, contaminants, or underground soil layers. Never convert a photo result to numeric lab measurements or generate a precise fertilizer dose from an image alone. Where measured values are needed, direct the user to representative sampling and a qualified laboratory.

A soil-service lead is **not** a booked appointment, confirmed partner, completed lab result, or payment. The API returns a quote-first state, records consent to be contacted, and does not collect payment through these endpoints. Partner availability, price and commission/referral arrangements must be disclosed before a booking or payment.

## 6. Marketplace safety and moderation

A signed-in user can submit a report with listing_id, category and description.

Allowed categories:
- suspected_scam
- fake_or_misrepresented_product
- off_platform_payment_pressure
- land_or_farm_misrepresentation
- duplicate_or_stolen_media
- unsafe_agricultural_claim
- other

A user cannot open multiple reports against the same listing while their report remains open. The report is queued for human review. Valid moderation decisions are actioned, dismissed, or needs_more_info; reviewers must provide a note. If actioned is selected, the backend attempts to find and suspend the referenced active listing and mark it under review. If no active listing matches, the operation returns an error instead of falsely claiming that the listing was suspended.

The UI should show the actual API result and should not promise instant investigation, reimbursement, law-enforcement intervention, or automatic proof of fraud.

## 7. Privacy and handling rules

- Collect only necessary profile and farm-operation data.
- Do not ask for passwords, access tokens, payment PINs, or national ID/passport numbers in profile descriptions, evidence references, safety reports or free-text notes.
- Preserve consent flags for soil-photo processing and quote-request contact.
- Avoid logging evidence-reference text, image bytes, phone numbers, or full safety-report content where a redacted status/ID is sufficient.
- Only return records belonging to the authenticated user unless the route is explicitly an admin queue with backend role enforcement.
- Keep all admin actions attributable to an authenticated reviewer.
- Restrict database access to backend services. The browser should use the existing authenticated API service, not MongoDB credentials.
- For any future file/evidence upload, add size/type checks, access controls, retention rules, and consent/disclosure copy before enabling it.

## 8. Incident response checklist

If a rights review, soil scan or safety report behaves unexpectedly:

1. Record route, timestamp, sanitized request ID, response status and API error code.
2. Verify authenticated user and role context from the server-side auth layer; do not trust browser role flags.
3. Check the record's owner ID and status transition using existing operational access procedures.
4. Confirm no operation escaped the verified farm-rights guard.
5. If an active harmful listing was reported, verify its actual marketplace status instead of trusting the UI toast alone.
6. Preserve only the minimum evidence necessary and avoid copying sensitive reference content into general issue trackers.
7. Correct the defect with a regression test before redeploying.
