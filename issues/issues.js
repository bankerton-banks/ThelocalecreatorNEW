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

<<<<<<< HEAD
		// Same hand-drawn loop as the nav bar,
		const scribble = window.LocaleCreator.createScribble({
			label: link.querySelector("img")?.alt || link.getAttribute("href"),
			viewBox: [118, 120],
			radius: [56, 52],
			wobble: [2.5, 2.5],
			squareness: 2.5,
			tiltScale: 0.25,
			className: "thumb-scribble"
		});
		link.append(scribble.element);
=======
    function drawScribble() {
      if (scribble.isShown()) return;
      scribble.draw();
    }
>>>>>>> fdca256f8ddcc619cef7296d43555b531349663a

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

<<<<<<< HEAD
		// --- Select (keeps scribble on, clears the previous one) ---
		function markSelected(instant) {
			document.querySelectorAll(".issue-thumb.is-selected").forEach((other) => {
				if (other === link) return;
				other.classList.remove("is-selected");
				other.removeAttribute("aria-current");
				other.hideScribble();
			});
=======
      link.classList.add("is-selected");
      link.setAttribute("aria-current", "true");
>>>>>>> fdca256f8ddcc619cef7296d43555b531349663a

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
<<<<<<< HEAD


/*
   ISSUE SWITCHING
*/

function showIssue(issueId, instant = false) {
	const sections = [...document.querySelectorAll(".issue-layout")];
	const target = sections.find((section) => section.id === issueId) || sections[0];

	sections.forEach((section) => {
		section.hidden = section !== target;
	});

	const thumb = document.querySelector(`.issue-thumb[href="#${target.id}"]`);
	if (thumb && thumb.markSelected) thumb.markSelected(instant);
}

showIssue(location.hash.slice(1), true);
window.addEventListener("hashchange", () => showIssue(location.hash.slice(1)));


/*
   3. LIGHTBOX
   Open: Click an editorial image
   Prev/next: Arrow keys as buttons
   Click left/right half of the screen: prev/next
   Close: Esc/X
*/

function initializeLightbox() {
	const lightbox = document.querySelector(".lightbox");
	const bigImg = lightbox.querySelector(".lightbox-img");	let current = 0;

	// Pages of the issue that is currently shown
	let pages = [];

	// --- Show a page ---
	function showPage(index) {
		current = (index + pages.length) % pages.length; // wraps from back cover to front
		bigImg.src = pages[current].src;
		bigImg.alt = pages[current].alt;	}

	// --- Open ---
	document.querySelectorAll(".editorial-grid img").forEach((img) => {
		img.addEventListener("click", () => {
			pages = [...img.closest(".editorial-grid").querySelectorAll("img")];
			showPage(pages.indexOf(img));
			lightbox.showModal();
		});
	});

	// --- Prev/next ---
	lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showPage(current - 1));
	lightbox.querySelector(".lightbox-next").addEventListener("click", () => showPage(current + 1));
	lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());


	// Button clicking
	lightbox.addEventListener("click", (event) => {
		if (event.target.closest(".lightbox-btn")) return; // buttons handle themselves

		// Closes area behind page
		if (event.target !== bigImg) {
			lightbox.close();
			return;
		}

		// The page itself: left half goes back, right half goes forward
		if (event.clientX < window.innerWidth / 2) showPage(current - 1);
		else showPage(current + 1);
	});

	// Arrow keys (Esc closes automatically) 
	document.addEventListener("keydown", (event) => {
		if (!lightbox.open) return;
		if (event.key === "ArrowLeft") showPage(current - 1);
		if (event.key === "ArrowRight") showPage(current + 1);
	});
}

=======
showIssue(location.hash.slice(1), true);
window.addEventListener("hashchange", () => showIssue(location.hash.slice(1)));
>>>>>>> fdca256f8ddcc619cef7296d43555b531349663a
initializeLightbox();
