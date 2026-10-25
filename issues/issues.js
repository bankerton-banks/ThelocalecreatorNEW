window.LocaleCreator.initializeNavScribbles();

// Thumbnail scribble: two closed loops shaped for a portrait cover.
// The viewBox matches the scribble box (cover + 18px), so the loops aren't stretched.
function initializeThumbScribbles() {
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const strokes = [
		"M 20 6 C 50 2, 90 3, 108 8 C 116 12, 115 40, 114 72 C 113 105, 116 130, 106 138 C 85 143, 40 142, 14 137 C 4 132, 5 100, 4 70 C 3 40, 2 14, 14 7 C 22 3, 38 4, 52 5",
		"M 112 50 C 113 85, 114 120, 104 134 C 80 140, 38 139, 16 134 C 7 128, 8 95, 7 66 C 6 38, 7 14, 18 10 C 45 6, 85 7, 104 11 C 112 15, 111 32, 112 62"
	];

	document.querySelectorAll(".issue-thumb").forEach((link) => {
		const scribble = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		scribble.setAttribute("viewBox", "0 0 118 144");
		scribble.setAttribute("preserveAspectRatio", "none");
		scribble.setAttribute("aria-hidden", "true");
		scribble.classList.add("thumb-scribble");

		strokes.forEach((pathData) => {
			const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
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
			scribble.classList.add("is-active");

			paths.forEach((path, index) => {
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
						duration: 520,
						delay: index * 90,
						easing: "cubic-bezier(0.2, 0.7, 0.25, 1)",
						fill: "forwards"
					}
				);
			});
		}

		function hideScribble() {
			if (link.matches(":hover, :focus-visible") || link.classList.contains("is-selected")) return;
			scribble.classList.remove("is-active");
		}

		// Clicking keeps this scribble on and clears the previously selected thumbnail
		function selectThumb(event) {
			event.preventDefault();

			document.querySelectorAll(".issue-thumb.is-selected").forEach((other) => {
				if (other === link) return;
				other.classList.remove("is-selected");
				other.removeAttribute("aria-current");
				other.querySelector(".thumb-scribble").classList.remove("is-active");
			});

			link.classList.add("is-selected");
			link.setAttribute("aria-current", "true");
		}

		link.addEventListener("click", selectThumb);
		link.addEventListener("pointerenter", drawScribble);
		link.addEventListener("focus", drawScribble);
		link.addEventListener("pointerleave", hideScribble);
		link.addEventListener("blur", hideScribble);
	});
}

initializeThumbScribbles();
