window.LocaleCreator.initializeNavScribbles();

const fall2025Issue = document.querySelector("[data-issue-flip]");

if (fall2025Issue) {
    const fall2025Card = fall2025Issue.querySelector(".issue-flipper-card");
    const fall2025Front = fall2025Issue.querySelector(".issue-flip-front");
    const fall2025Back = fall2025Issue.querySelector(".issue-flip-back");
    let rotation = 0;

    window.setInterval(() => {
        const isFlipped = fall2025Issue.classList.toggle("is-flipped");
        rotation += isFlipped ? 180 : -180;
        fall2025Card.style.transform = `rotateY(${rotation}deg)`;
        fall2025Front.setAttribute("aria-hidden", String(isFlipped));
        fall2025Back.setAttribute("aria-hidden", String(!isFlipped));
    }, 5000);
}
