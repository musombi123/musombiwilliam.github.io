# RevelaAI — ecosystem architecture and operational contract

**Status:** engineering target and source-inspection map, not a certification that every module is production-ready.
**Runtime:** https://revelaai.onrender.com
**Source repositories:** musombi123/RevelaAI, RevelaCode-Frontend, RevelaCode-Backend.

## Product principles

1. The chat workspace is a conversation surface, not a tool catalogue. Users describe outcomes in natural language; the orchestrator selects eligible capabilities behind the scenes.
2. Paid hub entitlements are scoped to the selected hub. A Shamba grant enables only Shamba features included in that plan; it does not grant Biashara, Elimu or administrator access.
3. Free chat remains useful as text conversation. Premium execution, automation and metered operations require server-verified entitlements.
4. The browser never decides whether a tool is allowed. The AI service and central RevelaCode entitlement service are authoritative.
5. Report success only when the executing service returns a verifiable success result.
6. USECT and Core Mesh are internal safety/orchestration infrastructure, not a set of ordinary-user buttons.

## Current verified integration points

| Component | Source | Established by source inspection | Not established by source inspection |
|---|---|---|---|
| Global Brain Adapter | RevelaAI/ai/global_brain_adapter.py | Builds hub, capability, tone, modality and safety context. | It is not a model provider and does not grant tool access. |
| Main chat route | RevelaAI/fastapi_routes/ai.py | The /ai path calls build_global_context, records adapter usage, appends context to history and passes intent and authorization to process_message. | A source call is not proof of deployed runtime health. |
| Orchestrator | RevelaAI/services/ai_service.py | Builds Gemini function declarations and dispatches eligible operations. | Provider credentials, quotas and remote dependencies need live tests. |
| Tool gateway | RevelaAI/ai/gemini_tool_gateway.py | Defines read-only/automation classification, declarations, dispatch and core usage instrumentation. | A catalogue item does not prove a working backing service. |
| USECT-ZERO | RevelaAI/ai/usect_zero_tools.py | A first-class dispatch path exists for selected engineering operations. | Availability and Guardian coverage need runtime tests. |
| Genesis / Core-ONE | RevelaAI/ai/tool_registry.py and core-one/ | Signed registry and proposal/execution interfaces exist. | A proposal is not approval or deployment. |
| Core-TWO / Living Brain | core-two/ and ai/living_brain.py | Observation/coordination and conversation-learning components exist. | Health endpoints do not prove cross-core learning. |
| Core Evolve / Foundry | core_evolve/ and core_foundry/ | Evolution and tool-generation foundations exist. | Autonomous self-modification, hardware fabrication and 50x gains are not established. |

### Request flow

```text
User message + authenticated session + selected hub
                 |
                 v
          /ai request validation
                 |
                 v
        Global Brain Adapter context
                 |
                 v
       entitlement and policy checks
                 |
                 v
       Gemini orchestration and eligible
       read-only or premium function schemas
                 |
                 v
       signed tool gateway / USECT services
                 |
                 v
       verify result, record usage, respond
```

The Global Brain Adapter is wired into the inspected /ai path. Monitor request-level instrumentation and verify deployment. Do not assume a different route uses it without checking that route.

## Plans, hub scope and quota behaviour

Entitlements must be checked server-side for every operation. Never accept a plan name, role, quota or premium flag from browser storage as proof.

- **Free:** basic text conversation; no privileged writes, Genesis/Core operator tools or automation. Only explicitly approved low-risk read-only functions may be offered.
- **Daily limit reached:** continue in text-only mode. The fallback model must receive no function declarations, tool credentials or dispatcher. If the text provider is unavailable, say so; never simulate tool execution.
- **Premium smart AI:** enable only capabilities present in the verified account entitlement.
- **Hub plans:** evaluate user + hub + feature. A Shamba grant can enable eligible Shamba operations inside Shamba conversations; it must not unlock other hubs.
- **Automation and file generation:** separately metered and gated; do not infer access from a generic paid subscription.
- **Entitlement service outage:** fail closed for privileged execution while preserving safe basic text chat.

A frontend free-mode switch or hidden icon is not enforcement. The server must construct a no-tools model request after quota exhaustion.

