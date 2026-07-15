/* vincenzo.dev — progressive enhancement only.
   The page works with JS disabled; everything here is polish. */

// ---------- Antigravity hero background ----------
const antigravityCanvas = document.querySelector(".hero-antigravity");

if (antigravityCanvas && window.Antigravity && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  new Antigravity(antigravityCanvas, {
    count: 180,
    magnetRadius: 10,
    ringRadius: 10,
    waveSpeed: 0.4,
    waveAmplitude: 1,
    particleSize: 0.9,
    lerpSpeed: 0.1,
    color: "#95bf47",
    opacity: 0.28,
    autoAnimate: false,
    particleVariance: 1,
    rotationSpeed: 0,
    depthFactor: 1,
    pulseSpeed: 3,
    particleShape: "capsule",
    fieldStrength: 10
  });
}

// ---------- Mobile menu ----------
const menuToggle = document.querySelector(".menu-toggle");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  });

  // Close the menu after choosing a section
  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ---------- Marquee: duplicate the track so translateX(-50%) loops seamlessly ----------
const marqueeTrack = document.querySelector(".marquee-track");

if (marqueeTrack) {
  marqueeTrack.innerHTML += marqueeTrack.innerHTML;
}

// ---------- Reveal fallback ----------
// Reveals are pure CSS scroll-driven animations where supported;
// this IntersectionObserver covers the remaining browsers.
const supportsScrollTimeline = CSS.supports("animation-timeline: view()");
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!supportsScrollTimeline && !prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
} else if (!supportsScrollTimeline) {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}
