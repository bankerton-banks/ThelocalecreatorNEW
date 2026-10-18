window.LocaleCreator.initializeNavScribbles();

(() => {
    const fall2025Issue = document.querySelector("[data-issue-flip]");
    if (!fall2025Issue || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const fall2025Card = fall2025Issue.querySelector(".issue-flipper-card");
    const fall2025Front = fall2025Issue.querySelector(".issue-flip-front");
    const fall2025Back = fall2025Issue.querySelector(".issue-flip-back");
    if (!fall2025Card || !fall2025Front || !fall2025Back) {
        return;
    }

    let rotation = 0;
    let showingBack = false;

    window.setInterval(() => {
        const nextRotation = rotation + 180;
        const animation = fall2025Card.animate(
            [
                { transform: `rotateY(${rotation}deg)` },
                { transform: `rotateY(${nextRotation}deg)` },
            ],
            { duration: 900, easing: "ease-in-out" }
        );
        animation.onfinish = () => {
            rotation = nextRotation;
            showingBack = !showingBack;
            fall2025Card.style.transform = `rotateY(${rotation}deg)`;
            fall2025Front.setAttribute("aria-hidden", String(showingBack));
            fall2025Back.setAttribute("aria-hidden", String(!showingBack));
        };
    }, 5000);
})();