## Workspace UX contract

The chat surface must not expose a tool icon, tool drawer, catalogue, internal Core names or backend function list. Users request outcomes naturally; the AI presents the right finished artifact, such as a spreadsheet preview, without exposing invocation mechanics.

The direct sidebar Tools launcher and mounted productivity panel have been removed on the work/premium-ai-workspace branch. Server APIs and registered tools are intentionally retained. Review the branch and run frontend tests before merging.

## Humanizer: integrity requirements

A Humanizer should be a user-requested writing editor, not an AI-detector bypass or a promise of 100% AI-free text. No system can guarantee how third-party detectors classify text.

- Preserve meaning, facts, citations and the user's voice.
- Offer explicit edits: clearer, more natural, concise, warmer or more formal.
- Show before/after text and let the user accept or reject changes.
- Never invent experiences, sources, quotations or credentials.
- Explain that style editing cannot certify authorship or detector outcomes.
- Apply the normal workspace privacy and retention rules.

Source inspection did not find a dedicated humanizer route or service. Treat Humanizer as **not implemented**, not as a working tool.

## Living Brain, USECT and Core evolution

- **Global Brain Adapter:** composes per-turn context and resolves hub/capability routing.
- **Living Brain:** maintains approved observations and learning records. Learning must be provenance-aware, consented where personal data is involved and reversible.
- **USECT-ZERO:** guards execution, validates scope and returns evidence-backed results.
- **Genesis / Core-ONE:** proposes tools and signed artifacts. New tools remain quarantined until tests, review and explicit approval.
- **Core-TWO:** coordinates observation and feedback; it cannot grant privileges or override Guardian.
- **Core Evolve:** proposes measurable prompt/workflow/model improvements. Require offline evaluation, regression tests, security review, versioning and rollback. Replace '50x smarter' with published benchmark deltas.
- **Core Foundry:** may generate software/tool prototypes and hardware design documentation. Installation, flashing or actuation requires a separately approved device workflow and physical safety review.
- **Super Admin:** supervises health, approvals, policy exceptions and audit trails; it must not bypass user consent or safety controls.

## Portable companion and device hand-off

The existing USB Field Engine is a local defensive inspection/evidence tool, not a self-replicating AI. It has a Go field engine, local ZERO/ONE/TWO supervisor, Guardian policies and a Python evidence companion. It supports specified offline functions; see the source repository's portable/README.md and docs/USB_FIELD_ENGINE_ARCHITECTURE.md.

Keep the existing source repository. Publish signed, versioned downloads through the existing portfolio/site release workflow; do not duplicate source code into the website repository.

### Safe lifecycle contract

1. The user explicitly installs and authorizes each device. USB, Bluetooth and network transfer must never happen silently.
2. Pair with mutual authentication, short-lived scoped credentials and revocation. Never copy parent bearer tokens or secrets to removable media.
3. Each companion has a signed manifest, software bill of materials, version, integrity hash and update provenance.
4. Offline grace periods are transparent and configurable. At the end of a 30-day offline window, warn in advance and disable only features that genuinely require online validation. Preserve user files, evidence and data.
5. Do not self-delete, wipe a USB, destroy keys or erase user data on a timer. Destructive self-destruction is not an acceptable licence or security control.
6. Reconnection requires explicit approval and re-authentication. The parent may coordinate authorized calls; it cannot silently take over a device.
7. Uninstall and revocation must be explicit, documented and reversible where practical.

## Production acceptance gates

- Unit and integration tests for each core.
- Authenticated end-to-end /ai tests proving adapter context is consumed.
- Tool gateway allow/deny tests, including free tier and exhausted quota.
- Hub-crossing tests proving Shamba grants do not unlock other hubs.
- Signed registry verification and argument-schema validation.
- Guardian-negative tests for unauthorized, destructive and out-of-scope operations.
- Offline Field Engine package tests on each supported OS.
- Companion pairing, revocation and reconnect tests.
- Audit logs with request ID, user scope, hub, feature, tool version, decision and result.
- Recovery/rollback tests for every update or evolution workflow.

Status pages must distinguish **implemented**, **wired**, **tested**, **deployed** and **verified in production**. A single green 'online' indicator is not enough.