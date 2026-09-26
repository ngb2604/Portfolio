
    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    // Portrait carousel
    const portrait = document.querySelector<HTMLElement>(".portrait");
    if (!portrait) throw new Error("Portrait carousel is missing from the page.");
    const portraitTrack = portrait.querySelector<HTMLElement>(".portrait-track");
    const portraitSlides = [...portrait.querySelectorAll<HTMLDivElement>(".portrait-slide")];
    const portraitDots = portrait.querySelector<HTMLElement>(".portrait-dots");
    const portraitStatus = portrait.querySelector<HTMLElement>(".portrait-status");
    if (!portraitTrack || !portraitDots || !portraitStatus) throw new Error("Portrait carousel markup is incomplete.");
    let portraitIndex = 0;
    let portraitTimer: number | undefined;
    let portraitStartX = 0;

    portraitSlides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = "portrait-dot";
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Show portrait ${index + 1}`);
      dot.addEventListener("click", () => showPortrait(index));
      portraitDots.append(dot);
    });

    function showPortrait(index: number) {
      portraitIndex = (index + portraitSlides.length) % portraitSlides.length;
      portraitTrack!.style.transform = `translateX(-${portraitIndex * 100}%)`;
      portraitSlides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === portraitIndex));
      [...portraitDots!.children].forEach((dot, dotIndex) => {
        const active = dotIndex === portraitIndex;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-selected", String(active));
      });
      portraitStatus!.textContent = `${String(portraitIndex + 1).padStart(2, "0")} / ${String(portraitSlides.length).padStart(2, "0")}`;
    }

    function startPortraitAutoplay() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      clearInterval(portraitTimer);
      portraitTimer = setInterval(() => showPortrait(portraitIndex + 1), 5000);
    }

    portrait.querySelector<HTMLButtonElement>(".prev")?.addEventListener("click", () => { showPortrait(portraitIndex - 1); startPortraitAutoplay(); });
    portrait.querySelector<HTMLButtonElement>(".next")?.addEventListener("click", () => { showPortrait(portraitIndex + 1); startPortraitAutoplay(); });
    portrait.addEventListener("mouseenter", () => clearInterval(portraitTimer));
    portrait.addEventListener("mouseleave", startPortraitAutoplay);
    portrait.addEventListener("focusin", () => clearInterval(portraitTimer));
    portrait.addEventListener("focusout", startPortraitAutoplay);
    portraitTrack.addEventListener("touchstart", (event: TouchEvent) => { portraitStartX = event.changedTouches[0].screenX; }, { passive:true });
    portraitTrack.addEventListener("touchend", (event: TouchEvent) => {
      const distance = event.changedTouches[0].screenX - portraitStartX;
      if (Math.abs(distance) > 45) showPortrait(portraitIndex + (distance < 0 ? 1 : -1));
      startPortraitAutoplay();
    }, { passive:true });
    showPortrait(0);
    startPortraitAutoplay();

    // Active navigation
    const sections = [...document.querySelectorAll<HTMLElement>("section[id]")];
    const navLinks = [...document.querySelectorAll<HTMLAnchorElement>("nav a[href^='#']")];
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(s => navObserver.observe(s));

    // Subtle interactive particle field
    const canvas = document.querySelector<HTMLCanvasElement>("#particles");
    if (!canvas) throw new Error("Particle canvas is missing from the page.");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas rendering is unavailable.");
    type Particle = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: Particle[] = [];
    let mouse = { x: innerWidth / 2, y: innerHeight / 2 };

    function resize() {
      canvas!.width = innerWidth * devicePixelRatio;
      canvas!.height = innerHeight * devicePixelRatio;
      canvas!.style.width = innerWidth + "px";
      canvas!.style.height = innerHeight + "px";
      ctx!.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
      particles = Array.from({ length: Math.min(95, Math.floor(innerWidth / 14)) }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - .5) * .25,
        vy: (Math.random() - .5) * .25,
        r: Math.random() * 1.5 + .3
      }));
    }
    function draw() {
      ctx!.clearRect(0,0,innerWidth,innerHeight);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const alpha = Math.max(.08, .35 - d / 500);
        ctx!.beginPath(); ctx!.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx!.fillStyle = `rgba(94,231,255,${alpha})`; ctx!.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dist = Math.hypot(p.x-q.x,p.y-q.y);
          if (dist < 105) {
            ctx!.beginPath(); ctx!.moveTo(p.x,p.y); ctx!.lineTo(q.x,q.y);
            ctx!.strokeStyle = `rgba(94,231,255,${.07*(1-dist/105)})`;
            ctx!.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    }
    addEventListener("resize", resize);
    addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    resize(); draw();
  
