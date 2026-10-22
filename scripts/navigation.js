window.LocaleCreator = window.LocaleCreator || {};

window.LocaleCreator.initializeNavScribbles = function initializeNavScribbles() {
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	function createOvalScribble(label) {
        // Stable variations keep each link's scribble the same on every page.
        const seed = Array.from(label).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
        const phase = (seed % 360) * Math.PI / 180;
        const tilt = ((seed % 11) - 5) * Math.PI / 180;
        const start = Math.PI + phase * 0.3;
        const points = [];
        for (let step = 0; step <= 400; step++) {
            const progress = step / 400;
            const angle = start + progress * Math.PI * 10;
            const radiusX = 55 + 2.2 * Math.sin(progress * 11 + phase);
            const radiusY = 17 + 1.8 * Math.cos(progress * 15 + phase);
            const x = radiusX * Math.cos(angle);
            const y = radiusY * Math.sin(angle);
            const centerX = 70 + 1.3 * Math.sin(progress * 9 + phase);
            const centerY = 28 + 1.1 * Math.cos(progress * 13 + phase);
            const px = centerX + x * Math.cos(tilt) - y * Math.sin(tilt);
            const py = centerY + x * Math.sin(tilt) + y * Math.cos(tilt);
            points.push((step === 0 ? 'M ' : 'L ') + px.toFixed(2) + ' ' + py.toFixed(2));
        }
        return points.join(' ');
    }

	document.querySelectorAll(".site-nav a").forEach((link) => {
        if (link.querySelector(".nav-scribble")) return;
        const isCurrentPage = link.getAttribute("aria-current") === "page";
        const strokes = [createOvalScribble(link.textContent.trim().toLowerCase())];
		const scribble = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		scribble.setAttribute("viewBox", "0 0 140 56");
		scribble.setAttribute("preserveAspectRatio", "none");
		scribble.setAttribute("aria-hidden", "true");
		scribble.classList.add("nav-scribble");

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
						duration: 1100,
						easing: "linear",
						fill: "forwards"
					}
				);
			});
		}

		function hideScribble() {
			if (isCurrentPage || link.matches(":hover, :focus-visible")) return;
			scribble.classList.remove("is-active");
		}

		if (isCurrentPage) {
            scribble.classList.add("is-active");
            paths.forEach((path) => { path.style.strokeDashoffset = "0"; });
        }
        link.addEventListener("pointerenter", drawScribble);
		link.addEventListener("focus", drawScribble);
		link.addEventListener("pointerleave", hideScribble);
		link.addEventListener("blur", hideScribble);
	});
};




