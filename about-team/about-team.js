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
