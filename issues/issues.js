window.LocaleCreator.initializeNavScribbles();

function initializeThumbScribbles() {
  document.querySelectorAll(".issue-thumb").forEach((link) => {
    const scribble = window.LocaleCreator.createScribble({
      label: link.querySelector("img")?.alt || link.getAttribute("href"),
      viewBox: [118, 120],
      radius: [56, 52],
      wobble: [2.5, 2.5],
      squareness: 6,
      tiltScale: 0.1,
      className: "thumb-scribble",
    });
    link.append(scribble.element);

    function drawScribble() {
      if (scribble.isShown()) return;
      scribble.draw();
    }

    function hideScribble() {
      const isActive =
        link.matches(":hover, :focus-visible") ||
        link.classList.contains("is-selected");
      if (isActive) return;
      scribble.hide();
    }

    function markSelected(instant) {
      document.querySelectorAll(".issue-thumb.is-selected").forEach((other) => {
        if (other === link) return;
        other.classList.remove("is-selected");
        other.removeAttribute("aria-current");
        other.hideScribble();
      });

      link.classList.add("is-selected");
      link.setAttribute("aria-current", "true");

      if (instant) {
        scribble.show();
      } else {
        drawScribble();
      }
    }

    function selectThumb(event) {
      event.preventDefault();
      const issueId = link.getAttribute("href").slice(1);
      if (!document.getElementById(issueId)) return;

      showIssue(issueId);
      history.replaceState(null, "", `#${issueId}`);
    }

    link.markSelected = markSelected;
    link.hideScribble = () => scribble.hide();

    link.addEventListener("click", selectThumb);
    link.addEventListener("pointerenter", drawScribble);
    link.addEventListener("focus", drawScribble);
    link.addEventListener("pointerleave", hideScribble);
    link.addEventListener("blur", hideScribble);
  });
}

function showIssue(issueId, instant = false) {
  const sections = [...document.querySelectorAll(".issue-layout")];
  const target =
    sections.find((section) => section.id === issueId) || sections[0];

  sections.forEach((section) => {
    section.hidden = section !== target;
  });

  const thumb = document.querySelector(`.issue-thumb[href="#${target.id}"]`);
  thumb?.markSelected?.(instant);
}

function initializeLightbox() {
  const lightbox = document.querySelector(".lightbox");
  const bigImg = lightbox.querySelector(".lightbox-img");
  let pages = [];
  let current = 0;

  function showPage(index) {
    current = (index + pages.length) % pages.length;
    bigImg.src = pages[current].src;
    bigImg.alt = pages[current].alt;
  }

  const showPrevious = () => showPage(current - 1);
  const showNext = () => showPage(current + 1);

  document.querySelectorAll(".editorial-grid img").forEach((img) => {
    img.addEventListener("click", () => {
      pages = [...img.closest(".editorial-grid").querySelectorAll("img")];
      showPage(pages.indexOf(img));
      lightbox.showModal();
    });
  });

  lightbox.querySelector(".lightbox-prev").addEventListener("click", showPrevious);
  lightbox.querySelector(".lightbox-next").addEventListener("click", showNext);
  lightbox
    .querySelector(".lightbox-close")
    .addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    if (event.target.closest(".lightbox-btn")) return;

    if (event.clientX < window.innerWidth / 2) {
      showPrevious();
    } else {
      showNext();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.open) return;
    if (event.key === "ArrowLeft") showPrevious();
    if (event.key === "ArrowRight") showNext();
  });
}

initializeThumbScribbles();
showIssue(location.hash.slice(1), true);
window.addEventListener("hashchange", () => showIssue(location.hash.slice(1)));
initializeLightbox();
