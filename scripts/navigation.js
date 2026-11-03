window.LocaleCreator = window.LocaleCreator || {};

window.LocaleCreator.initializeNavScribbles =
  function initializeNavScribbles() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    document.querySelectorAll(".site-nav a").forEach((link) => {
      if (link.querySelector(".nav-scribble")) return;
      if (link.hasAttribute("data-inert")) {
        link.addEventListener("click", (event) => event.preventDefault());
      }
      const isCurrentPage = link.getAttribute("aria-current") === "page";
      // Stable per-label variations give each tab its own continuous scribble.
      const label = link.textContent.trim().toLowerCase();
      const seed = Array.from(label).reduce(
        (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
        7,
      );
      const phase = ((seed % 360) * Math.PI) / 180;
      const tilt = (((seed % 13) - 6) * Math.PI) / 180;
      const loops = 5 + (seed % 3);
      const points = [];
      const steps = loops * 100;
      for (let step = 0; step <= steps; step++) {
        const progress = step / steps;
        // Increasing angles move clockwise in SVG's downward-facing y axis.
        const angle = Math.PI + phase + progress * Math.PI * 2 * loops;
        const radiusX = 54 + 3 * Math.sin(progress * 17 + phase);
        const radiusY = 17 + 2 * Math.cos(progress * 23 + phase);
        const x = radiusX * Math.cos(angle);
        const y = radiusY * Math.sin(angle);
        const px = 70 + x * Math.cos(tilt) - y * Math.sin(tilt);
        const py = 28 + x * Math.sin(tilt) + y * Math.cos(tilt);
        points.push(`${step === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`);
      }
      const strokes = [points.join(" ")];
      const scribble = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      scribble.setAttribute("viewBox", "0 0 140 56");
      scribble.setAttribute("preserveAspectRatio", "none");
      scribble.setAttribute("aria-hidden", "true");
      scribble.classList.add("nav-scribble");

      strokes.forEach((pathData) => {
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute("d", pathData);
        scribble.append(path);
      });

      link.append(scribble);

      const paths = [...scribble.querySelectorAll("path")];
      paths.forEach((path) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
      });

      function drawScribble() {
        if (isCurrentPage) return;
        scribble.classList.add("is-active");

        paths.forEach((path) => {
          const length = path.getTotalLength();
          path.getAnimations().forEach((animation) => animation.cancel());
          path.style.strokeDashoffset = `${length}`;

          if (reducedMotion) {
            path.style.strokeDashoffset = "0";
            return;
          }

          path.animate(
            [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
            {
              duration: loops * 220,
              easing: "linear",
              fill: "forwards",
            },
          );
        });
      }

      function hideScribble() {
        if (isCurrentPage || link.matches(":hover, :focus-visible")) return;
        scribble.classList.remove("is-active");
      }

      if (isCurrentPage) {
        scribble.classList.add("is-active");
        paths.forEach((path) => {
          path.style.strokeDashoffset = "0";
        });
      }
      link.addEventListener("pointerenter", drawScribble);
      link.addEventListener("focus", drawScribble);
      link.addEventListener("pointerleave", hideScribble);
      link.addEventListener("blur", hideScribble);
    });
  };
