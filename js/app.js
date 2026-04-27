/* ═══════════════════════════════════════════
   LENSKART AIR — Landing Page Engine
   ═══════════════════════════════════════════ */

const FRAME_COUNT   = 145;
const FRAME_EXT     = 'jpg';
const IMAGE_SCALE   = 0.88;
const PRELOAD_FIRST = 14;

const frames = new Array(FRAME_COUNT).fill(null);
let currentFrame = 0;
let bgColor = 'rgb(200,212,224)';

const canvas       = document.getElementById('canvas');
const ctx          = canvas.getContext('2d');
const prodSection  = document.getElementById('product-section');
const loaderEl     = document.getElementById('loader');
const loaderBar    = document.getElementById('loader-bar');
const loaderPct    = document.getElementById('loader-pct');

/* ── Canvas resize ── */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawFrame(currentFrame);
}
window.addEventListener('resize', resizeCanvas);

/* ── Draw frame ── */
function drawFrame(index) {
  const img = frames[index];
  if (!img) return;
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/* ── Sample background color from frame corners ── */
function sampleBg(img) {
  try {
    const off = document.createElement('canvas');
    off.width = img.naturalWidth;
    off.height = img.naturalHeight;
    const oc = off.getContext('2d');
    oc.drawImage(img, 0, 0);
    const pts = [
      oc.getImageData(4, 4, 1, 1).data,
      oc.getImageData(img.naturalWidth - 5, 4, 1, 1).data,
      oc.getImageData(4, img.naturalHeight - 5, 1, 1).data,
      oc.getImageData(img.naturalWidth - 5, img.naturalHeight - 5, 1, 1).data,
    ];
    let r = 0, g = 0, b = 0;
    pts.forEach(p => { r += p[0]; g += p[1]; b += p[2]; });
    bgColor = `rgb(${Math.round(r/4)},${Math.round(g/4)},${Math.round(b/4)})`;
  } catch(e) {}
}

/* ── Load a single frame ── */
function loadFrame(i) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      frames[i] = img;
      if (i % 18 === 0) sampleBg(img);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = `frames/frame_${String(i + 1).padStart(4, '0')}.${FRAME_EXT}`;
  });
}

/* ── Two-phase preload ── */
async function preloadAll() {
  const first = [];
  for (let i = 0; i < PRELOAD_FIRST; i++) first.push(loadFrame(i));
  await Promise.all(first);

  resizeCanvas();
  drawFrame(0);

  let loaded = PRELOAD_FIRST;
  const rest = [];
  for (let i = PRELOAD_FIRST; i < FRAME_COUNT; i++) {
    rest.push(loadFrame(i).then(() => {
      loaded++;
      const pct = Math.round((loaded / FRAME_COUNT) * 100);
      loaderBar.style.width = pct + '%';
      loaderPct.textContent = pct + '%';
    }));
  }
  await Promise.all(rest);

  loaderEl.classList.add('hidden');
  setTimeout(() => { loaderEl.style.display = 'none'; }, 750);

  initPage();
}

/* ══════════════════════════════════════════════
   PAGE INIT
══════════════════════════════════════════════ */
function initPage() {
  gsap.registerPlugin(ScrollTrigger);

  /* Lenis smooth scroll */
  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* Header scroll state */
  const header = document.getElementById('site-header');
  lenis.on('scroll', ({ scroll }) => {
    header.classList.toggle('scrolled', scroll > 60);
  });

  heroEntrance();
  initProductSection();
  initSectionAnims();
  initMobileMenu();
}

/* ── Mobile hamburger menu ── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('mobile-menu');
  const close     = document.getElementById('mobile-close');
  const links     = menu.querySelectorAll('.mobile-link');

  function openMenu() {
    menu.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  close.addEventListener('click', closeMenu);
  links.forEach(l => l.addEventListener('click', closeMenu));
}

/* ── Hero entrance ── */
function heroEntrance() {
  const tl = gsap.timeline({ delay: 0.15 });
  tl.to('.h-word', {
    y: 0,
    duration: 1.3,
    stagger: 0.2,
    ease: 'power4.out',
  })
  .to('.hero-sub', {
    opacity: 1, y: 0,
    duration: 1.0,
    ease: 'power3.out',
  }, '-=0.7')
  .to('.hero-ctas', {
    opacity: 1, y: 0,
    duration: 0.9,
    ease: 'power3.out',
  }, '-=0.7')
  .to('.hero-scroll-hint', {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  }, '-=0.4');
}

