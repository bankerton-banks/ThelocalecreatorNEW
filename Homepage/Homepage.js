window.LocaleCreator.initializeNavScribbles();

(() => {
    const track = document.querySelector('.issues');
    const controls = document.querySelector('.carousel-controls');
    if (!track || !controls) return;
    const cards = Array.from(track.children);
    const previous = controls.querySelector('[data-issue-prev]');
    const next = controls.querySelector('[data-issue-next]');
    const position = controls.querySelector('[data-issue-position]');
    let current = 0;
    const update = () => {
        cards.forEach((card, index) => {
            const depth = (index - current + cards.length) % cards.length;
            card.dataset.depth = depth;
            card.setAttribute('aria-hidden', String(depth !== 0));
        });
        const card = cards[current];
        const title = card.querySelector('figcaption')?.textContent || card.textContent.trim();
        position.textContent = title + ' · ' + (current + 1) + ' / ' + cards.length;
    };
    const go = (direction) => {
        current = (current + direction + cards.length) % cards.length;
        update();
    };
    previous.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        go(event.key === 'ArrowRight' ? 1 : -1);
    });
    let touchStart = null;
    track.addEventListener('touchstart', (event) => {
        touchStart = event.touches.length === 1 ? event.touches[0] : null;
    }, { passive: true });
    track.addEventListener('touchend', (event) => {
        if (!touchStart) return;
        const dx = event.changedTouches[0].clientX - touchStart.clientX;
        const dy = event.changedTouches[0].clientY - touchStart.clientY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        touchStart = null;
    }, { passive: true });
    track.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
    track.classList.add('is-gallery');
    track.setAttribute('aria-label', 'Issue gallery. Use left and right arrow keys to browse.');
    controls.hidden = false;
    update();
})();

