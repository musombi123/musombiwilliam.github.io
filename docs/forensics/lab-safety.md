# Lab Safety, Evidence Handling & Engagement Rules

## Authorization comes first

Only analyze devices, applications, accounts, networks, and data that you own or are explicitly authorized to assess. Written scope should identify the target, permitted actions, timing, exclusions, emergency contact, and data-handling requirements.

A verbal request such as “check this website” is not sufficient authority to test systems belonging to someone else. Third-party cloud providers, shared hosting, payment services, email platforms, and integrated APIs must be covered explicitly.

## Safe lab design

- Use separate virtual machines for analysis, testing, and everyday work.
- Keep unknown or suspicious binaries offline by default.
- Disable shared folders, clipboard, and host credential access for malware-analysis VMs.
- Take snapshots and revert after each experiment.
- Use synthetic data and dedicated test accounts.
- Restrict egress and log lab network activity.
- Never use real customer credentials, production tokens, or personal records in practice exercises.
- Keep tools and operating systems patched; verify downloads and record hashes.
- Do not disable endpoint protection on a normal workstation to make a sample run.

## Evidence integrity

For every case, record case ID and authorization; collectors and transfers; date/time and time zone; source identity and condition; acquisition tool/version/settings and errors; SHA-256 hashes; evidence location and access events; copies made; retention deadline; and analyst actions.

Keep originals protected. Use a separate working copy for analysis. Never repair an evidence source before it has been preserved.

## Privacy and customer data

- Collect only what the authorized scope requires.
- Use encryption at rest and in transit.
- Limit access to named personnel.
- Redact personal information, credentials, session tokens, keys, and confidential content from reports.
- Do not upload customer data to public repositories or unapproved AI services.
- Agree retention and secure-disposal schedules before accepting a case.
- Notify the client promptly if out-of-scope sensitive data or suspected illegal content appears; do not continue exploring it.

## Stop conditions

Stop and notify the approving contact if the target/device appears to belong to another party; testing moves outside scope; a device may suffer additional physical damage; a test causes instability, outage, unexpected data access, or privacy exposure; evidence integrity can no longer be maintained; or a legal hold/criminal matter requires specialist handling.

## Client engagement checklist

Before work: scope, authority, exclusions, emergency contact, privacy/retention terms, and cost approval.

During work: chain of custody, hashes, tool versions, timestamps, case notes, and change log.

At close: findings, limitations, evidence manifest, data handover, secure deletion/retention record, and client acknowledgement.

## References

- [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OWASP WSTG](https://wstg.owasp.org/)
