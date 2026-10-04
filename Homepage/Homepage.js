const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll(".site-nav a").forEach((link) => {
	const scribble = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	scribble.setAttribute("viewBox", "0 0 140 56");
	scribble.setAttribute("preserveAspectRatio", "none");
	scribble.setAttribute("aria-hidden", "true");
	scribble.classList.add("nav-scribble");

	const strokes = [
		"M 13 30 C 11 18, 34 10, 62 10 C 91 8, 123 15, 127 27 C 132 39, 106 47, 77 46 C 48 47, 18 42, 13 30 Z",
		"M 19 25 C 29 12, 55 13, 79 12 C 105 12, 126 20, 121 31 C 116 42, 91 43, 66 44 C 40 45, 20 39, 19 25 Z",
		"M 25 37 C 43 43, 72 39, 94 37 C 109 35, 118 30, 123 25"
	];

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
					duration: 420,
					delay: index * 65,
					easing: "cubic-bezier(0.2, 0.7, 0.25, 1)",
					fill: "forwards"
				}
			);
		});
	}

	function hideScribble() {
		if (link.matches(":hover, :focus-visible")) return;
		scribble.classList.remove("is-active");
	}

	link.addEventListener("pointerenter", drawScribble);
	link.addEventListener("focus", drawScribble);
	link.addEventListener("pointerleave", hideScribble);
	link.addEventListener("blur", hideScribble);
});
