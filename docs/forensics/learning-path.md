# Six-Month Learning Path: Digital Forensics & Reverse Engineering

This is a structured self-study programme, not an accredited qualification. A realistic target is 8–12 focused hours per week; extend the schedule when a topic needs more time.

## Entry requirements

Become comfortable with Linux and Windows basics, users and permissions, processes, networking (IP, DNS, TCP/UDP, TLS, HTTP), Git, Python fundamentals, SQL, JSON, command-line tools, and debugging.

Resources: [Python tutorial](https://docs.python.org/3/tutorial/), [Linux man-pages](https://man7.org/linux/man-pages/), [OverTheWire Bandit](https://overthewire.org/wargames/bandit/), and [Wireshark documentation](https://www.wireshark.org/docs/).

## Month 1 — Operating systems, networks, and programming

**Study:** Linux/Windows architecture; TCP/IP, DNS, HTTP(S), TLS; Python file and binary I/O, byte order, `struct`, `hashlib`, `argparse`, exceptions and tests; C fundamentals; introductory x86-64 and ARM64 assembly.

**Practical work**
1. Write a Python file-inventory utility that reports names, sizes, timestamps, and SHA-256 hashes.
2. Parse a supplied PCAP and summarize DNS, HTTP, and TCP connection metadata.
3. Compile a small C program and compare its source, symbols, disassembly, and decompiler output.

**Portfolio evidence:** source code, unit tests, synthetic input, expected output, and technical notes.

## Month 2 — Storage, file systems, and forensic acquisition

**Study:** disk geometry, partitions, volumes, sectors and clusters; FAT/exFAT, NTFS and ext4; file metadata and deleted entries; SHA-256; write blockers; acquisition logs; image formats, bad sectors, and map files.

**Practical work**
1. Build a small synthetic disk image using disposable test files.
2. Acquire an image in a controlled lab and verify its hash.
3. Identify partitions and file-system metadata from the image.
4. Create an acquisition record and explain its limitations.

**Portfolio evidence:** lab diagram, image hashes, tool versions, acquisition log, and non-sensitive report.

## Month 3 — Host, memory, and network forensics

**Study:** Windows Event Logs, Sysmon concepts, Prefetch, registry artefacts, scheduled tasks and services; Linux journal and authentication logs; volatile vs non-volatile evidence; Volatility 3; Wireshark; Zeek; timeline construction and clock drift.

**Practical work**
1. Analyze a provided or self-generated Windows event-log dataset.
2. Analyze a known training memory image with Volatility 3.
3. Create a timeline citing every source and time basis.
4. Summarize a public or self-generated PCAP without interacting with a third-party network.

**Portfolio evidence:** timeline, command/query log, redacted screenshots, and findings report.

## Month 4 — Software reverse engineering

**Study:** PE, ELF, Mach-O, DEX and APK formats; static triage; headers, sections, symbols, imports and exports; x86-64/ARM64; disassembly, decompilation, cross-references, control-flow graphs and data-flow reasoning; YARA concepts; isolated dynamic analysis.

**Practical work**
1. Analyze a program you wrote and compiled yourself.
2. Compare its source to Ghidra disassembly and decompiled pseudocode.
3. Write a Python parser for a documented benign binary format.
4. Inspect an APK you own or are authorized to analyze: package metadata, manifest, permissions, DEX, and bundled native libraries.

**Portfolio evidence:** annotated Ghidra screenshots, parser tests, hashes, and an explanation separating fact from inference.

## Month 5 — Mobile analysis and application security

**Study:** Android package structure, manifest, exported components, permissions, signing, DEX, resources and native libraries; JADX, APKTool, Androguard and MobSF; OWASP WSTG and ASVS; authentication, authorization, sessions, validation, encoding, file handling, cryptography and business logic; Semgrep, CodeQL, Trivy, OSV-Scanner; safe DAST on a local lab or approved staging system.

**Practical work**
1. Review your own application and produce a component/permission inventory.
2. Run source and dependency checks against a repository you control.
3. Reproduce a deliberately vulnerable training issue in a local lab, document impact, implement the correction, and retest.
4. Build a security checklist for a RevelaCode API endpoint.

**Portfolio evidence:** scan configuration, sanitized findings, secure code change, tests, and remediation notes.

## Month 6 — Professional workflow and capstone

### Capstone A: Data recovery
Use a disposable test image containing deliberately deleted files. Preserve and hash the original image, recover from a working copy, verify outputs, and document anything not recovered.

### Capstone B: Reverse engineering
Analyze a self-built binary or known benign open-source test program. Describe format, architecture, imports, key functions, control flow, and limitations.

### Capstone C: Defensive security
Assess a deliberately vulnerable application in a private lab. Use a defined scope, safe tests, reproducible evidence, a risk rating, remediation, and a retest.

## Portfolio acceptance criteria

A project is not complete because a tool produced output. Each case must include:
- A clear question, scope, authorization, and exclusions.
- Input provenance and SHA-256 hashes where applicable.
- Tool names, versions, configuration, date/time basis, and method.
- Reproducible observations and evidence references.
- Finding confidence, impact, limitations, and alternative explanations.
- Remediation/recovery actions and retest or verification results.
- A sanitized public version with no client data, credentials, personal information, or exploitable secrets.

## Training resources

- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — free interactive web-security learning materials and labs.
- [OverTheWire Bandit](https://overthewire.org/wargames/bandit/) — Linux command-line practice.
- [Ghidra](https://ghidra-sre.org/) — software reverse-engineering framework.
- [The Sleuth Kit and Autopsy](https://www.sleuthkit.org/autopsy/) — digital-forensics tools.
- [Volatility 3](https://volatility3.readthedocs.io/en/latest/) — memory-forensics framework.
- [OWASP WSTG](https://wstg.owasp.org/) and [OWASP ASVS](https://asvs.owasp.org/) — testing methodology and verification requirements.
- [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final) — forensic techniques in incident response.

## Career progression

Build demonstrable proof for supervised entry-level roles first: junior SOC analyst, junior application-security analyst, IT support with incident-response duties, digital-forensics trainee, or software reverse-engineering intern. Do not market yourself as a certified forensic examiner or promise guaranteed recovery until the qualification, facilities, and case experience support that claim.
