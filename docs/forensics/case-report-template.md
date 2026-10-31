# Digital Forensics / Security Assessment Report Template

> Use a separate copy for each engagement. Do not publish real customer data, credentials, personal information, raw logs, or sensitive evidence in the public portfolio.

## 1. Case identification
- Case ID:
- Client / organization:
- Authorizing contact:
- Analyst:
- Engagement start and end:
- Report version:
- Classification / handling label:

## 2. Scope and authorization
- Written authorization reference:
- Systems/devices/data in scope:
- Explicit exclusions:
- Permitted acquisition/testing methods:
- Test window and emergency contact:
- Data-retention and disposal agreement:

## 3. Executive summary

Summarize the question, work performed, key results, business impact, and actions required. Do not include unsupported conclusions.

## 4. Evidence and acquisition log

| Evidence ID | Source description | Collected by | Date/time + zone | SHA-256 | Storage reference |
|---|---|---|---|---|---|
| E-001 |  |  |  |  |  |

Record chain-of-custody transfers separately, including releasing and receiving individuals and timestamps.

## 5. Environment and tools

| Tool / version | Operating system | Configuration | Purpose |
|---|---|---|---|
|  |  |  |  |

Document hardware write blockers, virtual machines, snapshots, network isolation, time source, and relevant environmental limitations.

## 6. Methodology

Describe acquisition, preservation, analysis, validation, and quality-control steps chronologically. Include commands or queries where necessary, with secrets and personal information removed.

## 7. Findings

For each finding, record:
- ID and title:
- Affected asset / evidence:
- Observation:
- Evidence reference:
- Expected vs observed behaviour:
- Reproduction / verification method:
- Impact:
- Confidence and limitations:
- CWE/CVE/CVSS reference, where applicable:
- Recommended remediation:
- Retest status:

## 8. Recovery results (where applicable)

| Output item | Recovery method | Size | SHA-256 | Validation status | Notes |
|---|---|---:|---|---|---|
|  |  |  |  |  |  |

Classify each result as complete, partial, fragment, corrupt, or not verified. Explain missing names, paths, timestamps, or metadata.

## 9. Timeline

| Timestamp | Time zone / basis | Event | Source | Confidence |
|---|---|---|---|---|
|  |  |  |  |  |

Explain clock drift, ambiguous timestamps, and conversion assumptions.

## 10. Limitations and alternative explanations

List missing data, inaccessible records, tool limitations, overwritten/encrypted content, unsupported formats, false-positive possibilities, and alternative explanations.

## 11. Recommendations and retest

Prioritize by business risk. Identify owner, target date, mitigation, and verification criteria. Record retest evidence rather than relying on a verbal statement that the issue is fixed.

## 12. Closure and handover
- Deliverables handed over:
- Evidence returned / retained:
- Retention expiry:
- Secure deletion reference:
- Client acknowledgement:
- Analyst sign-off:
