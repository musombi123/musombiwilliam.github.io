# Digital Forensics, Reverse Engineering & Defensive Security

This documentation defines a practical professional-development path for digital forensics, data recovery, software reverse engineering, incident response, and authorized security validation.

It is designed to build evidence-led capability—not to imply certification, guarantee that every file can be recovered, or suggest automated scanners can prove every vulnerability.

## Start here

1. [Six-month learning path and course syllabus](learning-path.md)
2. [Languages, tools, libraries, and official documentation](toolchain.md)
3. [Digital evidence and data-recovery playbook](data-recovery.md)
4. [Software and mobile reverse-engineering playbook](reverse-engineering.md)
5. [Authorized vulnerability-validation methodology](vulnerability-validation.md)
6. [Lab safety, evidence handling, and engagement rules](lab-safety.md)
7. [Digital investigation and security assessment report template](case-report-template.md)

## Professional capability model

| Discipline | Core question | Typical output |
|---|---|---|
| Digital forensics | What happened to this device or dataset? | Evidence inventory, timeline, acquisition log, findings |
| Data recovery | What data remains technically recoverable? | Recovered files, integrity manifest, limitations |
| Reverse engineering | How does this program or file behave? | Annotated binary analysis, behaviour report |
| Incident response | What happened, when, and what is affected? | Incident timeline, indicators, containment recommendations |
| Defensive security | Which weaknesses are present and material? | Validated findings, risk ratings, fixes, retest results |
| Mobile analysis | What does this authorized app contain and expose? | Manifest, permissions, code and configuration review |

## Language strategy

- **Python:** primary automation and analysis language.
- **C/C++ and assembly:** memory, executable formats, calling conventions, and low-level behaviour.
- **Java/Kotlin:** Android application and bytecode analysis.
- **JavaScript/TypeScript:** web applications, APIs, browser behaviour, and secure development.
- **Bash and PowerShell:** system administration, triage, collection, and repeatable workflows.
- **Rust:** later option for robust command-line tools and parsers.

There is no universal best language. The right tool depends on the evidence and the question.

## Platform boundary

This repository is a static GitHub Pages site. It publishes learning materials and playbooks only. It does not acquire drives, execute malware, run vulnerability scans, process uploaded evidence, or provide live monitoring. Those capabilities require a separately designed and secured environment.

## Baseline operating principles

- Work only on data and systems owned by the client or covered by explicit written authorization.
- Preserve original evidence; do not experiment on the only copy.
- Record chain of custody, hashes, tool versions, time sources, and analysis steps.
- Prefer read-only acquisition and work from verified copies.
- Separate observations from interpretations and hypotheses.
- State uncertainty and technical limitations plainly.
- Protect client data with access control, encryption, retention limits, and documented disposal.

## Primary standards and references

- [NIST SP 800-86: Guide to Integrating Forensic Techniques into Incident Response](https://csrc.nist.gov/pubs/sp/800/86/final)
- [OWASP Web Security Testing Guide](https://wstg.owasp.org/)
- [OWASP Application Security Verification Standard](https://asvs.owasp.org/)
- [FIRST CVSS v4.0](https://www.first.org/cvss/v4.0/)
- [NIST National Vulnerability Database](https://nvd.nist.gov/)
- [MITRE CWE](https://cwe.mitre.org/)
- [MITRE ATT&CK](https://attack.mitre.org/)

These references support a methodology; they do not replace local legal advice, client authorization, or specialist training.
