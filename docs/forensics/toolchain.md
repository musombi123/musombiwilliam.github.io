# Toolchain, Languages, Libraries & Official Documentation

This is a reference map, not an instruction to install every tool at once. Prefer maintained official releases, verify downloads, pin versions in case notes, and use disposable lab data.

## 1. Programming languages

| Priority | Language | Why it matters |
|---|---|---|
| Primary | Python | Evidence processing, file parsers, automation, timelines, hash manifests, and repeatable reports. |
| Core low-level | C/C++ | Memory layout, pointers, native APIs, executable behaviour, and understanding compiled code. |
| Core low-level | x86-64 and ARM64 assembly | Disassembly, calling conventions, registers, stack frames, and control flow. |
| Mobile | Java and Kotlin | Android app structure, bytecode, and application logic. |
| Application security | JavaScript and TypeScript | Browser behaviour, Node.js APIs, web applications, and client/server security boundaries. |
| Operations | Bash and PowerShell | Linux/Windows triage, log handling, administration, and automation. |
| Advanced option | Rust | Memory-safe command-line utilities, parsers, and performant analysis tools. |

Official language references: [Python](https://docs.python.org/3/), [C++ reference](https://en.cppreference.com/w/), [Rust Book](https://doc.rust-lang.org/book/), [Java](https://dev.java/learn/), [Kotlin](https://kotlinlang.org/docs/home.html), [TypeScript](https://www.typescriptlang.org/docs/), and [PowerShell](https://learn.microsoft.com/en-us/powershell/).

## 2. Digital acquisition and data recovery

| Tool | Primary use | Official documentation |
|---|---|---|
| GNU ddrescue | Recover readable sectors from failing media into an image, with a resumable map file. | [Manual](https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html) |
| Guymager | Forensic disk imaging in a controlled workstation workflow. | [Project](https://guymager.sourceforge.io/) |
| The Sleuth Kit | File-system and volume analysis; command-line tools and C library. | [Documentation](https://www.sleuthkit.org/sleuthkit/docs.php) |
| Autopsy | GUI digital-forensics platform built around The Sleuth Kit. | [Project and documentation](https://www.sleuthkit.org/autopsy/) |
| TestDisk | Partition and file-system recovery utilities. | [Documentation](https://www.cgsecurity.org/testdisk_doc/) |
| PhotoRec | File carving for supported file types from media or images. | [Documentation](https://www.cgsecurity.org/testdisk_doc/) |

Photo carving can lose original names, folder structure, and timestamps. Filesystem recovery may preserve more context, but results depend on media state. Do not run repair tools on an original source drive.

## 3. Reverse engineering and binary analysis

| Tool/library | Primary use | Official documentation |
|---|---|---|
| Ghidra | Disassembly, decompilation, cross-references, graphs, scripting, and executable analysis. | [NSA Ghidra project](https://github.com/NationalSecurityAgency/ghidra) |
| radare2 / Cutter | Open-source reverse-engineering framework and GUI. | [radare2 book](https://book.rada.re/) · [Cutter](https://cutter.re/) |
| Capstone | Multi-architecture disassembly engine for analysis tools. | [Project](https://www.capstone-engine.org/) |
| LIEF | Parse and inspect PE, ELF, Mach-O, and Android executable formats using C++, Python, or Rust. | [Documentation](https://lief.re/doc/latest/) |
| Frida | Dynamic instrumentation for software you own or are authorized to assess. | [Documentation](https://frida.re/docs/) |
| YARA | Rule-based identification and classification of file patterns. | [Documentation](https://yara.readthedocs.io/) |

## 4. Mobile application analysis

| Tool | Primary use | Official documentation |
|---|---|---|
| JADX | Decompile and inspect Android DEX/APK code. | [Project](https://github.com/skylot/jadx) |
| APKTool | Decode resources and inspect APK structures for authorized testing. | [Project](https://apktool.org/) |
| Androguard | Python toolkit for APK, DEX, manifest, and Android analysis. | [Project](https://github.com/androguard/androguard) |
| MobSF | Static and dynamic mobile application security analysis framework. | [Documentation](https://github.com/MobSF/docs) |
| Android Platform Tools | ADB and device debugging tools for devices you own or administer. | [Android developer documentation](https://developer.android.com/tools) |

Static APK review is not the same as acquiring a phone's private user data. Device acquisition is affected by encryption, OS version, lock state, hardware-backed security, and permissions. Never imply that an app-analysis tool can bypass those controls.

## 5. Memory, operating-system, and network forensics

| Tool | Primary use | Official documentation |
|---|---|---|
| Volatility 3 | Memory-image analysis and plugin-based artefact extraction. | [Documentation](https://volatility3.readthedocs.io/en/latest/) |
| Windows Sysinternals | Windows process, system, and diagnostic utilities. | [Microsoft documentation](https://learn.microsoft.com/en-us/sysinternals/) |
| Wireshark | Packet capture inspection and protocol analysis. | [User guide](https://www.wireshark.org/docs/wsug_html_chunked/) |
| Zeek | Passive network traffic analysis and structured network logs. | [Documentation](https://docs.zeek.org/en/current/) |
| Wazuh | Host telemetry, file-integrity monitoring, vulnerability detection, and incident monitoring. | [Documentation](https://documentation.wazuh.com/current/) |

## 6. Python libraries worth learning

- `hashlib`, `pathlib`, `struct`, `mmap`, `argparse`, `logging`, `sqlite3`, and `datetime` — standard-library foundations for safe analysis.
- [pytsk3](https://github.com/py4n6/pytsk) — Python bindings for The Sleuth Kit.
- [dissect](https://github.com/fox-it/dissect) — DFIR libraries for parsing forensic artefacts.
- [pefile](https://github.com/erocarrera/pefile) — Windows PE parsing.
- [LIEF](https://lief.re/doc/latest/) — executable formats across PE, ELF, Mach-O, and Android.
- [Capstone](https://www.capstone-engine.org/) — instruction disassembly.
- [Androguard](https://github.com/androguard/androguard) — Android package and bytecode analysis.
- [yara-python](https://github.com/VirusTotal/yara-python) — use YARA rules through Python.
- [oletools](https://github.com/decalage2/oletools) — inspect Microsoft Office and OLE artefacts.

Use isolated Python virtual environments, lock dependencies, verify package ownership, and record the exact versions used in each case. Do not execute unknown files simply because a parser has opened them.

## 7. Defensive application-security tooling

| Tool | Purpose | Documentation |
|---|---|---|
| Semgrep | Static analysis and custom rules for code you control. | [Docs](https://semgrep.dev/docs/) |
| GitHub CodeQL | Semantic code analysis and variant detection. | [Docs](https://codeql.github.com/docs/) |
| Trivy | Vulnerability, secret, and misconfiguration scanning for repositories and artefacts. | [Docs](https://trivy.dev/docs/latest/) |
| OSV-Scanner | Match project dependencies against the OSV vulnerability database. | [Docs](https://google.github.io/osv-scanner/) |
| OWASP ZAP | Web application testing, including passive analysis and controlled active testing. | [Docs](https://www.zaproxy.org/docs/) |

These tools produce findings that require triage. A scanner result is not automatically a confirmed exploitable vulnerability. Use them on owned repositories and authorized staging systems; do not point them at arbitrary public systems.

## 8. Standards and reference catalogues

- [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final) — forensic techniques in incident response.
- [OWASP Web Security Testing Guide](https://wstg.owasp.org/) — web application testing methodology.
- [OWASP ASVS](https://asvs.owasp.org/) — technical security verification requirements.
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — common web application risk categories.
- [OWASP API Security](https://owasp.org/www-project-api-security/) — API-specific risk guidance.
- [FIRST CVSS v4.0](https://www.first.org/cvss/v4.0/) — vulnerability severity scoring framework.
- [MITRE CWE](https://cwe.mitre.org/) — weakness taxonomy.
- [NIST NVD](https://nvd.nist.gov/) — vulnerability reference data.
- [MITRE ATT&CK](https://attack.mitre.org/) — adversary behaviour knowledge base for defensive analysis.

## Selection advice

Start with Python, Linux, Wireshark, Ghidra, The Sleuth Kit/Autopsy, Volatility 3, and the OWASP WSTG/ASVS. Add specialist tools only when a case or learning objective calls for them. A small, understood, reproducible toolchain is better than a large unmaintained collection.
