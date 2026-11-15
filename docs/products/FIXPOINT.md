# FixPoint — product and portfolio integration

FixPoint is the commercial packaging of the existing RevelaAI Portable Field Engine, not a separate diagnostic engine.

**Promise:** Diagnose with evidence. Repair with control.  
**Primary customer:** independent computer repair technicians and small IT service providers.  
**Execution model:** deterministic, model-free tools. FixPoint does not require Ollama, a local model, a cloud model, model downloads or inference credentials.

## Product editions

- **FixPoint Field:** offline USB diagnostics, evidence capture and controlled local workflows.
- **FixPoint Desktop:** operator workspace for scan profiles, findings, approvals, repair transactions and customer reports.
- **FixPoint Command:** later optional team/fleet reporting service. It is not an MVP dependency.

All editions reuse the authoritative Go engine, Guardian policies, versioned finding contract and existing evidence/repair workflows in musombi123/RevelaAI. Do not copy engine source into this static website repository.

## MVP scope

- Explicitly authorized, read-only system, storage, reliability, network and installed-software inventory.
- Deterministic rules with stable rule IDs, evidence references, severity, confidence and limitations.
- Signed offline vulnerability intelligence using the existing verifier and its documented exact-match limitations.
- Human-reviewed repair proposals; only narrowly allowlisted repairs with preconditions, backups, approval, audit trail, rollback and postcondition verification.
- Local customer/device case history and customer-ready report export.
- Offline operation for all core diagnostics.

## Commercial validation

Initial pricing hypotheses (not committed): Free basic diagnostics; Solo KES 1,499/month; Shop KES 4,999/month; MSP negotiated. Validate willingness-to-pay with technician pilots before publishing prices.

## Safety and privacy

No silent autorun, ambient network scanning, arbitrary command execution, credential harvesting, private-file upload, security-control disabling or automatic removal of unknown software. Local evidence remains local unless an operator explicitly exports or submits a structured finding through the existing authenticated workflow.

## Source of truth

- Engine and tests: musombi123/RevelaAI/portable/native/ and the existing portable companion.
- Existing product/release surface: fieldkit.html, diagnostics.html, .github/workflows/pages.yml.
- Full engineering contract: musombi123/RevelaAI/portable/docs/FIXPOINT_MVP.md.

This page documents the product direction; it does not claim that unimplemented profiles, desktop UI, repair adapters or fleet services are already available.
