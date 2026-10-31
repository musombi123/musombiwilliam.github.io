(() => {
  "use strict";

  const MAX_FILES = 20;
  const MAX_BYTES = 128 * 1024 * 1024;
  const SAMPLE_BYTES = 1024 * 1024;
  const $ = (id) => document.getElementById(id);
  const fileInput = $("evidenceFiles");
  const dropZone = $("dropZone");
  const statusNode = $("workbenchStatus");
  let selectedFiles = [];
  let evidence = [];
  let events = [];
  let caseId = "";
  let analyst = "";
  let previousEventHash = "0".repeat(64);

  const hex = (buffer) => Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
  const sha256 = async (value) => {
    if (!window.isSecureContext || !crypto.subtle) {
      throw new Error("SHA-256 is unavailable. Open this page over HTTPS in a modern browser.");
    }
    return hex(await crypto.subtle.digest("SHA-256", value));
  };

  function setStatus(message, kind = "info") {
    statusNode.textContent = message;
    statusNode.dataset.kind = kind;
  }

  function cleanText(value) {
    return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  }

  function safeCaseId(value) {
    return /^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$/.test(value);
  }

  function guessType(file, bytes) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const starts = (...values) => values.every((v, i) => bytes[i] === v);
    if (starts(0x4d, 0x5a)) return "DOS/PE executable header (MZ)";
    if (starts(0x7f, 0x45, 0x4c, 0x46)) return "ELF executable";
    if (starts(0x25, 0x50, 0x44, 0x46)) return "PDF document";
    if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "PNG image";
    if (starts(0xff, 0xd8, 0xff)) return "JPEG image";
    if (starts(0x00, 0x61, 0x73, 0x6d)) return "WebAssembly module";
    if (starts(0xca, 0xfe, 0xba, 0xbe) || starts(0xcf, 0xfa, 0xed, 0xfe) || starts(0xce, 0xfa, 0xed, 0xfe) || starts(0xfe, 0xed, 0xfa, 0xcf) || starts(0xfe, 0xed, 0xfa, 0xce)) return "Mach-O / universal binary signature";
    if (starts(0x50, 0x4b, 0x03, 0x04) || starts(0x50, 0x4b, 0x05, 0x06) || starts(0x50, 0x4b, 0x07, 0x08)) {
      return ext === "apk" ? "ZIP-based Android package (APK)" : "ZIP archive";
    }
    if (bytes.length && !bytes.includes(0)) {
      let controls = 0;
      for (const b of bytes) if ((b < 0x09) || (b > 0x0d && b < 0x20)) controls++;
      if (controls / bytes.length < 0.04) return "Text-like data";
    }
    return "Unknown / unclassified";
  }

  function entropy(bytes) {
    if (!bytes.length) return 0;
    const counts = new Uint32Array(256);
    for (const b of bytes) counts[b]++;
    let value = 0;
    for (const count of counts) {
      if (!count) continue;
      const p = count / bytes.length;
      value -= p * Math.log2(p);
    }
    return value;
  }

  async function addEvent(action, details) {
    const event = {
      sequence: events.length + 1,
      timestamp_utc: new Date().toISOString(),
      actor: analyst || "Unspecified operator",
      case_id: caseId,
      action,
      details,
      previous_event_sha256: previousEventHash
    };
    event.event_sha256 = await sha256(new TextEncoder().encode(JSON.stringify(event)));
    events.push(event);
    previousEventHash = event.event_sha256;
    renderEvents();
  }

  function ensureCase() {
    const proposed = $("caseId").value.trim();
    const proposedAnalyst = cleanText($("analyst").value) || "Unspecified operator";
    if (!safeCaseId(proposed)) {
      throw new Error("Use a Case ID of 3–64 characters: letters, numbers, dot, underscore or hyphen.");
    }
    if (events.length && caseId && proposed !== caseId) {
      throw new Error("This Case ID is locked after the first event. Reset the session to start a different case.");
    }
    if (events.length && analyst && proposedAnalyst !== analyst) {
      throw new Error("The analyst is locked after the first event. Reset the session to change the operator.");
    }
    caseId = proposed;
    analyst = proposedAnalyst;
  }

  function addSelected(list) {
    const incoming = Array.from(list || []);
    const known = new Set(selectedFiles);
    for (const file of incoming) {
      if (!known.has(file)) {
        selectedFiles.push(file);
        known.add(file);
      }
    }
    const maxTotalBytes = 256 * 1024 * 1024;
    if (selectedFiles.length > MAX_FILES) {
      selectedFiles = selectedFiles.slice(0, MAX_FILES);
      setStatus("The session limit is 20 files. Extra selections were not added.", "warning");
    }
    const totalBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    while (selectedFiles.length && totalBytes > maxTotalBytes) {
      selectedFiles.pop();
      const keptBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      if (keptBytes <= maxTotalBytes) break;
    }
    if (totalBytes > maxTotalBytes) {
      setStatus("The total browser-session limit is 256 MiB. The last selections were removed.", "warning");
    } else {
      setStatus(selectedFiles.length + " file(s) selected. Run the inventory when ready.");
    }
    renderSelection();
  }

  function renderSelection() {
    const heading = dropZone.querySelector("h3");
    const description = dropZone.querySelector("p");
    heading.textContent = selectedFiles.length ? selectedFiles.length + " file(s) selected" : "Choose files for local triage";
    description.textContent = selectedFiles.length
      ? selectedFiles.map((f) => f.name).slice(0, 4).join(", ") + (selectedFiles.length > 4 ? " and " + (selectedFiles.length - 4) + " more" : "")
      : "Drag files here or select them from this device. No file content is sent to a server.";
  }

  function renderManifest() {
    const tbody = $("manifestRows");
    tbody.replaceChildren();
    $("evidenceCount").textContent = evidence.length + " ITEM" + (evidence.length === 1 ? "" : "S");
    if (!evidence.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 6;
      td.className = "fieldkit-empty";
      td.textContent = "No evidence has been inventoried in this session.";
      tr.append(td);
      tbody.append(tr);
      return;
    }
    for (const item of evidence) {
      const tr = document.createElement("tr");
      const name = document.createElement("td");
      name.className = "evidence-name";
      name.textContent = item.name;
      const size = document.createElement("td");
      size.textContent = formatBytes(item.size);
      const type = document.createElement("td");
      type.textContent = item.type_hint;
      const ent = document.createElement("td");
      ent.textContent = item.sample_entropy.toFixed(3) + " / 8";
      const hash = document.createElement("td");
      hash.className = "hash-cell";
      hash.textContent = item.sha256;
      hash.title = item.sha256;
      const verify = document.createElement("td");
      const verifyInput = document.createElement("input");
      verifyInput.className = "verify-input";
      verifyInput.type = "text";
      verifyInput.placeholder = "Expected SHA-256";
      verifyInput.setAttribute("aria-label", "Expected SHA-256 for " + item.name);
      const verifyButton = document.createElement("button");
      verifyButton.type = "button";
      verifyButton.className = "verify-button";
      verifyButton.textContent = "Check";
      const result = document.createElement("small");
      result.className = "verify-result";
      verifyButton.addEventListener("click", async () => {
        const expected = verifyInput.value.trim().toLowerCase();
        if (!/^[a-f0-9]{64}$/.test(expected)) {
          result.textContent = "Enter 64 hex characters.";
          result.dataset.kind = "warning";
          return;
        }
        verifyButton.disabled = true;
        result.textContent = "Hashing…";
        try {
          const actual = await sha256(await item.file.arrayBuffer());
          const ok = actual === expected && actual === item.sha256;
          result.textContent = ok ? "MATCH" : "MISMATCH";
          result.dataset.kind = ok ? "success" : "error";
          await addEvent("integrity-verification", {
            evidence_id: item.evidence_id,
            expected_sha256: expected,
            observed_sha256: actual,
            result: ok ? "match" : "mismatch"
          });
        } catch (error) {
          result.textContent = error.message;
          result.dataset.kind = "error";
        } finally {
          verifyButton.disabled = false;
        }
      });
      verify.append(verifyInput, verifyButton, result);
      tr.append(name, size, type, ent, hash, verify);
      tbody.append(tr);
    }
  }

  async function verifyEventChain() {
    const button = $("verifyChain");
    button.disabled = true;
    try {
      let previous = "0".repeat(64);
      for (const event of events) {
        if (event.previous_event_sha256 !== previous) {
          throw new Error("Broken previous-hash link at event " + event.sequence + ".");
        }
        const { event_sha256, ...payload } = event;
        const calculated = await sha256(new TextEncoder().encode(JSON.stringify(payload)));
        if (calculated !== event_sha256) {
          throw new Error("Event hash mismatch at event " + event.sequence + ".");
        }
        previous = event_sha256;
      }
      setStatus(events.length ? "Event chain verified. " + events.length + " event(s) are linked and unchanged." : "No events exist to verify.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      button.disabled = false;
    }
  }

  function renderEvents() {
    const list = $("eventList");
    list.replaceChildren();
    $("eventCount").textContent = events.length + " EVENT" + (events.length === 1 ? "" : "S");
    if (!events.length) {
      const p = document.createElement("p");
      p.className = "fieldkit-empty";
      p.textContent = "Case events will appear here as you work.";
      list.append(p);
      return;
    }
    for (const event of events) {
      const article = document.createElement("article");
      article.className = "fieldkit-event";
      const meta = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = event.action.replace(/-/g, " ");
      const time = document.createElement("time");
      time.dateTime = event.timestamp_utc;
      time.textContent = new Date(event.timestamp_utc).toLocaleString();
      meta.append(title, time);
      const hash = document.createElement("code");
      hash.textContent = "SHA-256 " + event.event_sha256;
      const detail = document.createElement("p");
      detail.textContent = JSON.stringify(event.details);
      article.append(meta, detail, hash);
      list.append(article);
    }
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    const units = ["KiB", "MiB", "GiB", "TiB"];
    let value = bytes / 1024;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) { value /= 1024; index++; }
    return value.toFixed(2) + " " + units[index];
  }

  async function runInventory() {
    if (!selectedFiles.length) {
      setStatus("Select at least one file first.", "warning");
      return;
    }
    const invalid = selectedFiles.find((f) => f.size > MAX_BYTES);
    if (invalid) {
      setStatus(invalid.name + " exceeds the 128 MiB per-file browser limit. Use the USB edition for larger files.", "warning");
      return;
    }
    try {
      ensureCase();
      if (!events.length) {
        await addEvent("case-opened", { case_title: caseId, evidence_count_expected: selectedFiles.length, processing: "browser-local" });
      }
    } catch (error) {
      setStatus(error.message, "error");
      return;
    }

    const button = $("runInventory");
    button.disabled = true;
    let completed = 0;
    try {
      for (const file of selectedFiles) {
        if (evidence.some((item) => item.file === file)) {
          continue;
        }
        setStatus("Reading and hashing " + file.name + " (" + (completed + 1) + "/" + selectedFiles.length + ")…");
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const digest = await sha256(buffer);
        const sample = bytes.subarray(0, Math.min(bytes.length, SAMPLE_BYTES));
        const item = {
          evidence_id: "E-" + String(evidence.length + 1).padStart(3, "0"),
          name: cleanText(file.name),
          size: file.size,
          last_modified_utc: file.lastModified ? new Date(file.lastModified).toISOString() : null,
          last_modified_ms: file.lastModified,
          type_hint: guessType(file, sample),
          sample_bytes: sample.length,
          sample_entropy: entropy(sample),
          sha256: digest,
          file
        };
        evidence.push(item);
        completed++;
        await addEvent("evidence-inventoried", {
          evidence_id: item.evidence_id,
          filename: item.name,
          size_bytes: item.size,
          sha256: item.sha256,
          type_hint: item.type_hint
        });
        renderManifest();
      }
      setStatus(completed ? completed + " file(s) inventoried. Files remained on this device." : "No new files needed hashing.", "success");
      $("exportJson").disabled = evidence.length === 0;
      $("exportReport").disabled = evidence.length === 0;
    } catch (error) {
      setStatus(error.message || "The inventory could not be completed.", "error");
    } finally {
      button.disabled = false;
    }
  }

  function serializableCase() {
    return {
      application: "RevelaCode Field Workbench",
      version: "0.2.0-browser-demo",
      exported_at_utc: new Date().toISOString(),
      case_id: caseId,
      analyst,
      processing_location: "local browser session",
      evidence: evidence.map(({ file, ...item }) => {
        const copy = { ...item };
        delete copy.last_modified_ms;
        return copy;
      }),
      custody_events: events,
      limitations: [
        "Browser workbench reads selected files locally and does not upload their contents.",
        "Hash-linked events are not digitally signed and are not an immutable external audit record.",
        "Header recognition and sample entropy are triage hints, not malware detection or full binary parsing.",
        "The browser demo is not forensic disk imaging or a substitute for a hardware write blocker.",
        "Hash equality verifies byte equality between observations, not authenticity, ownership or provenance."
      ]
    };
  }

  function download(name, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportJson() {
    download((caseId || "field-case") + "-manifest.json", JSON.stringify(serializableCase(), null, 2), "application/json");
  }

  function exportReport() {
    const data = serializableCase();
    const esc = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ");
    const rows = data.evidence.map((item) => "| " + esc(item.evidence_id) + " | " + esc(item.name) + " | " + item.size + " | " + esc(item.type_hint) + " | `" + item.sha256 + "` |").join("\n");
    const eventRows = data.custody_events.map((event) => "- **" + event.sequence + ". " + event.action + "** — " + event.timestamp_utc + " · " + event.event_sha256).join("\n");
    const report = [
      "# Field Workbench Case Report",
      "",
      "- Case ID: " + data.case_id,
      "- Analyst: " + data.analyst,
      "- Exported (UTC): " + data.exported_at_utc,
      "- Processing: local browser session",
      "",
      "## Evidence inventory",
      "",
      "| Evidence ID | File | Size (bytes) | Type hint | SHA-256 |",
      "|---|---|---:|---|---|",
      rows || "| — | No evidence inventoried | — | — | — |",
      "",
      "## Hash-linked activity log",
      "",
      eventRows || "No events recorded.",
      "",
      "## Limitations",
      "",
      ...data.limitations.map((line) => "- " + line),
      "",
      "This report records browser observations. It is not a certified forensic acquisition report."
    ].join("\n");
    download((caseId || "field-case") + "-report.md", report, "text/markdown");
  }

  $("chooseFiles").addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    fileInput.click();
  });
  dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener("change", () => addSelected(fileInput.files));
  for (const name of ["dragenter", "dragover"]) {
    dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add("is-dragging"); });
  }
  for (const name of ["dragleave", "drop"]) {
    dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove("is-dragging"); });
  }
  dropZone.addEventListener("drop", (event) => addSelected(event.dataTransfer.files));
  $("runInventory").addEventListener("click", runInventory);
  $("exportJson").addEventListener("click", exportJson);
  $("verifyChain").addEventListener("click", verifyEventChain);
  $("exportReport").addEventListener("click", exportReport);
  $("resetSession").addEventListener("click", () => {
    selectedFiles = [];
    evidence = [];
    events = [];
    caseId = "";
    analyst = "";
    previousEventHash = "0".repeat(64);
    fileInput.value = "";
    $("caseId").value = "FIELD-CASE-001";
    $("analyst").value = "";
    renderSelection();
    renderManifest();
    renderEvents();
    $("exportJson").disabled = true;
    $("exportReport").disabled = true;
    setStatus("Session reset. No files were changed on disk.");
  });

  renderSelection();
  renderManifest();
  renderEvents();
})();