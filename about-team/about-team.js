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

// Redraw one stroke at a time while the other strokes stay visible.
if (teamLink) {
    const arrowPaths = Array.from(teamLink.querySelectorAll('.team-arrow path'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let arrowAnimations = [];

    function animateTeamArrow() {
        arrowAnimations.forEach((animation) => animation.cancel());
        arrowAnimations = [];
        arrowPaths.forEach((path, index) => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = String(length);
            path.style.strokeDashoffset = '0';
            if (reducedMotion.matches) return;
            arrowAnimations.push(path.animate([
                { strokeDashoffset: length, offset: 0 },
                { strokeDashoffset: 0, offset: 1 / arrowPaths.length },
                { strokeDashoffset: 0, offset: 1 }
            ], {
                duration: 1800,
                delay: -index * (1800 / arrowPaths.length),
                iterations: Infinity,
                easing: 'linear'
            }));
        });
    }

    reducedMotion.addEventListener('change', animateTeamArrow);
    animateTeamArrow();
}

