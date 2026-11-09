(() => {
  "use strict";
  const doc=document, root=doc.documentElement, body=doc.body;
  const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const path=(window.location.pathname.split("/").pop()||"index.html").toLowerCase();
  const page=["index.html","forensics.html","fieldkit.html","guides.html"].includes(path)?path:"index.html";
  root.classList.add("site-js");
  body.classList.add("site-page","site-page-"+page.replace(".html",""));

  const storage={
    get(key){try{return localStorage.getItem(key)}catch{return null}},
    set(key,value){try{localStorage.setItem(key,value)}catch{}}
  };
  const validTheme=(value)=>["dark","light","system"].includes(value);
  let theme=validTheme(storage.get("theme"))?storage.get("theme"):"system";
  const systemTheme=window.matchMedia?.("(prefers-color-scheme: dark)");
  const isDark=()=>theme==="dark"||(theme==="system"&&Boolean(systemTheme?.matches));
  const applyTheme=()=>{
    root.dataset.theme=theme;
    root.style.colorScheme=isDark()?"dark":"light";
    const meta=doc.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=isDark()?"#0f172a":"#f8fafc";
    const toggle=doc.querySelector("#site-theme-toggle");
    if(toggle){
      toggle.setAttribute("aria-label",isDark()?"Switch to light theme":"Switch to dark theme");
      toggle.setAttribute("title",isDark()?"Switch to light theme":"Switch to dark theme");
      toggle.innerHTML=isDark()
        ?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path></svg>'
        :'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.7 8.7 0 1 0 20.9 13Z"></path></svg>';
    }
  };
  applyTheme();
  if(systemTheme){
    const sync=()=>{if(theme==="system")applyTheme()};
    if(systemTheme.addEventListener)systemTheme.addEventListener("change",sync);
    else systemTheme.addListener?.(sync);
  }
  window.addEventListener("storage",(event)=>{
    if(event.key==="theme"){theme=validTheme(event.newValue)?event.newValue:"system";applyTheme()}
  });

  let skip=doc.querySelector(".skip");
  if(!skip){
    skip=doc.createElement("a");
    skip.className="site-skip";
    skip.href="#main";
    skip.textContent="Skip to content";
  }
  if(!skip.parentNode)body.insertBefore(skip,body.firstChild);
  skip.classList.add("site-skip");
  const mainLandmark=doc.querySelector("main");
  if(mainLandmark&&!mainLandmark.id)mainLandmark.id="main";
  if(mainLandmark)skip.href="#"+mainLandmark.id;
  const progress=doc.createElement("div");
  progress.className="site-progress";
  progress.setAttribute("aria-hidden","true");
  doc.querySelector(".progress")?.remove();
  skip.after(progress);

  // Each page owns its visible header/navigation. Do not inject a second
  // global header over the homepage navigation or specialist page heroes.
  doc.querySelector(".fieldkit-topnav")?.classList.add("site-legacy-topnav");
  const localNavs=[...doc.querySelectorAll("body > nav:not(.site-primary-nav), .forensics-nav")];
  localNavs.forEach((nav)=>{
    nav.classList.add("site-local-nav");
    nav.setAttribute("aria-label",nav.getAttribute("aria-label")||"On this page");
  });

  const backTop=doc.createElement("button");
  backTop.className="site-back-top";
  backTop.type="button";
  backTop.setAttribute("aria-label","Back to top");
  backTop.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6"></path></svg>';
  body.appendChild(backTop);
  backTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:reduce?"auto":"smooth"}));

  const toast=doc.createElement("div");
  toast.className="site-toast";
  toast.setAttribute("role","status");
  toast.setAttribute("aria-live","polite");
  body.appendChild(toast);
  let toastTimer=null;
  const announce=(message)=>{
    toast.textContent=message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer=window.setTimeout(()=>toast.classList.remove("is-visible"),2400);
  };

  let scrollPending=false;
  const onScroll=()=>{
    if(scrollPending)return;
    scrollPending=true;
    window.requestAnimationFrame(()=>{
      const max=Math.max(1,root.scrollHeight-window.innerHeight);
      const amount=Math.min(1,Math.max(0,window.scrollY/max));
      progress.style.transform="scaleX("+amount+")";
      backTop.classList.toggle("is-visible",window.scrollY>520);
      scrollPending=false;
    });
  };
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll,{passive:true});
  onScroll();

  const sections=[...doc.querySelectorAll("main section[id],main .fieldkit-section[id]")];
  const localLinks=[...doc.querySelectorAll(".site-local-nav a[href^='#']")];
  const localMap=new Map(localLinks.map((anchor)=>[anchor.getAttribute("href").slice(1),anchor]));
  if("IntersectionObserver" in window&&localMap.size){
    const spy=new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        if(!entry.isIntersecting)return;
        localLinks.forEach((anchor)=>{anchor.classList.remove("is-active");anchor.removeAttribute("aria-current")});
        const active=localMap.get(entry.target.id);
        if(active){active.classList.add("is-active");active.setAttribute("aria-current","location")}
      });
    },{rootMargin:"-35% 0px -58% 0px",threshold:0});
    sections.forEach((section)=>spy.observe(section));
  }

  const revealSelector=[
    "main > section",".forensics-content > section",".fieldkit-main > section",
    ".guide-content > section",".card",".capability-card",".skill",".feature",
    ".project-card",".panel",".t-item",".fieldkit-privacy",".fieldkit-download-card",
    ".guide-step-list article",".guide-month-grid article"
  ].join(",");
  const revealNodes=[...new Set(doc.querySelectorAll(revealSelector))];
  if(reduce||!("IntersectionObserver" in window)){
    revealNodes.forEach((node)=>node.classList.add("site-revealed"));
  }else{
    const observer=new IntersectionObserver((entries,instance)=>{
      entries.forEach((entry)=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add("site-revealed");
        instance.unobserve(entry.target);
      });
    },{threshold:.1,rootMargin:"0px 0px -36px 0px"});
    revealNodes.forEach((node,index)=>{
      node.classList.add("site-reveal");
      node.style.setProperty("--site-delay",(index%4*65)+"ms");
      observer.observe(node);
    });
  }

  const heroItems=doc.querySelectorAll(".hero-container,.hero-grid,.forensics-hero > *, .fieldkit-hero-copy > *");
  if(!reduce)[...heroItems].forEach((node,index)=>{
    node.classList.add("site-hero-enter");
    node.style.setProperty("--site-enter-delay",(Math.min(index,7)*85)+"ms");
  });

  const typed=doc.querySelector("#typed,[data-site-typewriter]");
  if(typed){
    let words=[];
    try{words=JSON.parse(typed.dataset.words||typed.dataset.siteTypewriter||"[]")}
    catch{words=String(typed.dataset.words||typed.dataset.siteTypewriter||"").split("|").filter(Boolean)}
    if(words.length){
      if(reduce)typed.textContent=words[0];
      else{
        let wordIndex=0,charIndex=words[0].length,deleting=true,timer=null;
        const tick=()=>{
          const word=words[wordIndex];
          typed.textContent=word.slice(0,charIndex);
          if(!deleting&&charIndex===word.length){deleting=true;timer=window.setTimeout(tick,1500);return}
          if(deleting&&charIndex===0){deleting=false;wordIndex=(wordIndex+1)%words.length}
          charIndex+=deleting?-1:1;
          timer=window.setTimeout(tick,deleting?28:52);
        };
        timer=window.setTimeout(tick,1800);
        window.addEventListener("pagehide",()=>window.clearTimeout(timer),{once:true});
      }
    }
  }

  const counters=[...doc.querySelectorAll("[data-count]")];
  const countUp=(element)=>{
    const target=Number(element.dataset.count);
    if(!Number.isFinite(target))return;
    if(reduce){element.textContent=String(target);return}
    const start=performance.now(),duration=1100;
    const step=(now)=>{
      const progressValue=Math.min(1,(now-start)/duration);
      element.textContent=String(Math.round(target*(1-Math.pow(1-progressValue,3))));
      if(progressValue<1)window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };
  if("IntersectionObserver" in window&&!reduce){
    const observer=new IntersectionObserver((entries,instance)=>{
      entries.forEach((entry)=>{if(entry.isIntersecting){countUp(entry.target);instance.unobserve(entry.target)}});
    },{threshold:.65});
    counters.forEach((node)=>observer.observe(node));
  }else counters.forEach(countUp);

  const copyText=async(value)=>{
    try{
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(value);
      else{
        const field=doc.createElement("textarea");
        field.value=value;field.setAttribute("readonly","");
        field.style.position="fixed";field.style.opacity="0";
        body.appendChild(field);field.select();
        const copied=doc.execCommand("copy");field.remove();
        if(!copied)throw new Error("Clipboard unavailable");
      }
      announce("Copied to clipboard");
    }catch{announce("Copy unavailable in this browser")}
  };
  doc.addEventListener("click",(event)=>{
    const button=event.target.closest("[data-copy],#copyMail,.site-copy-button");
    if(!button)return;
    event.preventDefault();
    const value=button.dataset.copy||(button.id==="copyMail"?"musombiwilliam769@gmail.com":button.dataset.copyTarget?doc.querySelector(button.dataset.copyTarget)?.textContent:"");
    if(value)copyText(value);
  });
  doc.querySelectorAll("pre").forEach((pre)=>{
    if(pre.querySelector(".site-code-copy"))return;
    const button=doc.createElement("button");
    button.type="button";button.className="site-code-copy";button.textContent="Copy";
    button.addEventListener("click",()=>copyText(pre.querySelector("code")?.textContent||pre.textContent));
    pre.appendChild(button);
  });

  let lightbox=doc.querySelector("#lightbox");
  if(lightbox)lightbox.classList.add("site-lightbox");
  else{
    lightbox=doc.createElement("dialog");
    lightbox.id="site-lightbox";lightbox.className="site-lightbox";
    lightbox.innerHTML='<button type="button" class="site-lightbox-close" aria-label="Close image preview">×</button><figure><img alt=""><figcaption></figcaption></figure>';
    body.appendChild(lightbox);
  }
  const lightboxImage=lightbox.querySelector("img");
  const lightboxCaption=lightbox.querySelector("figcaption,p");
  const closeLightbox=()=>{
    if(lightbox.open&&typeof lightbox.close==="function")lightbox.close();
    else lightbox.removeAttribute("open");
  };
  lightbox.querySelector(".lb-close,.site-lightbox-close")?.addEventListener("click",closeLightbox);
  lightbox.addEventListener("click",(event)=>{if(event.target===lightbox)closeLightbox()});
  doc.addEventListener("click",(event)=>{
    const image=event.target.closest(".project-card img,.shot img,.fieldkit-preview img,.screenshot img,.gallery img,figure[data-lightbox] img");
    if(!image||event.target.closest("a"))return;
    const trigger=image.closest("button.shot");
    const source=(trigger&&trigger.dataset.full)||image.currentSrc||image.src;
    if(!source)return;
    event.preventDefault();
    lightboxImage.src=source;
    lightboxImage.alt=(trigger&&trigger.dataset.cap)||image.alt||"Expanded project image";
    if(lightboxCaption)lightboxCaption.textContent=(trigger&&trigger.dataset.cap)||image.dataset.caption||image.alt||"Project preview";
    if(typeof lightbox.showModal==="function")lightbox.showModal();
    else lightbox.setAttribute("open","");
  });

  const year=doc.querySelector("#yr,[data-current-year]");
  if(year)year.textContent=String(new Date().getFullYear());

  const email="musombiwilliam769@gmail.com";
  const contactArea=doc.querySelector("#contact .card,#contact .wrap")||doc.querySelector("#contact");
  if(contactArea&&!doc.querySelector("[data-copy='"+email+"'],#copyMail")){
    const button=doc.createElement("button");
    button.type="button";button.className="site-copy-email";
    button.dataset.copy=email;button.textContent="Copy email";
    contactArea.appendChild(button);
  }

  doc.querySelectorAll('a[target="_blank"]').forEach((anchor)=>{anchor.removeAttribute("target");anchor.removeAttribute("rel")});
  body.classList.add("site-ready");
})();