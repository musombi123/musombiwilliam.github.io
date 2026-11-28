/* Portfolio enhancements: project index, research/team navigation and message-ready contact links. */
(() => {
  "use strict";
  const email = "musombiwilliam769@gmail.com";
  const phone = "254734867879";
  const message = "Hello Musombi, I visited your portfolio and would like to connect about an opportunity, collaboration, or project. Please let me know when you are available.";
  const encoded = encodeURIComponent(message);
  const mail = (subject) => "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
  const wa = "https://wa.me/" + phone + "?text=" + encoded;
  const teams = "https://teams.microsoft.com/l/chat/0/0?users=" + encodeURIComponent(email) + "&message=" + encoded;
  const fb = "https://m.me/revelai12";
  const css = document.createElement("link"); css.rel="stylesheet"; css.href="portfolio-enhancements.css"; document.head.appendChild(css);
  const addLinks = () => {
    const nav = document.querySelector("#navlinks");
    if (nav) {
      if (!nav.querySelector('a[href="research-centre.html"]')) {
        nav.insertAdjacentHTML("beforeend", '<a data-portfolio-nav="research" href="research-centre.html">Research Centre</a>');
      }
      if (!nav.querySelector('a[href="team.html"]')) {
        nav.insertAdjacentHTML("beforeend", '<a data-portfolio-nav="team" href="team.html">Team</a>');
      }
    }
    const engineering = document.querySelector("#engineering-projects .road-grid");
    if (engineering && !document.getElementById("portfolio-project-index")) {
      const cards = document.createElement("div"); cards.id="portfolio-project-index"; cards.className="portfolio-project-index";
      cards.innerHTML = '<article class="portfolio-extra-card"><span class="portfolio-extra-label">FOUNDATION · PLATFORM</span><h3>RevelaCode Software Solutions</h3><p>Modular web and mobile platform spanning business, education, agriculture, faith and community services.</p><div class="portfolio-extra-links"><a href="https://revelacode-frontend.onrender.com/" target="_blank" rel="noopener">Live platform ↗</a><a href="https://github.com/musombi123/RevelaCode-Frontend" target="_blank" rel="noopener">Frontend ↗</a><a href="https://github.com/musombi123/RevelaCode-Backend" target="_blank" rel="noopener">Backend ↗</a></div></article>' +
      '<article class="portfolio-extra-card"><span class="portfolio-extra-label">AI · PRODUCT</span><h3>RevelaAI</h3><p>AI-assisted research, scripture study, writing, analysis and developer workflows within the RevelaCode ecosystem.</p><div class="portfolio-extra-links"><a href="https://revelaai.onrender.com/" target="_blank" rel="noopener">AI workspace ↗</a><a href="https://github.com/musombi123/RevelaAI" target="_blank" rel="noopener">Engineering repo ↗</a></div></article>' +
      '<article class="portfolio-extra-card"><span class="portfolio-extra-label">RESEARCH · EXPERIMENTAL</span><h3>VORAX</h3><p>A capability-and-evidence-gated research system exploring V-Lang, shared runtime, remote learning proposals and verification before promotion.</p><div class="portfolio-extra-links"><a href="https://github.com/musombi123/Revelacode123" target="_blank" rel="noopener">GitHub Home ↗</a><a href="https://huggingface.co/Musombi" target="_blank" rel="noopener">Hugging Face ↗</a><a href="https://www.kaggle.com/musombiwilliam" target="_blank" rel="noopener">Kaggle ↗</a></div></article>' +
      '<article class="portfolio-extra-card"><span class="portfolio-extra-label">GAME TECHNOLOGY · IN DEVELOPMENT</span><h3>NEXORA Foundry</h3><p>Procedural world-building and creator-controlled game production with a browser prototype and a separate native pipeline in development.</p><div class="portfolio-extra-links"><a href="nexora.html">Studio overview ↗</a><a href="procedural-game-foundry.html#preview">Try browser preview ↗</a><a href="https://github.com/musombi123/Procedural-Game-Foundry" target="_blank" rel="noopener">Source repo ↗</a><a href="https://github.com/musombi123/Nexora_Windows" target="_blank" rel="noopener">Windows app repo ↗</a></div></article>' +
      '<article class="portfolio-extra-card"><span class="portfolio-extra-label">MOBILE · RELEASES</span><h3>RevelaCode Android</h3><p>Android companion for the RevelaCode product ecosystem. Release status and download availability are maintained in the source repository.</p><div class="portfolio-extra-links"><a href="https://github.com/musombi123/RevelaCode-Android" target="_blank" rel="noopener">Android repo & releases ↗</a></div></article>' +
      '<article class="portfolio-extra-card"><span class="portfolio-extra-label">SECURITY · LOCAL-FIRST</span><h3>Digital Forensics & Field Kit</h3><p>Browser-local evidence inventory, SHA-256 integrity workflows, structured case notes and defensive-analysis guides.</p><div class="portfolio-extra-links"><a href="forensics.html">Forensics Centre ↗</a><a href="fieldkit.html">Browser Workbench ↗</a><a href="guides.html">Technical guides ↗</a></div></article>';
      engineering.prepend(cards);
    }
    const contact = document.querySelector("#contact .socials");
    if (contact && !document.getElementById("portfolio-message-links")) {
      const group = document.createElement("div"); group.id="portfolio-message-links"; group.className="portfolio-message-links";
      group.innerHTML='<a class="portfolio-contact-button" href="'+wa+'">WhatsApp · message ready</a><a class="portfolio-contact-button" href="'+mail("Portfolio contact")+'">Email · draft ready</a><a class="portfolio-contact-button" href="'+teams+'">Microsoft Teams · open chat</a><button class="portfolio-contact-button portfolio-messenger" type="button">Facebook Messenger · copy message</button><p class="portfolio-message-note">Each contact option opens the relevant app with a suggested message. Facebook Messenger does not reliably support prefilled message text, so this button copies the message before opening Messenger.</p>';
      contact.parentNode.insertBefore(group,contact);
      group.querySelector(".portfolio-messenger").addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(message); } catch {}
        window.open(fb,"_blank","noopener,noreferrer");
      });
    }
    if (!document.getElementById("portfolio-quick-links")) {
      const footer = document.querySelector(".foot .wrap");
      if (footer) { const links=document.createElement("div"); links.id="portfolio-quick-links"; links.innerHTML='<a href="research-centre.html">Research Centre</a> · <a href="team.html">Join the team</a>'; footer.prepend(links); }
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addLinks, {once:true}); else addLinks();
})();