# Shamba Hub — REST API Reference

[← Documentation index](index.md) · [Architecture](architecture.md) · [Trust and safety](trust-and-safety.md)

This reference describes routes inspected in the Shamba backend source branch associated with the farmer-verification repair. Verify the deployed backend revision before depending on a newer route or status in production.

## 1. Base URL and request conventions

- **Jumuiya API root:** /api/jumuiya
- **Shamba base:** /api/jumuiya/shamba
- **Trust/safety base:** /api/jumuiya/shamba/trust
- **Shared marketplace base:** /api/jumuiya/marketplace

The frontend API client builds its backend origin from VITE_API_URL, VITE_REVELACODE_URL, or VITE_BACKEND_URL. It normalizes the configured origin and applies the Jumuiya API root. Keep the host environment-specific.

JSON requests should use Content-Type: application/json and the current authenticated session/token mechanism already implemented by the application's auth helper. Examples use Authorization: Bearer <ACCESS_TOKEN> as the conventional header shape; use the actual token flow configured for the deployment and never put real tokens in documentation.

Route placeholders use braces here for readability. Replace them with URL-encoded values, not literal braces.

### Response conventions

Successful Shamba routes use the shared Jumuiya success/created response helpers. Clients should consume the returned data through the existing API helper rather than assuming every route returns an identical top-level object.

Controlled backend errors use the common structure:

    {
      "success": false,
      "error": {
        "code": "machine_readable_code",
        "message": "Human-readable explanation",
        "details": {}
      }
    }

The details field is optional. HTTP status is authoritative: typical cases include 400 invalid input/ID, 401 missing or invalid authentication, 403 role or workflow gate, 404 missing/unowned resource, 409 duplicate/conflicting submission, 413 oversized image, 415 unsupported image/MIME, and 422 schema/consent validation.

## 2. Authentication and access matrix

| Access type | Meaning |
|---|---|
| Public health | Health probe only; no private user records. |
| Signed-in owner | Backend derives the user identity and scopes records to that user. |
| Admin / super admin | Backend authentication plus role enforcement for review/moderation queues and decisions. |
| Verified-farm operation | Signed-in user owns the farm and its effective farm-rights status is verified, in addition to other route rules. |

Front-end visibility, disabled buttons, or a role field supplied by a browser are not security controls. Always keep backend decorators, owner selectors and guards enabled.

## 3. Health and farmer profile

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | /api/jumuiya/shamba/health | Public health | Shamba service status/version. |
| GET | /api/jumuiya/shamba/farmer | Signed-in owner | Fetch the current user's farmer profile or no-profile state. |
| POST | /api/jumuiya/shamba/farmer | Signed-in owner | Create/resubmit farmer profile for review. |
| GET | /api/jumuiya/shamba/farmer/verification-queue | Admin / super admin | Pending/more-info farmer profiles. |
| POST | /api/jumuiya/shamba/farmer/{farmer_id}/review | Admin / super admin | Approve, reject, or request more information. |

### Submit farmer profile

Required fields: farmer_name, phone, county, town, farming_type.

Optional fields include location, farm_name, experience_years, primary_crops, livestock, soil_type, water_source, irrigation_available, primary_goal, target_market, and description. Numeric/profile limits are validated by the backend schema.

Example:

    {
      "farmer_name": "Amina Wanjiku",
      "phone": "+254700000001",
      "county": "Mombasa",
      "town": "Likoni",
      "location": "Example village",
      "farming_type": "mixed",
      "experience_years": 4,
      "primary_crops": ["maize", "beans"],
      "livestock": ["poultry"],
      "soil_type": "sandy loam",
      "water_source": "rainfall",
      "irrigation_available": false,
      "primary_goal": "food_and_income",
      "target_market": "local market",
      "description": "Example farm operation"
    }

The successful submit operation places the profile in pending review. Approval status, reviewer identity and review timestamps are server-owned. Experience must be a whole number between 0 and 80. Text/list values have size limits; crop/livestock inputs may be arrays or comma-separated strings.

### Review farmer profile

Example decision body:

    {
      "decision": "more_info",
      "review_notes": "Please confirm the town and the preferred farming type."
    }

Allowed decision values: approved, rejected, more_info. A note is required for rejected and more_info. Approval is refused when core required fields are incomplete. Resubmission returns the profile to pending and clears the previous reviewer decision.

