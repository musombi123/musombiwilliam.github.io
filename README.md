# Musombi William — Portfolio & Engineering Knowledge Base

This repository publishes the personal portfolio, RevelaCode engineering work, the Digital Forensics & Security Centre, the browser-local Field Workbench, and technical field guides.

**Live site:** https://musombi123.github.io/musombiwilliam.github.io/

## Site architecture

| Page | Purpose |
|---|---|
| `index.html` | Portfolio, skills, experience, RevelaCode project overview, screenshots and contact |
| `forensics.html` | Digital forensics, reverse engineering, defensive security and Portable Field Kit overview |
| `fieldkit.html` | Browser-local evidence inventory, hashing, file-signature and entropy triage, verification, case notes and exports |
| `guides.html` | On-site learning path, data-recovery, reverse-engineering, defensive-security, USB Field Kit and Shamba guides |

The four published HTML pages share a single responsive site layer. It adds consistent navigation, a saved dark/light/system theme, mobile navigation, scroll progress, active section tracking, scroll-reveal motion, page-entry animation, copy-to-clipboard controls, code-copy buttons, image lightbox, and back-to-top control.

## Shared front-end files

- `stylesheet.css` — page styles and the shared responsive visual system.
- `site.js` — shared navigation, theme, motion, scroll, lightbox and clipboard behaviour.
- `scripts/validate-static-site.mjs` — checks common page wiring, unique H1/IDs, local links, reduced-motion support and the Field Workbench script.
- `fieldkit.js` — the Field Workbench's dedicated browser-side file-processing and case-workflow logic. It remains separate from the shared presentation layer.

No front-end framework or animation library is required for the static portfolio. Inter and JetBrains Mono are loaded from Google Fonts with preconnect hints.

## Uploaded ZIP: verification and relationship to this repository

The supplied `musombiwilliam-portfolio.zip` was checked for archive integrity. It is a valid ZIP containing the earlier single-page portfolio source (`index.html`, `stylesheet.css`, `main.js`), a résumé and optimized WebP profile/product screenshots.

That ZIP is an earlier snapshot, not a complete export of the current multi-page website. The live repository has newer Forensics, Workbench, Technical Guides and Shamba/Forensics documentation. The current repository is therefore kept as the source of truth; the ZIP's useful interaction pattern was consolidated into `site.js` and applied across all four current HTML pages without replacing the newer content.

## RevelaAI ecosystem architecture

- [RevelaAI ecosystem architecture and operational contract](docs/revelaai/ECOSYSTEM_ARCHITECTURE.md) — verified source integration points, hub-scoped entitlements, free-tier boundaries, Global Brain/USECT/Core responsibilities, Humanizer integrity requirements, portable companion lifecycle and production acceptance gates.

## Engineering documentation

- `docs/forensics/` — learning path, evidence handling, data recovery, reverse engineering, toolchain, lab safety, vulnerability validation and report template.
- `docs/shamba/` — architecture, API reference, Trust & Safety, farmer/farm review boundaries, operations and release testing.

The on-site Guides page presents the practical reference material. Source documentation remains maintained in Markdown.

## Field Kit release and deployment

The GitHub Actions workflow at `.github/workflows/pages.yml` validates all portfolio pages, checks the JavaScript syntax, fetches the pinned RevelaAI Portable Field Kit source, runs its Windows embedded-runtime tests, packages the Windows x64 USB Edition, generates SHA-256 release metadata, and publishes the static site to GitHub Pages.

The Field Kit download and checksum are generated into `downloads/` during deployment. They are not committed as a duplicate, manually maintained copy.

## Quality and accessibility

The shared system includes:
- Mobile-first layout with a compact navigation drawer.
- Keyboard-focus indicators and a skip-to-content link.
- Persistent manual theme selection with system-preference support.
- Motion that respects `prefers-reduced-motion`.
- Scroll and reveal animations based on IntersectionObserver.
- Image previews and copy controls that do not require new dependencies.
- CI checks for page wiring, anchors, unique IDs and preserved Field Workbench functionality.

The static portfolio does not run forensic scans or process uploaded evidence on a server. The Field Workbench reads selected files in the browser; the separate USB edition provides the packaged local utilities. Only use the tooling with data and systems you own or are expressly authorized to assess.

## Owner

**Musombi William**  
Mombasa, Kenya · Full-Stack Developer · RevelaCode

- Email: [musombiwilliam769@gmail.com](mailto:musombiwilliam769@gmail.com)
- LinkedIn: https://www.linkedin.com/in/william-musombi-a2a064327
- GitHub: https://github.com/musombi123

## License

MIT — see [LICENSE](LICENSE).
