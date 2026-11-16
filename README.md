# Musombi William — Portfolio & Engineering Knowledge Base

This repository publishes the personal portfolio, RevelaCode engineering work, the Digital Forensics & Security Centre, the browser-local Field Workbench, technical field guides and the Procedural Game Foundry preview.

**Live site:** https://musombi123.github.io/musombiwilliam.github.io/

## Site architecture

| Page | Purpose |
|---|---|
| `index.html` | Portfolio, skills, experience, RevelaCode overview, projects and contact |
| `forensics.html` | Digital forensics, reverse engineering, defensive security and Portable Field Kit overview |
| `fieldkit.html` | Browser-local evidence inventory, hashing, signature and entropy triage, verification and exports |
| `diagnostics.html` | Offline-capable viewer for JSON reports from the USB Workspace Auditor |
| `guides.html` | Technical field guides, Shamba engineering and defensive-security documentation |
| `procedural-game-foundry.html` | Interactive model-free procedural terrain and scene-editor preview |

The six published HTML pages share the responsive site layer. It adds theme preferences, navigation helpers, scroll progress, reveal motion, clipboard controls, image lightbox and back-to-top behaviour.

## Procedural Game Foundry preview

The Procedural Game Foundry page includes a browser-local Three.js sandbox. Visitors can vary a deterministic terrain seed, elevation, roughness, waterline and map dimensions; place outposts, beacons, trees, rocks and crates; edit object transforms; enter a first-person WASD exploration mode; and export the preview scene as JSON.

The portfolio preview is intentionally self-contained and does not require the private PGF repository or a running API. The full studio source, project persistence, backend validation and Godot assembler are maintained in the separate Procedural Game Foundry repository.

## Shared front-end files

- `stylesheet.css` — page styles and shared responsive visual system.
- `site.js` — shared navigation, theme, motion, scroll, lightbox and clipboard behaviour.
- `scripts/validate-static-site.mjs` — verifies page wiring, unique H1/IDs, local links, reduced-motion support, the Field Workbench and PGF preview.
- `fieldkit.js` — browser-side evidence processing and case workflows.
- `diagnostics.html`, `diagnostics.css`, `diagnostics.js` — offline-capable viewer for structured workspace audit reports.
- `pgf-demo.js` — browser-only 3D terrain, asset placement, transforms, exploration controls and scene JSON export.

## Quality and accessibility

The shared site includes mobile-first layouts, keyboard focus indicators, skip-to-content links, saved theme preferences, reduced-motion support, responsive navigation, local-only browser tools and CI checks for local destinations and key interactive features.

The static portfolio does not run forensic scans or upload evidence. The PGF page's preview stays in the browser; the full studio project service is separate.
