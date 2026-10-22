window.LocaleCreator.initializeNavScribbles();

const teamLink = document.querySelector(".team-link");
const teamTitle = document.querySelector("#team-title");
let scrollAnimationFrame;

teamLink?.addEventListener("click", (event) => {
  if (!teamTitle) return;

  event.preventDefault();
  window.history.pushState(null, "", teamLink.hash);

  const start = window.scrollY;
  const distance = teamTitle.getBoundingClientRect().top;
  const duration = 900;
  const startTime = performance.now();
  window.cancelAnimationFrame(scrollAnimationFrame);

  function animateScroll(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const easedProgress = 1 - (1 - progress) ** 3;

    window.scrollTo(0, start + distance * easedProgress);

    if (progress < 1) {
      scrollAnimationFrame = window.requestAnimationFrame(animateScroll);
    }
  }

  scrollAnimationFrame = window.requestAnimationFrame(animateScroll);
});

// Keep the drawn arrow intact; a seamless ink pass travels along its strokes.
if (teamLink) {
  const arrow = teamLink.querySelector(".team-arrow");
  const basePaths = Array.from(arrow.querySelectorAll("path"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animations = [];
  let overlays = [];

  function animateTeamArrow() {
    animations.forEach((animation) => animation.cancel());
    overlays.forEach((path) => path.remove());
    animations = [];
    overlays = [];
    basePaths.forEach((path, index) => {
      path.style.opacity = reducedMotion.matches ? "1" : ".65";
      if (reducedMotion.matches) return;
      const overlay = path.cloneNode(true);
      const length = path.getTotalLength();
      overlay.style.opacity = "1";
      overlay.style.strokeDasharray = `${length * 0.35} ${length * 0.65}`;
      arrow.append(overlay);
      overlays.push(overlay);
      // Moving by exactly one dash period makes the loop boundary seamless.
      animations.push(
        overlay.animate(
          [{ strokeDashoffset: 0 }, { strokeDashoffset: -length }],
          {
            duration: 1800,
            delay: -index * 360,
            iterations: Infinity,
            easing: "linear",
          },
        ),
      );
    });
  }
  reducedMotion.addEventListener("change", animateTeamArrow);
  animateTeamArrow();
}