## 4. Farm records and location

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | /api/jumuiya/shamba/farms | Signed-in owner | List the user's non-deleted farms. |
| POST | /api/jumuiya/shamba/farms | Signed-in owner + approved farmer profile | Create a farm. |
| GET | /api/jumuiya/shamba/farms/{farm_id} | Signed-in owner | Read one owned farm. |
| PUT | /api/jumuiya/shamba/farms/{farm_id} | Signed-in owner | Update the owned farm. |
| DELETE | /api/jumuiya/shamba/farms/{farm_id} | Signed-in owner | Soft-delete/remove owned farm per service behavior. |
| PUT | /api/jumuiya/shamba/farms/{farm_id}/location | Signed-in owner | Save GPS/location metadata. |

The farmer-profile gate on POST /farms is part of the proposed backend repair. Do not remove the server-side gate even if the frontend disables the button.

Farm create/update fields in the current schema:
- Required: name.
- Optional: county, town, location, size, size_unit, soil_type, irrigation, description.
- Size must be non-negative when supplied; irrigation is normalized to a boolean.

Example create body:

    {
      "name": "Likoni Demonstration Farm",
      "county": "Mombasa",
      "town": "Likoni",
      "location": "Example area",
      "size": 2.5,
      "size_unit": "acres",
      "soil_type": "sandy loam",
      "irrigation": true,
      "description": "Seasonal mixed crop farm"
    }

Example location body:

    {
      "latitude": -4.08,
      "longitude": 39.66,
      "accuracy": 12.5,
      "source": "browser_gps",
      "county": "Mombasa",
      "town": "Likoni",
      "location": "Example area"
    }

Use real browser/device coordinates only after location permission. Keep location accuracy/source visible where possible; never infer legal ownership from a coordinate.

## 5. Crops, activities and harvests

These routes require authentication, an owned farm and the farm-rights review guard (effective legal_verification_status must be verified).

| Method | Path | Purpose |
|---|---|---|
| GET | /api/jumuiya/shamba/farms/{farm_id}/crops | List crops; supports the current optional status filter. |
| POST | /api/jumuiya/shamba/farms/{farm_id}/crops | Add a crop. |
| GET | /api/jumuiya/shamba/farms/{farm_id}/activities | List activities. |
| POST | /api/jumuiya/shamba/farms/{farm_id}/activities | Add an activity. |
| GET | /api/jumuiya/shamba/farms/{farm_id}/harvests | List harvests. |
| POST | /api/jumuiya/shamba/farms/{farm_id}/harvests | Add a harvest. |
| GET | /api/jumuiya/shamba/farms/{farm_id}/crops/{crop_id}/analysis | Crop intelligence analysis. |

### Crop body

Required: name. Optional: variety, season, area, area_unit, planting_date, expected_harvest_date, status and notes. Numeric area is non-negative; date fields are accepted as bounded text and should be submitted in an unambiguous ISO-style format.

    {
      "name": "Maize",
      "variety": "Hybrid",
      "season": "short rains",
      "area": 1.25,
      "area_unit": "acres",
      "planting_date": "2026-10-01",
      "expected_harvest_date": "2027-01-20",
      "status": "growing",
      "notes": "Example crop record"
    }

### Activity body

Required: type. Optional: description, cost, currency, activity_date. Currency defaults to KES when omitted in the schema.

    {
      "type": "weeding",
      "description": "First field weeding",
      "cost": 1200,
      "currency": "KES",
      "activity_date": "2026-10-21"
    }

### Harvest body

Required: crop_name and quantity. Optional: crop_id, unit, quality, harvest_date, notes. Unit defaults to kg.

    {
      "crop_id": null,
      "crop_name": "Maize",
      "quantity": 350,
      "unit": "kg",
      "quality": "graded",
      "harvest_date": "2027-01-20",
      "notes": "Example harvest"
    }

## 6. Intelligence, recommendations, alerts, weather and market

These farm operations require authentication and reviewed farm rights.

| Method | Path | Purpose |
|---|---|---|
| GET | /api/jumuiya/shamba/farms/{farm_id}/command-center | Farm command-center payload. |
| GET | /api/jumuiya/shamba/farms/{farm_id}/insights | Generate/read current insight snapshot. |
| POST | /api/jumuiya/shamba/farms/{farm_id}/insights/refresh | Explicitly refresh farm intelligence. |
| GET | /api/jumuiya/shamba/farms/{farm_id}/recommendations | List recommendations; optional category, priority and crop_id filters. |
| POST | /api/jumuiya/shamba/farms/{farm_id}/recommendations | Create a manual recommendation. |
| GET | /api/jumuiya/shamba/farms/{farm_id}/alerts | List alerts; supports the current unread/severity filters. |
| GET | /api/jumuiya/shamba/farms/{farm_id}/alerts/summary | Alert snapshot and unread count. |
| PUT | /api/jumuiya/shamba/farms/{farm_id}/alerts/{alert_id}/read | Mark an alert as read. |
| GET | /api/jumuiya/shamba/farms/{farm_id}/weather | Retrieve stored/current available weather snapshot. |
| GET | /api/jumuiya/shamba/farms/{farm_id}/market | Retrieve available farm market snapshot. |
| GET | /api/jumuiya/shamba/farms/{farm_id}/ai-context | Structured context for RevelaAI; does not itself generate an answer. |
| GET | /api/jumuiya/shamba/dashboard | Main Shamba dashboard bootstrap payload. |

