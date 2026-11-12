(() => {
  "use strict";

  const state = { report: null, findings: [] };
  const byId = (id) => document.getElementById(id);
  const input = byId("reportFile");
  const status = byId("reportStatus");
  const workspace = byId("reportWorkspace");
  const severityFilter = byId("severityFilter");
  const searchInput = byId("findingSearch");
  const exportButton = byId("exportFindings");

  const setStatus = (message, kind) => {
    status.textContent = message;
    status.className = "diag-status-line" + (kind ? " is-" + kind : "");
  };

  const number = (value) => Number.isFinite(Number(value)) ? Number(value).toLocaleString() : "0";
  const text = (value, fallback) => {
    if (typeof value === "string" && value.trim()) return value;
    return fallback || "Not provided";
  };

  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined && value !== null) node.textContent = String(value);
    return node;
  };

  const validateReport = (report) => {
    if (!report || typeof report !== "object" || Array.isArray(report)) {
      throw new Error("The selected file does not contain a JSON object.");
    }
    if (report.schema_version !== "revelaai.workspace-audit.v1") {
      throw new Error("Unsupported report schema. Expected revelaai.workspace-audit.v1.");
    }
    if (!Array.isArray(report.projects) || !Array.isArray(report.findings) || !report.summary) {
      throw new Error("The report is incomplete: projects, findings or summary are missing.");
    }
    if (report.projects.length > 300 || report.findings.length > 50000) {
      throw new Error("The report exceeds this viewer's safety limits.");
    }
    return report;
  };

  const renderSummary = (report) => {
    const summary = report.summary || {};
    byId("metricProjects").textContent = number(summary.projects);
    byId("metricFiles").textContent = number(summary.files_scanned);
    byId("metricFindings").textContent = number(summary.findings);
    byId("metricCritical").textContent = number(summary.critical);
    byId("metricHigh").textContent = number(summary.high);
    byId("metricMedium").textContent = number(summary.medium);
    byId("projectCount").textContent = number(report.projects.length) + " PROJECTS";
    byId("reportMeta").textContent =
      "Created " + text(report.created_at) + " · " +
      text(report.environment && report.environment.platform, "Unknown platform") + " · " +
      text(report.environment && report.environment.python_version, "Unknown Python version") +
      (report.scope && report.scope.network_used ? " · Online npm audit requested" : " · Network disabled");
  };

  const renderProjects = (projects) => {
    const container = byId("projectList");
    container.replaceChildren();
    if (!projects.length) {
      container.append(element("p", "diag-empty", "No projects were recorded in this report."));
      return;
    }
    projects.forEach((project) => {
      const card = element("article", "diag-project-card");
      card.append(element("strong", "diag-project-path", text(project.path, "Unnamed project")));
      const types = Array.isArray(project.project_type) ? project.project_type : [];
      card.append(element("div", "diag-project-meta",
        number(project.files_scanned) + " files · " +
        number(project.source_files_scanned) + " source files · " +
        number((project.findings || []).length) + " findings"));
      const tags = element("div", "diag-project-tags");
      (types.length ? types : ["filesystem"]).forEach((type) => tags.append(element("span", "", type)));
      const languages = project.languages && typeof project.languages === "object" ? project.languages : {};
      Object.keys(languages).slice(0, 5).forEach((language) => {
        tags.append(element("span", "", language + " " + number(languages[language])));
      });
      card.append(tags);
      const binding = project.service_bindings || {};
      const bindingText = binding.present
        ? (binding.missing_references && binding.missing_references.length
          ? "Unresolved Render services: " + binding.missing_references.join(", ")
          : "Render Blueprint references: " + number((binding.service_references || []).length) + " · no missing service names reported")
        : "No Render Blueprint detected";
      card.append(element("div", "diag-project-binding", bindingText));
      container.append(card);
    });
  };

  const filteredFindings = () => {
    const severity = severityFilter.value;
    const query = searchInput.value.trim().toLowerCase();
    return state.findings.filter((finding) => {
      const level = String(finding.severity || "informational").toLowerCase();
      if (severity !== "all" && level !== severity) return false;
      if (!query) return true;
      const haystack = [
        finding.rule_id, finding.title, finding.detail, finding.recommendation,
        finding.file, finding.project, finding.category
      ].map((value) => String(value || "")).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  };

  const renderFindings = () => {
    const container = byId("findingsList");
    const rows = filteredFindings();
    container.replaceChildren();
    byId("findingCount").textContent = number(rows.length) + " / " + number(state.findings.length) + " FINDINGS";
    exportButton.disabled = rows.length === 0;
    if (!rows.length) {
      container.append(element("p", "diag-empty",
        state.findings.length ? "No findings match the current filters." : "No findings were recorded in this report."));
      return;
    }
    rows.forEach((finding) => {
      const card = element("article", "diag-finding");
      const top = element("div", "diag-finding-top");
      const severity = String(finding.severity || "informational").toLowerCase();
      top.append(element("span", "diag-severity diag-severity-" + severity, severity));
      top.append(element("span", "diag-rule", text(finding.rule_id, "CUSTOM-FINDING")));
      top.append(element("span", "diag-rule", text(finding.category, "uncategorized")));
      card.append(top);
      card.append(element("h3", "", text(finding.title, "Untitled finding")));
      card.append(element("p", "", text(finding.detail, "No detail supplied.")));
      if (finding.file || finding.project) {
        card.append(element("p", "diag-finding-path",
          [finding.project, finding.file].filter(Boolean).join(" · ") +
          (finding.line ? ":" + number(finding.line) : "")));
      }
      if (finding.recommendation) {
        card.append(element("p", "diag-recommendation",
          "RECOMMENDATION · " + String(finding.recommendation)));
      }
      container.append(card);
    });
  };

  const loadReport = (report, name) => {
    state.report = report;
    state.findings = report.findings.slice().sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3, informational: 4 };
      return (order[String(a.severity || "").toLowerCase()] ?? 5) -
        (order[String(b.severity || "").toLowerCase()] ?? 5);
    });
    renderSummary(report);
    renderProjects(report.projects);
    renderFindings();
    workspace.hidden = false;
    setStatus("Loaded " + name + " · " + number(report.projects.length) +
      " projects · " + number(report.findings.length) + " findings. Report contents remain in this tab.", "success");
  };

  input.addEventListener("change", async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setStatus("Report exceeds the 25 MiB viewer limit.", "error");
      input.value = "";
      return;
    }
    try {
      const raw = await file.text();
      const report = validateReport(JSON.parse(raw));
      loadReport(report, file.name);
    } catch (error) {
      workspace.hidden = true;
      state.report = null;
      state.findings = [];
      setStatus(error && error.message ? error.message : "Could not read the report.", "error");
    }
  });

  severityFilter.addEventListener("change", renderFindings);
  searchInput.addEventListener("input", renderFindings);

  exportButton.addEventListener("click", () => {
    if (!state.report) return;
    const payload = {
      schema_version: state.report.schema_version,
      exported_at: new Date().toISOString(),
      source_report_created_at: state.report.created_at || null,
      filter: { severity: severityFilter.value, search: searchInput.value },
      count: filteredFindings().length,
      findings: filteredFindings()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "revelaai-filtered-findings.json";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  });

  byId("clearReport").addEventListener("click", () => {
    state.report = null;
    state.findings = [];
    input.value = "";
    severityFilter.value = "all";
    searchInput.value = "";
    workspace.hidden = true;
    setStatus("Report closed. No report data is retained by this page.", "");
  });
})();
