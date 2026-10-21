# Shamba Hub — Architecture and User Journeys

[← Documentation index](index.md) · [API reference](api-reference.md) · [Trust and safety](trust-and-safety.md)

## 1. Product objective

Shamba is the agriculture operating area of Jumuiya. It helps farmers maintain operational records and make better-informed decisions while keeping identity review, farm-rights review, advisory intelligence, shared marketplace features and external service arrangements separate.

The application is not a land registry, laboratory, weather station, payment processor or substitute for qualified agronomy/legal advice. Every integration must state accurately what was measured, inferred, reviewed, unavailable or provider-dependent.

## 2. System context

    React Shamba Hub
      ├── Overview / command centre
      ├── My Farms + farmer profile
      ├── Crops / harvests / activities
      ├── Weather / market / recommendations / alerts
      ├── Shared marketplace listing view (hub=shamba)
      ├── Trust & Safety
      └── Admin review screens
              |
              v
    src/services/jumuiyaApi.jsx
      ├── Existing authenticated request helper
      ├── API paths normalized under /api/jumuiya
      └── No direct database connection
              |
              v
    RevelaCode backend + Jumuiya authentication bridge
      ├── /api/jumuiya/shamba/*
      ├── /api/jumuiya/shamba/trust/*
      └── /api/jumuiya/marketplace/*
              |
              v
    Shared Jumuiya database gateway -> MongoDB
              |
              └── Optional/configured AI and external-data integrations

The backend registers Shamba at **/api/jumuiya/shamba**; the trust blueprint is nested under **/trust**. Marketplace listings are provided by the shared Jumuiya Marketplace API and filtered for Shamba in the frontend. Shamba-specific mutations and trust decisions remain server-side.

## 3. Main source files

