window.LocaleCreator = window.LocaleCreator || {};

/*
   SHARED SCRIBBLE
   One hand-drawn pink loop style used across the site
   (nav links, issue cover thumbnails, ...).

   createScribble(options) returns:
     element        the <svg> to append
     draw()         animate the pen going round
     show()         show it fully drawn, no animation
     hide()         hide it
     isShown()      whether it is visible

   options:
     label       text used to give each scribble its own stable wobble
     viewBox     [width, height] of the drawing area
     radius      [x, y] size of the loop
     wobble      [x, y] how much each loop drifts in and out
     squareness  2 = oval, higher = rounder rectangle
     tiltScale   1 = full random tilt, 0 = no tilt
     className   CSS class for the <svg>
*/
window.LocaleCreator.createScribble = function createScribble({
  label,
  viewBox,
  radius,
  wobble,
  squareness = 2,
  tiltScale = 1,
  className,
}) {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Stable per-label variations give each scribble its own continuous path.
  const seed = Array.from(label.trim().toLowerCase()).reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    7,
  );
  const phase = ((seed % 360) * Math.PI) / 180;
  const tilt = ((((seed % 13) - 6) * Math.PI) / 180) * tiltScale;
  const loops = 5 + (seed % 3);

  const [width, height] = viewBox;
  const centerX = width / 2;
  const centerY = height / 2;
  // Bends a circle toward a rounded rectangle (exponent 1 = plain oval).
  const shape = (value) =>
    Math.sign(value) * Math.abs(value) ** (2 / squareness);

  const points = [];
  const steps = loops * 100;
  for (let step = 0; step <= steps; step++) {
    const progress = step / steps;
    // Increasing angles move clockwise in SVG's downward-facing y axis.
    const angle = Math.PI + phase + progress * Math.PI * 2 * loops;
    const radiusX = radius[0] + wobble[0] * Math.sin(progress * 17 + phase);
    const radiusY = radius[1] + wobble[1] * Math.cos(progress * 23 + phase);
    const x = radiusX * shape(Math.cos(angle));
    const y = radiusY * shape(Math.sin(angle));
    const px = centerX + x * Math.cos(tilt) - y * Math.sin(tilt);
    const py = centerY + x * Math.sin(tilt) + y * Math.cos(tilt);
    points.push(`${step === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`);
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add(className);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", points.join(" "));
  svg.append(path);

  // Hide the stroke until it's drawn. Length is measured lazily because
  // the SVG must be in the page before getTotalLength() works.
  let length = null;
  function prepare() {
    if (length === null) {
      length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
    }
    path.getAnimations().forEach((animation) => animation.cancel());
  }

  return {
    element: svg,
    draw() {
      prepare();
      svg.classList.add("is-active");
      path.style.strokeDashoffset = `${length}`;
      if (reducedMotion) {
        path.style.strokeDashoffset = "0";
        return;
      }
      path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
        duration: loops * 220,
        easing: "linear",
        fill: "forwards",
      });
    },
    show() {
      prepare();
      path.style.strokeDashoffset = "0";
      svg.classList.add("is-active");
    },
    hide() {
      svg.classList.remove("is-active");
    },
    isShown() {
      return svg.classList.contains("is-active");
    },
  };
};

/*
   NAV SCRIBBLES
*/
window.LocaleCreator.initializeNavScribbles =
  function initializeNavScribbles() {
    document.querySelectorAll(".site-nav a").forEach((link) => {
      if (link.querySelector(".nav-scribble")) return;
      if (link.hasAttribute("data-inert")) {
        link.addEventListener("click", (event) => event.preventDefault());
      }
      const isCurrentPage = link.getAttribute("aria-current") === "page";

      const scribble = window.LocaleCreator.createScribble({
        label: link.textContent,
        viewBox: [140, 56],
        radius: [54, 17],
        wobble: [3, 2],
        className: "nav-scribble",
      });
      link.append(scribble.element);

      if (isCurrentPage) {
        scribble.show();
        return;
      }

      function hideScribble() {
        if (link.matches(":hover, :focus-visible")) return;
        scribble.hide();
      }

      link.addEventListener("pointerenter", scribble.draw);
      link.addEventListener("focus", scribble.draw);
      link.addEventListener("pointerleave", hideScribble);
      link.addEventListener("blur", hideScribble);
    });
  };
