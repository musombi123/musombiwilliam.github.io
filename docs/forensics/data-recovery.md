# Digital Evidence & Data-Recovery Playbook

Data recovery is a preservation and analysis process—not a promise that deleted or damaged data can always be restored. Outcomes depend on media condition, encryption, file-system state, overwritten blocks, SSD TRIM behaviour, controller firmware, and acquisition quality.

## 1. Intake and authority

Before touching a device:
- Confirm the client owns the device/data or has lawful authority to request the work.
- Record scope: device, volume, accounts, data types, date range, and exclusions.
- Record make/model, serial number, capacity, condition, labels, accessories, and handover details.
- Ask what happened: deletion, formatting, corruption, liquid/impact damage, ransomware, failed update, or inaccessible account.
- Record previous recovery attempts, repairs, firmware changes, and power-on attempts.
- Agree handling method, cost, confidentiality, retention, and return/disposal process.

For disputed ownership, employee devices, regulated data, or suspected criminal evidence, stop until the client obtains required legal or organizational authority.

## 2. Stabilize the source

- Do not browse, copy files, install recovery software, format, initialize, or run repair utilities on the original medium.
- If a drive makes abnormal sounds, overheats, disconnects, or times out repeatedly, stop routine retries and refer it to a suitable hardware-recovery specialist.
- Use a hardware write blocker where the acquisition context requires one.
- Photograph and label the device, ports, cables, adapters, and physical condition.
- Use a clean, access-controlled forensic workstation and a separate destination with sufficient capacity.
- Never use a client's only source device as a practice target.

A write blocker protects against host writes; it does not fix failing hardware or make an unsafe acquisition automatically sound.

## 3. Acquire and verify

1. Record source identity and acquisition setup.
2. Create a sector-level image where appropriate, using a tested tool and documented settings.
3. Use a map/log file for interrupted or error-prone acquisition where supported.
4. Record start/end times, operator, source/destination identifiers, tool/version, errors, and unreadable sectors.
5. Calculate a cryptographic hash such as SHA-256 for the acquired image.
6. Verify the image and preserve the acquisition log.
7. Make a separate working copy; protect the evidence master from analysis changes.

For failing media, GNU ddrescue is designed to copy readable areas and track progress in a map file. Follow its current manual and do not improvise source/destination identifiers.

- [GNU ddrescue manual](https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html)
- [The Sleuth Kit documentation](https://www.sleuthkit.org/sleuthkit/docs.php)
- [Autopsy](https://www.sleuthkit.org/autopsy/)

## 4. Analyze only a working copy

Choose methods based on the incident:
- Partition table and volume discovery.
- File-system metadata review (for example NTFS, FAT/exFAT, or ext4).
- Directory and deleted-entry analysis.
- Journals and metadata where available.
- File carving for known signatures when file-system metadata is missing.
- Timeline analysis, with explicit time-zone and clock-skew notes.
- Malware/ransomware triage only in an isolated lab.

Tools: Autopsy and The Sleuth Kit for file-system analysis; TestDisk for partition/file-system scenarios; PhotoRec for file carving; GNU ddrescue for controlled acquisition from media with read errors.

Carving may recover content without original file names or folder structure. It can also produce fragments, duplicates, and false positives.

## 5. Validate recovered files

- Store recovered files on new destination media, never back onto the source.
- Record each output file, size, hash, recovery method, and relevant metadata.
- Open only known-safe file types in an appropriate analysis environment.
- Check readability, expected structure, and application-level validity.
- Distinguish complete files, partial files, fragments, corrupt output, and files whose contents could not be verified.
- Provide a manifest and explain missing metadata or uncertainty.

## 6. Technical limitations

- Overwritten blocks are generally not recoverable by ordinary software methods.
- SSD TRIM and garbage collection may make deleted data unrecoverable even without much subsequent user activity.
- Full-disk encryption without the required key/recovery material can make an image unusable for content recovery.
- Damaged heads, platters, controllers, NAND packages, or firmware can require specialist hardware facilities.
- Cloud-synced files may need account-level provider recovery rather than device-level carving.
- Recovery software cannot guarantee restoration of every file, original metadata, or directory structure.

Never promise “100% recovery.” Give a feasibility assessment and stop when the risk of further damage outweighs the likely value of continued attempts.

## 7. Case closure

Deliver the intake and authorization record; device/source and image identifiers; acquisition log and errors; hash manifest; methods and tool versions; recovered-file manifest and verification status; limitations and unrecovered categories; and return/handover record with the agreed data-disposal date.

## Reference

Use [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final) for the broader forensic and incident-response process. This is an engineering checklist, not legal advice or a substitute for specialist training.
