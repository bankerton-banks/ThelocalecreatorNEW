window.LocaleCreator.initializeNavScribbles();

(() => {
  const track = document.querySelector(".issues");
  const controls = document.querySelector(".carousel-controls");
  if (!track || !controls) return;

  const SWIPE_THRESHOLD = 40;

  const cards = Array.from(track.children);
  const previousButton = controls.querySelector("[data-issue-prev]");
  const nextButton = controls.querySelector("[data-issue-next]");
  const position = controls.querySelector("[data-issue-position]");
  let current = 0;
  let touchStart = null;

  function update() {
    cards.forEach((card, index) => {
      const depth = (index - current + cards.length) % cards.length;
      card.dataset.depth = depth;
      card.setAttribute("aria-hidden", String(depth !== 0));
    });

    const card = cards[current];
    const title =
      card.querySelector("figcaption")?.textContent || card.textContent.trim();
    position.textContent = `${title} · ${current + 1} / ${cards.length}`;
  }

  function go(direction) {
    current = (current + direction + cards.length) % cards.length;
    update();
  }

  function handleKeydown(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    go(event.key === "ArrowRight" ? 1 : -1);
  }

  function handleTouchStart(event) {
    touchStart = event.touches.length === 1 ? event.touches[0] : null;
  }

  function handleTouchEnd(event) {
    if (!touchStart) return;

    const dx = event.changedTouches[0].clientX - touchStart.clientX;
    const dy = event.changedTouches[0].clientY - touchStart.clientY;
    const isHorizontalSwipe =
      Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy);
    if (isHorizontalSwipe) go(dx < 0 ? 1 : -1);

    touchStart = null;
  }

  function handleTouchCancel() {
    touchStart = null;
  }

  previousButton.addEventListener("click", () => go(-1));
  nextButton.addEventListener("click", () => go(1));
  track.addEventListener("keydown", handleKeydown);
  track.addEventListener("touchstart", handleTouchStart, { passive: true });
  track.addEventListener("touchend", handleTouchEnd, { passive: true });
  track.addEventListener("touchcancel", handleTouchCancel, { passive: true });

  track.classList.add("is-gallery");
  track.setAttribute(
    "aria-label",
    "Issue gallery. Use left and right arrow keys to browse.",
  );
  controls.hidden = false;
  update();
})();
