window.LocaleCreator.initializeNavScribbles();

function initializeTeamLinkScroll(teamLink) {
  const teamTitle = document.querySelector("#team-title");
  if (!teamTitle) return;

  const SCROLL_DURATION = 900;
  let scrollAnimationFrame;

  teamLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.history.pushState(null, "", teamLink.hash);

    const start = window.scrollY;
    const distance = teamTitle.getBoundingClientRect().top;
    const startTime = performance.now();

    function animateScroll(time) {
      const progress = Math.min((time - startTime) / SCROLL_DURATION, 1);
      const easedProgress = 1 - (1 - progress) ** 3;

      window.scrollTo(0, start + distance * easedProgress);

      if (progress < 1) {
        scrollAnimationFrame = window.requestAnimationFrame(animateScroll);
      }
    }

    window.cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = window.requestAnimationFrame(animateScroll);
  });
}

function initializeTeamArrow(teamLink) {
  const arrow = teamLink.querySelector(".team-arrow");
  const basePaths = Array.from(arrow.querySelectorAll("path"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const INK_DURATION = 1800;
  const INK_STAGGER = 360;
  const INK_LENGTH = 0.35;

  let animations = [];
  let overlays = [];

  function reset() {
    animations.forEach((animation) => animation.cancel());
    overlays.forEach((overlay) => overlay.remove());
    animations = [];
    overlays = [];
  }

  function addInkPass(path, index) {
    const overlay = path.cloneNode(true);
    const length = path.getTotalLength();

    overlay.style.opacity = "1";
    overlay.style.strokeDasharray = `${length * INK_LENGTH} ${length * (1 - INK_LENGTH)}`;
    arrow.append(overlay);
    overlays.push(overlay);

    const animation = overlay.animate(
      [{ strokeDashoffset: 0 }, { strokeDashoffset: -length }],
      {
        duration: INK_DURATION,
        delay: -index * INK_STAGGER,
        iterations: Infinity,
        easing: "linear",
      },
    );
    animations.push(animation);
  }

  function animateTeamArrow() {
    reset();

    basePaths.forEach((path, index) => {
      if (reducedMotion.matches) {
        path.style.opacity = "1";
        return;
      }
      path.style.opacity = ".65";
      addInkPass(path, index);
    });
  }

  reducedMotion.addEventListener("change", animateTeamArrow);
  animateTeamArrow();
}

const teamLink = document.querySelector(".team-link");
if (teamLink) {
  initializeTeamLinkScroll(teamLink);
  initializeTeamArrow(teamLink);
}