/* ══════════════════════════════════════════════
   PRODUCT STORYTELLING — pinned scroll section
══════════════════════════════════════════════ */
function initProductSection() {
  resizeCanvas();

  /* Build per-overlay animation timelines */
  const overlays = document.querySelectorAll('.prod-text');
  const statsEl  = document.getElementById('prod-stats');
  const ovlTLs   = new Map();
  const ovlShown = new Map();

  overlays.forEach(el => {
    const children = el.querySelectorAll('.pt-tag, .pt-heading, .pt-body');
    const tl = gsap.timeline({ paused: true });
    tl.from(children, { y: 36, opacity: 0, stagger: 0.1, duration: 0.75, ease: 'power3.out' });
    ovlTLs.set(el, tl);
    ovlShown.set(el, false);
  });

  /* Stats children */
  const statsTL = gsap.timeline({ paused: true });
  statsTL.from('.stats-eyebrow', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' });
  statsTL.from('.stat-item', { y: 50, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' }, '-=0.2');
  let statsShown = false;

  /* Counter state */
  const counters = Array.from(document.querySelectorAll('.stat-num'));
  const counterObjs = counters.map(el => ({ val: 0 }));
  let countersDone = false;

  /* Smooth opacity setter */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothOpacity(p, enter, leave, fadeW = 0.04) {
    if (p < enter - fadeW || p > leave + fadeW) return 0;
    if (p >= enter && p <= leave) return 1;
    if (p < enter) return (p - (enter - fadeW)) / fadeW;
    return 1 - (p - leave) / fadeW;
  }

  /* Counter animation */
  function runCounters() {
    counters.forEach((el, i) => {
      const target   = parseFloat(el.dataset.value);
      const decimals = parseInt(el.dataset.dec || '0');
      gsap.to(counterObjs[i], {
        val: target, duration: 2.4, ease: 'power2.out',
        onUpdate() {
          el.textContent = decimals > 0
            ? counterObjs[i].val.toFixed(decimals)
            : String(Math.round(counterObjs[i].val));
        },
      });
    });
  }

  /* Marquee */
  const marqueeEl = document.getElementById('prod-marquee');
  const marqueeInner = document.getElementById('prod-marquee-inner');
  const MARQ_START = 0.08;
  const MARQ_END   = 0.82;

  /* Main pinned ScrollTrigger */
  const PIN_SCROLL = window.innerHeight * 7; // 700vh of scroll within pin

  ScrollTrigger.create({
    trigger: '#product-wrap',
    pin:        '#product-section',
    pinSpacing: true,
    start:  'top top',
    end:    `+=${PIN_SCROLL}`,
    scrub:  1.8,
    onUpdate(self) {
      const p = self.progress;

      /* Frame scrubbing — full animation plays in first 80% of scroll */
      const index = Math.min(Math.floor(p * FRAME_COUNT), FRAME_COUNT - 1);
      if (index !== currentFrame) {
        currentFrame = index;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }

      /* Text overlays */
      overlays.forEach(el => {
        const enter = parseFloat(el.dataset.enter);
        const leave = parseFloat(el.dataset.leave);
        const opacity = smoothOpacity(p, enter, leave);
        el.style.opacity = opacity;

        if (opacity > 0.05 && !ovlShown.get(el)) {
          ovlShown.set(el, true);
          ovlTLs.get(el).play();
        } else if (opacity < 0.05 && ovlShown.get(el)) {
          ovlShown.set(el, false);
          ovlTLs.get(el).reverse();
        }
      });

      /* Dark overlay */
      const statsEnter = parseFloat(statsEl.dataset.enter);
      const statsLeave = parseFloat(statsEl.dataset.leave);
      const darkOp = smoothOpacity(p, statsEnter, statsLeave, 0.035);
      document.getElementById('prod-overlay').style.opacity = darkOp * 0.9;

      /* Stats */
      const statsOp = smoothOpacity(p, statsEnter, statsLeave, 0.035);
      statsEl.style.opacity = statsOp;
      if (statsOp > 0.1 && !statsShown) {
        statsShown = true;
        statsTL.play();
        if (!countersDone) { countersDone = true; runCounters(); }
      } else if (statsOp < 0.05 && statsShown) {
        statsShown = false;
        statsTL.reverse();
      }

      /* Marquee opacity */
      const marqOp = smoothOpacity(p, MARQ_START, MARQ_END, 0.04);
      marqueeEl.style.opacity = marqOp;

      /* Marquee slide */
      const marqPct = -20 * p;
      marqueeInner.style.transform = `translateX(${marqPct}%)`;
    },
    onRefresh() { resizeCanvas(); },
  });
}

/* ══════════════════════════════════════════════
   SCROLL ANIMATIONS — story, USP, social, CTA
══════════════════════════════════════════════ */
function initSectionAnims() {
  const defaults = { ease: 'power3.out' };

  /* Story heading */
  gsap.to('.story-heading', {
    y: 0, opacity: 1, duration: 1.2, ...defaults,
    scrollTrigger: { trigger: '.story-heading', start: 'top 82%' },
  });
  gsap.to('.story-body p', {
    y: 0, opacity: 1, duration: 1.0, stagger: 0.15, ...defaults,
    scrollTrigger: { trigger: '.story-body', start: 'top 80%' },
  });
  gsap.to('.story-pill', {
    y: 0, opacity: 1, duration: 0.9, ...defaults,
    scrollTrigger: { trigger: '.story-pill', start: 'top 85%' },
  });

  /* USP title */
  gsap.to('.usp-title', {
    y: 0, opacity: 1, duration: 1.1, ...defaults,
    scrollTrigger: { trigger: '.usp-header', start: 'top 80%' },
  });

  /* USP blocks stagger */
  gsap.to('.usp-block', {
    y: 0, opacity: 1, stagger: 0.18, duration: 1.0, ...defaults,
    scrollTrigger: { trigger: '.usp-grid', start: 'top 78%' },
  });

  /* Social header */
  gsap.to('.social-header', {
    y: 0, opacity: 1, duration: 1.1, ...defaults,
    scrollTrigger: { trigger: '.social-header', start: 'top 82%' },
  });

  /* UGC cards */
  gsap.to('.ugc-card', {
    y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ...defaults,
    scrollTrigger: { trigger: '.ugc-grid', start: 'top 80%' },
  });

  /* CTA */
  gsap.to('.cta-inner', {
    y: 0, opacity: 1, duration: 1.2, ...defaults,
    scrollTrigger: { trigger: '.cta-inner', start: 'top 80%' },
  });
}

/* ── Kick off ── */
preloadAll();