### Recommendation body

Required: title and recommendation. Optional: category, priority, confidence, crop_id. Confidence is bounded from 0 to 100.

    {
      "title": "Review irrigation",
      "recommendation": "Inspect the irrigation system and document any leaks.",
      "category": "water",
      "priority": "high",
      "confidence": 80,
      "crop_id": null
    }

Weather/market routes return what the service can currently provide. Their existence is not a guarantee of live upstream data. The UI must show unavailable/provider-not-configured states honestly.

## 7. Trust, rights, soil and safety endpoints

Base path: /api/jumuiya/shamba/trust

| Method | Relative path | Access | Purpose |
|---|---|---|---|
| GET | /overview | Signed-in owner | Farm-rights overview and counts. |
| POST | /farms/{farm_id}/verification | Signed-in farm owner | Submit farm-rights reference. |
| GET | /verification-queue | Admin / super admin | Pending/more-info rights queue. |
| POST | /farms/{farm_id}/verification/review | Admin / super admin | Save rights-review decision. |
| POST | /farms/{farm_id}/soil-scan | Signed-in user with verified farm rights | Run soil-photo preflight/triage. |
| GET | /soil-services | Signed-in user | Return soil-service types/pricing policy. |
| POST | /farms/{farm_id}/soil-service-requests | Signed-in user with verified farm rights | Request a lab-test or agronomy quote. |
| GET | /soil-service-requests | Admin / super admin | List outstanding quote leads. |
| POST | /safety-reports | Signed-in user | Submit marketplace safety report. |
| GET | /safety-reports | Admin / super admin | Retrieve report moderation queue. |
| POST | /safety-reports/{report_id}/review | Admin / super admin | Action/dismiss/request information. |

Full payload and limitation detail lives in [Trust, verification and soil safety](trust-and-safety.md).

### Farm-rights submission

    {
      "rights_basis": "leaseholder",
      "evidence_type": "lease_reference",
      "evidence_reference": "LEASE-REF-2026-001",
      "declaration": true,
      "privacy_consent": true
    }

Supported decision values are verified, rejected and more_info. Notes are required by the review handler. The flow explicitly rejects national ID/passport-number patterns and prevents duplicate pending cases.

### Soil scan

The endpoint consumes multipart/form-data, not JSON. Fields:
- image: JPEG, PNG or WebP, at most 5 MB.
- observations: required descriptive text.
- analysis_consent: explicit true/1/yes/on value.

Image preflight can request a retake. AI-aware interpretation depends on configured provider capability. The response contains status/mode/limitation metadata; this is not a measured soil chemistry report.

### Safety report

    {
      "listing_id": "listing-id-from-marketplace",
      "category": "suspected_scam",
      "description": "Describe the specific suspicious activity."
    }

Allowed categories are suspected_scam, fake_or_misrepresented_product, off_platform_payment_pressure, land_or_farm_misrepresentation, duplicate_or_stolen_media, unsafe_agricultural_claim, and other.

Admin decision values are actioned, dismissed and needs_more_info; a note is required. Actioned attempts to suspend the referenced active listing. If the backend cannot match an active listing, the report action returns an error rather than falsely confirming suspension.

## 8. Shared Marketplace integration

The Shamba market UI reads the shared listing endpoint:

- GET /api/jumuiya/marketplace/listings?hub=shamba
- The frontend currently filters out records with status deleted from the returned list.

Listing create/delete methods exist in the shared API service, but the Shamba market screen described here is a browse/filter surface. Treat listing ownership, moderation, payments, orders, delivery, buyer messaging and transaction settlement as their own verified contracts; do not infer those from a card or nav item.

## 9. Security notes

- Use the existing API client and authenticated request path.
- Let server-side identity determine ownership.
- Keep admin role checks on every queue and review endpoint.
- Never store or send tokens in query parameters.
- Validate all inputs server-side; browser validation is only usability assistance.
- Do not log sensitive evidence references or raw image bytes.
- Do not weaken the rights gate to avoid a 403 response; resolve the correct review state.
