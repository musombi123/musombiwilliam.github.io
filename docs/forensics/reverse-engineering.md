# Software & Mobile Reverse-Engineering Playbook

Reverse engineering is the disciplined study of software behaviour, file formats, and compiled code. Use it for interoperability, debugging, malware triage, vulnerability research, and security assurance only where you have the required rights and authorization.

## 1. Define the question and scope

Record ownership, permission/license basis, exact files/builds, hashes, versions, device models, excluded components, and whether analysis is static or dynamic. Do not bypass access controls or licensing restrictions, extract third-party secrets, or deploy modified binaries without authorization.

## 2. Establish a safe analysis environment

- Use a disposable virtual machine or dedicated lab workstation.
- Snapshot the environment before analysis.
- Disable shared folders, clipboard, host credential access, and unnecessary USB pass-through.
- Keep networking disabled by default for unknown or suspicious files; add controlled, monitored connectivity only when the lab design requires it.
- Do not use production accounts, tokens, personal documents, or real customer data.
- Do not execute unknown binaries on a normal daily-use machine.

Start with static analysis. Use known benign test programs while learning.

## 3. Static analysis workflow

1. Preserve the input and calculate SHA-256.
2. Identify format and architecture (PE, ELF, Mach-O, DEX, or APK).
3. Record headers, sections, symbols, imports, exports, signing metadata, and file size.
4. Extract strings and resources as clues—not proof of behaviour.
5. Load the file into Ghidra or another suitable disassembler.
6. Identify entry points, library calls, function boundaries, cross-references, and control-flow graphs.
7. Rename functions only when justified; preserve original addresses and notes.
8. Compare decompiler output with disassembly around important logic.
9. Record uncertainty, compiler/optimization effects, stripped symbols, and anti-analysis limitations.

A decompiler produces a reconstruction, not the original source code. Validate conclusions against instructions, data references, and observable behaviour.

## 4. Dynamic analysis concepts

Dynamic instrumentation can help answer what a program does at runtime. Use it only against a program you own or are explicitly authorized to analyze.

- Start from a clean VM snapshot.
- Capture process, file, configuration, and network observations relevant to the scope.
- Monitor system calls and loaded modules where appropriate.
- Use a controlled fake dataset and non-production credentials.
- Record test conditions and repeat the observation.
- Revert the VM after analysis.

[Frida](https://frida.re/docs/) is a dynamic instrumentation toolkit. Its capabilities are powerful and must remain within authorized research and testing boundaries.

## 5. Android APK analysis

For an APK you own or are authorized to assess:
- Record package name, version, signing certificate details, file hash, and acquisition source.
- Inspect the manifest, permissions, exported components, intent filters, services, receivers, and providers.
- Inspect DEX/Java/Kotlin code and resources.
- Inventory bundled native shared libraries and their architectures.
- Review network-security configuration, cleartext traffic settings, deep links, WebView usage, local storage, and logging.
- Check dependencies and known CVEs.
- Validate suspected issues in a controlled test build or authorized test device.

Useful tools: [JADX](https://github.com/skylot/jadx), [APKTool](https://apktool.org/), [Androguard](https://github.com/androguard/androguard), [MobSF docs](https://github.com/MobSF/docs), and [Android Platform Tools](https://developer.android.com/tools).

APK analysis is not full device forensics. Phone data acquisition is constrained by encryption, lock state, OS version, hardware-backed keys, app sandboxing, and permissions.

## 6. Tool and library selection

- Ghidra: general static reverse engineering and decompilation.
- radare2/Cutter: alternative analysis workflow.
- Capstone: disassembly component for custom tooling.
- LIEF: parsing executable formats programmatically.
- Frida: authorized runtime instrumentation.
- YARA: pattern-based classification and triage.
- Python: repeatable parsers, metadata extraction, and report generation.

## 7. Expected outputs

A professional report should include input provenance, hash, format, architecture, build information, scope and permissions, environment and tool versions, annotated functions and data structures, runtime observations separated from static inferences, security implications, confidence level, limitations, alternative explanations, and recommendations.

## Learning references

- [NSA Ghidra project](https://github.com/NationalSecurityAgency/ghidra)
- [radare2 book](https://book.rada.re/)
- [Capstone](https://www.capstone-engine.org/)
- [LIEF documentation](https://lief.re/doc/latest/)
- [Frida documentation](https://frida.re/docs/)