| Responsibility | Source |
|---|---|
| Navigation shell and section registry | [ShambaHub.jsx](https://github.com/musombi123/RevelaCode-Frontend/blob/fix/shamba-farmer-profile-verification/src/Dashboard/ShambaHub.jsx) |
| Farmer profile and farm management UI | [ShambaFarmsDashboard.jsx](https://github.com/musombi123/RevelaCode-Frontend/blob/fix/shamba-farmer-profile-verification/src/Dashboard/ShambaFarmsDashboard.jsx) |
| Overview and farm intelligence UI | [ShambaDashboard.jsx](https://github.com/musombi123/RevelaCode-Frontend/blob/fix/shamba-farmer-profile-verification/src/Dashboard/ShambaDashboard.jsx) |
| Trust Centre | [ShambaTrustDashboard.jsx](https://github.com/musombi123/RevelaCode-Frontend/blob/fix/shamba-farmer-profile-verification/src/Dashboard/ShambaTrustDashboard.jsx) |
| Farmer verification admin queue | [ShambaFarmerVerificationDashboard.jsx](https://github.com/musombi123/RevelaCode-Frontend/blob/fix/shamba-farmer-profile-verification/src/Dashboard/ShambaFarmerVerificationDashboard.jsx) |
| API client | [jumuiyaApi.jsx](https://github.com/musombi123/RevelaCode-Frontend/blob/fix/shamba-farmer-profile-verification/src/services/jumuiyaApi.jsx) |
| Main REST routes | [routes.py](https://github.com/musombi123/RevelaCode-Backend/blob/fix/shamba-farmer-profile-verification/backend/jumuiya/shamba/routes.py) |
| Rights, soil and safety routes | [trust_routes.py](https://github.com/musombi123/RevelaCode-Backend/blob/fix/shamba-farmer-profile-verification/backend/jumuiya/shamba/trust_routes.py) |
| Validation schemas | [schemas.py](https://github.com/musombi123/RevelaCode-Backend/blob/fix/shamba-farmer-profile-verification/backend/jumuiya/shamba/schemas.py) |
| Document builders | [models.py](https://github.com/musombi123/RevelaCode-Backend/blob/fix/shamba-farmer-profile-verification/backend/jumuiya/shamba/models.py) |
| Domain services | [services.py](https://github.com/musombi123/RevelaCode-Backend/blob/fix/shamba-farmer-profile-verification/backend/jumuiya/shamba/services.py) |

These source URLs point to the proposed application branch associated with the repair PRs. Verify PR/deployment status before treating the branch as production code.

## 4. Frontend navigation areas

| Section | Purpose and boundaries |
|---|---|
| Overview | Welcome, top-level metrics, first-farm state, recent activity and intelligence summary. |
| My Farms | Farmer-profile submission/review state, farm creation/management, location and farm-rights status. |
| Crops | Crop records and crop-specific analysis, subject to the farm-rights guard. |
| Market | Reads shared marketplace listings filtered with hub=shamba. A browse screen does not itself prove listing creation, order settlement or protected payments are active. |
| Weather | Farm-associated weather snapshot and planning UI. Provider integration determines whether data is live. |
| Harvests | Harvest crop, quantity, unit, quality, date and notes; backend route is rights-gated. |
| Farm Inputs | Navigation entry; confirm the active implementation and backing APIs in the deployed revision before promising a complete procurement workflow. |
| Buyers | Navigation entry; do not infer a completed buyer transaction system from the section name alone. |
| Orders | Navigation entry; do not infer escrow, settlement, refunds or fulfillment without an implemented and tested API workflow. |
| Activities | Records farm operations and costs, subject to reviewed farm rights. |
| Trust & Safety | Farm-rights references/status, soil-photo preflight and quote-request flows where surfaced, and safety reports. |
| Farmer verification | Administrator-only farmer-profile review queue. |

The navigation registry is in ShambaHub.jsx. Hiding the admin menu is a UI concern only; the backend must enforce authorization independently.

## 5. Primary data entities

| Collection | Responsibility |
|---|---|
| jumuiya_farmers | Farmer profile associated with an authenticated user. |
| jumuiya_farms | Farm identity/location/size/soil/irrigation metadata and rights-review state. |
| jumuiya_crops | Crop records associated with a farmer and farm. |
| jumuiya_farm_activities | Activity type, description, costs, currency and date. |
| jumuiya_harvests | Crop, quantity, unit, quality, date and notes. |
| jumuiya_farm_insights | Persisted insight snapshots. |
| jumuiya_farm_recommendations | Manual or generated recommendation records. |
| jumuiya_farm_alerts | Farm alerts and read state. |
| jumuiya_farm_verification_cases | Rights references and human review decisions. |
| jumuiya_soil_scan_records | Photo preflight/triage metadata and scan status. |
| jumuiya_soil_service_leads | Quote requests for laboratory tests or agronomy consultations. |
| jumuiya_shamba_safety_reports | User-submitted safety reports and moderation decisions. |

Marketplace listings use the shared marketplace service/collection, not a second Shamba-only listing store.

### Ownership and identifiers

- The backend derives the user ID from the authenticated session/auth bridge.
- Farm service queries are scoped by owner_user_id and ignore soft-deleted records.
- Mongo ObjectIds are serialized as strings at the API boundary.
- Never trust a request-body owner ID.
- Farmer documents retain owner_user_id as canonical and user_id as a compatibility alias.

## 6. Farmer-profile review versus farm-rights review

These are separate checkpoints.

### Farmer profile

Required profile fields: farmer_name, phone, county, town, and farming_type. Other fields include location, experience, main crops, livestock, soil/water data, irrigation, primary goal, target market and a description.

Experience is a whole number from 0 to 80. Crop/livestock inputs accept a list or comma-separated text, with bounds and case-insensitive deduplication.

Profile statuses in the proposed repair:
- **not_submitted:** no explicit review state is available.
- **pending:** submitted; waiting for authorized admin review.
- **approved:** can proceed to farm creation.
- **rejected:** admin note should explain correction needed.
- **more_info:** admin requested additional information.

Every resubmission returns to pending. The client cannot approve itself.

### Farm-rights case

Every farm starts with legal_verification_status=not_submitted. The farmer profile does not prove rights to every parcel. Rights review accepts a lawful basis and a reference type such as land-register, lease, authority letter or community-land resolution, plus a declaration and processing consent.

Common states are not_submitted, pending, verified, rejected, and more_info. A farm in verified state can use operations protected by the farm-rights middleware, subject to the rest of authentication and validation.

## 7. Intelligence boundaries

Farm intelligence uses available farmer/farm/crop/activity/harvest inputs and stored weather/market snapshots plus deterministic helpers in farm_insights.py. The command-center and AI-context endpoints return structured context; they do not guarantee that every external provider is live or every model is configured.

For every displayed result distinguish:
- **Observed:** user-supplied or retrieved record.
- **Calculated:** result computed from saved inputs.
- **AI-assisted:** output generated by a configured AI adapter.
- **Unavailable:** provider result missing or integration disabled.
- **Human-reviewed:** explicit reviewer decision or qualified partner action.

Never invent yield, soil chemistry, current weather, live market prices, legal verification or confidence values to fill an empty UI card.

## 8. Extension policy

1. Use the existing useJumuiyaApi client and authenticated request helper.
2. Put validation in Shamba schemas and domain logic in Shamba services.
3. Keep ownership filters and role checks server-side.
4. Reuse shared Marketplace rather than creating a duplicate listing API.
5. Add regression tests for new routes, data contracts and access-control decisions.
6. Update the API reference and safety runbook whenever a route, status or schema changes.
7. Keep PRs scoped; modify another hub only if a shared contract dependency actually requires it.
