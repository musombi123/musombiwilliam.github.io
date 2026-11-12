import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, normalize } from "node:path";

const root = process.cwd();
const pages = ["index.html", "forensics.html", "fieldkit.html", "guides.html"];
const failures = [];
const htmlByPath = new Map();

for (const page of pages) {
  const file = resolve(root, page);
  if (!existsSync(file)) {
    failures.push(page + ": missing page");
    continue;
  }
  const html = readFileSync(file, "utf8");
  htmlByPath.set(page, html);
  if (!html.includes('href="stylesheet.css"')) failures.push(page + ": shared stylesheet is not linked");
  if (!html.includes('src="site.js"')) failures.push(page + ": shared interaction script is not linked");
  if ((html.match(/<h1\b/gi) || []).length !== 1) failures.push(page + ": expected exactly one H1");
  if (/target\s*=\s*["']_blank["']/i.test(html)) failures.push(page + ": external links must remain in the current tab");

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) failures.push(page + ": duplicate IDs: " + [...new Set(duplicates)].join(", "));
}

const allIds = new Map([...htmlByPath.entries()].map(([page, html]) => [
  page,
  new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]))
]));

for (const [page, html] of htmlByPath) {
  const hrefs = [...html.matchAll(/\bhref=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const href of hrefs) {
    if (!href || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) continue;
    const [filePart, fragment] = href.split("#", 2);
    const cleanFile = (filePart || page).split("?")[0];
    if (cleanFile.startsWith("downloads/")) continue;
    const destination = normalize(resolve(root, dirname(page), cleanFile));
    if (!destination.startsWith(root)) {
      failures.push(page + ": unsafe relative link " + href);
      continue;
    }
    if (cleanFile && !existsSync(destination)) {
      failures.push(page + ": missing local destination " + href);
      continue;
    }
    if (fragment) {
      const targetPage = cleanFile ? cleanFile.replaceAll("\\", "/").split("/").pop() : page;
      if (allIds.has(targetPage) && !allIds.get(targetPage).has(decodeURIComponent(fragment))) {
        failures.push(page + ": missing anchor " + href);
      }
    }
  }
}

const sharedScript = readFileSync(resolve(root, "site.js"), "utf8");
for (const feature of ["site-primary-nav", "site-theme-toggle", "site-progress", "IntersectionObserver", "site-lightbox", "Copy email", "data-count", "prefers-reduced-motion"]) {
  if (!sharedScript.includes(feature)) failures.push("site.js: expected shared behaviour missing: " + feature);
}
if (!readFileSync(resolve(root, "stylesheet.css"), "utf8").includes("@media(prefers-reduced-motion:reduce)")) {
  failures.push("stylesheet.css: reduced-motion override is missing");
}
if (!readFileSync(resolve(root, "fieldkit.html"), "utf8").includes('src="fieldkit.js"')) {
  failures.push("fieldkit.html: Field Workbench application script must remain enabled");
}

const stylesheet = readFileSync(resolve(root, "stylesheet.css"), "utf8");
for (const selector of [
  ".fieldkit-page .fieldkit-hero",
  ".fieldkit-page .fieldkit-topnav",
  ".fieldkit-page .fieldkit-main",
  ".fieldkit-page .fieldkit-section",
  ".fieldkit-page .fieldkit-dropzone",
  ".fieldkit-page .fieldkit-table-wrap",
  ".fieldkit-page .fieldkit-event",
  ".fieldkit-page .fieldkit-download-card",
  "@media(max-width:560px)"
]) {
  if (!stylesheet.includes(selector)) failures.push("stylesheet.css: standalone Field Workbench layout rule missing: " + selector);
}

if (failures.length) {
  console.error("Static portfolio validation failed:");
  for (const failure of failures) console.error(" - " + failure);
  process.exit(1);
}
console.log("Static portfolio validation passed for " + pages.length + " HTML pages.");
console.log("Shared CSS/JS, unique page headings, local anchors, same-tab links, reduced motion and Field Workbench script verified.");