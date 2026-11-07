/*
   ISSUES PAGE
   1. Nav scribbles   (from /scripts/navigation.js)
   2. Thumbnail scribbles
   3. Lightbox
*/


/*
   NAV SCRIBBLES
*/

window.LocaleCreator.initializeNavScribbles();


/*
   THUMBNAIL SCRIBBLES
*/

function initializeThumbScribbles() {
	document.querySelectorAll(".issue-thumb").forEach((link) => {

		// Same hand-drawn loop as the nav bar (see /scripts/navigation.js),
		// shaped as a loose rounded rectangle to follow the tall cover.
		const scribble = window.LocaleCreator.createScribble({
			label: link.querySelector("img")?.alt || link.getAttribute("href"),
			viewBox: [118, 144],
			radius: [53, 66],
			wobble: [2.5, 2.5],
			squareness: 6,
			tiltScale: 0.25,
			className: "thumb-scribble"
		});
		link.append(scribble.element);

		function drawScribble() {
			if (scribble.isShown()) return; // selected cover stays drawn
			scribble.draw();
		}

		function hideScribble() {
			if (link.matches(":hover, :focus-visible") || link.classList.contains("is-selected")) return;
			scribble.hide();
		}

		// --- Select (keeps scribble on, clears the previous one) ---
		// instant = true shows it already drawn, like the nav's current page.
		function markSelected(instant) {
			document.querySelectorAll(".issue-thumb.is-selected").forEach((other) => {
				if (other === link) return;
				other.classList.remove("is-selected");
				other.removeAttribute("aria-current");
				other.hideScribble();
			});

			link.classList.add("is-selected");
			link.setAttribute("aria-current", "true");
			if (instant) scribble.show();
			else drawScribble();
		}

		function selectThumb(event) {
			event.preventDefault();
			const issueId = link.getAttribute("href").slice(1);
			if (!document.getElementById(issueId)) return; // no pages for this cover yet
			showIssue(issueId);
			history.replaceState(null, "", "#" + issueId);
		}

		link.markSelected = markSelected;
		link.hideScribble = () => scribble.hide();

		// --- Events ---
		link.addEventListener("click", selectThumb);
		link.addEventListener("pointerenter", drawScribble);
		link.addEventListener("focus", drawScribble);
		link.addEventListener("pointerleave", hideScribble);
		link.addEventListener("blur", hideScribble);
	});
}

initializeThumbScribbles();


/*
   ISSUE SWITCHING
   Shows one .issue-layout at a time. The homepage links to
   issues.html#issue-1 / #issue-2 to open a specific issue.
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
   Close: Esc/X/clicking the dimmed area
*/

function initializeLightbox() {
	const lightbox = document.querySelector(".lightbox");
	const bigImg = lightbox.querySelector(".lightbox-img");
	let current = 0;

	// Pages of the issue that is currently shown
	let pages = [];

	// --- Show a page ---
	function showPage(index) {
		current = (index + pages.length) % pages.length; // wraps from back cover to front
		bigImg.src = pages[current].src;
		bigImg.alt = pages[current].alt;
	}

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

	// --- Close on backdrop click ---
	lightbox.addEventListener("click", (event) => {
		if (event.target === lightbox) lightbox.close();
	});

	// --- Arrow keys (Esc closes automatically) ---
	document.addEventListener("keydown", (event) => {
		if (!lightbox.open) return;
		if (event.key === "ArrowLeft") showPage(current - 1);
		if (event.key === "ArrowRight") showPage(current + 1);
	});
}

initializeLightbox();
