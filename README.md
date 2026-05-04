# Lenskart AIR — Scroll-Driven Product Landing Page

A premium, scroll-driven product landing page for the **Lenskart AIR** eyewear collection. Built as a frontend assignment/showcase, the page replicates the feel of a high-end product launch experience — with smooth scroll animations, a canvas-based frame-sequence product animation, video backgrounds, and a fully responsive layout.

**Live Site:** [https://lenskart-air-landing.vercel.app](https://lenskart-air-landing.vercel.app)  
**Vercel Project:** [https://vercel.com/prodcastmediaa-1840s-projects/lenskart-air-landing](https://vercel.com/prodcastmediaa-1840s-projects/lenskart-air-landing)  
**GitHub Repo:** [https://github.com/prodcastmediaa-cyber/lenskart-air-landing](https://github.com/prodcastmediaa-cyber/lenskart-air-landing)

---

## What We Built

The page is designed to feel like a native Apple-style product storytelling experience — where the product reveals itself as you scroll. The centerpiece is a **145-frame canvas animation** of the Lenskart AIR glasses, synced to the user's scroll position so the frame literally comes to life as you scroll down.

Beyond the canvas sequence, the page has:

- A **loading screen** with a real progress bar tied to frame preloading
- A **hero section** with a video background and staggered entrance animation
- A **brand story** section
- **USP blocks** showcasing key features (featherweight, unbreakable hinge, etc.)
- A **pinned product section** with 3 text overlay panels driven by GSAP ScrollTrigger
- A **UGC (User-Generated Content) grid** for social proof
- A **CTA section** to drive conversion
- A fully functional **hamburger menu** for mobile

---

## Tech Stack

| Layer | Tool |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | CSS3 — custom properties, Grid, Flexbox |
| Animation | GSAP 3 + ScrollTrigger plugin |
| Smooth Scroll | Lenis |
| Frame Rendering | Native Canvas API |
| Fonts | Syne (display) · DM Sans (body) via Google Fonts |
| Hosting | Vercel |

No build tools, no frameworks, no bundlers. Pure HTML/CSS/JS delivered directly to the browser.

---

## How We Made It

### 1. Frame Extraction

We extracted **145 sequential JPG frames** from a product video of the Lenskart AIR glasses. These frames were renamed `frame_0001.jpg` through `frame_0145.jpg` and placed in the `/frames` directory. Each frame is ~25KB, making the total sequence lightweight enough to preload in the browser.

### 2. Canvas Animation System

The canvas rendering is the core of the page. Here's how it works:

- On page load, the JS kicks off a **two-phase preload**:
  - **Phase 1** loads the first 14 frames before the canvas section is shown — so there's no blank flash when the user scrolls to it.
  - **Phase 2** loads the remaining 131 frames in the background while the user reads the earlier sections.
- A **progress bar** in the loader reflects the real loading state.
- Once GSAP ScrollTrigger fires as the user scrolls into the product section, it maps the scroll progress (0–1) to a frame index and draws that frame onto the canvas.
- The canvas renderer also **samples the four corners** of each frame to dynamically set the section's background color — giving a seamless blended look.

```js
// Simplified version of how scroll drives the frame
onUpdate: (self) => {
  const frameIndex = Math.min(
    Math.floor(self.progress * totalFrames),
    totalFrames - 1
  );
  renderFrame(frameIndex);
}
```

### 3. GSAP + ScrollTrigger Pinning

The product section is **pinned** for 700vh of scroll — meaning the canvas stays fixed in the viewport while the user scrolls through 7 screen-heights worth of content. Three text overlay blocks animate in and out at specific scroll positions using `data-enter` and `data-leave` attributes defined directly in the HTML, making the animation data-driven and easy to tune.

### 4. Lenis Smooth Scroll

We integrated **Lenis** for buttery smooth scrolling. Lenis intercepts the native scroll event, applies custom easing, and then passes the real scroll position to GSAP's ScrollTrigger via a `requestAnimationFrame` loop — so both systems stay in sync.

```js
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
```

### 5. Hero Entrance Animation

On page load (after the loader exits), a staggered GSAP timeline reveals the hero text word-by-word using `splitText`-style span wrapping. Words slide up from below with a slight stagger, creating a cinematic reveal effect.

### 6. Styling Approach

The CSS uses **custom properties (CSS variables)** for the entire color palette and spacing system, making it easy to theme. Key design decisions:

- `--navy` and `--white` are the core brand colors
- `Syne` is used for all display/heading text — it has a geometric, premium feel
- `DM Sans` is used for body copy — clean and readable
- The layout uses **CSS Grid** for the UGC section and **Flexbox** for headers and USP blocks
- Two responsive breakpoints: `900px` (tablet) and `480px` (mobile)

### 7. Deployment

The project is a **static site** — no server, no backend. We pushed the repo to GitHub and connected it to **Vercel** for zero-config deployment. Vercel detects it as a static site and serves it directly from their edge network.

---

## Project Structure

```
lenskart-air-landing/
├── index.html          # Single-page markup
├── css/
│   └── style.css       # All styles (~25KB)
├── js/
│   └── app.js          # All animation + scroll logic (~12KB)
├── frames/
│   ├── frame_0001.jpg  # 145 sequential product frames
│   ├── frame_0002.jpg
│   └── ...
├── arms-break-1.mp4    # Product feature video clip 1
├── arms-break-2.mp4    # Product feature video clip 2
└── .gitignore
```

---

## Running Locally

No install required. Just clone and open:

```bash
git clone https://github.com/prodcastmediaa-cyber/lenskart-air-landing.git
cd lenskart-air-landing
```

Then open `index.html` in a browser. For best results (to avoid CORS issues with local file loading), serve it with a simple local server:

```bash
# Python
python3 -m http.server 3000

# Node (if you have npx)
npx serve .
```

Then visit `http://localhost:3000`.

---

## Key Design Decisions

- **No framework** — kept the dependency footprint to zero. GSAP and Lenis are loaded from CDN. Everything else is vanilla.
- **Two-phase frame loading** — prevents a blank canvas if the user scrolls fast, without blocking the initial page load.
- **Data-driven text overlays** — `data-enter` / `data-leave` attributes on each text block make it easy to tune scroll timing without touching JS.
- **Dynamic background color from canvas frames** — instead of a static background, the page samples corner pixels of each rendered frame and blends them into the section background, keeping the visual cohesive as the glasses rotate.
- **Vercel static hosting** — no build step, instant deploys on every push to `main`.
