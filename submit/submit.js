window.LocaleCreator.initializeNavScribbles();

(() => {
    const field = document.querySelector('.shape-field');
    if (!field) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const starts = [[0.04, 0.62], [0.5, 0.88], [0.94, 0.5]];
    const shapes = Array.from(field.children).map((element, index) => ({
        element, svg: element.querySelector('svg'), x: 0, y: 0,
        vx: [15, -12, -17][index], vy: [-10, -14, 11][index],
        angle: index * 23, spin: [5, -4, 6][index], maxX: 0, maxY: 0,
    }));
    let frame = null;
    let lastTime = null;
    let initialized = false;
    function paint(shape) {
        shape.element.style.transform = `translate(${shape.x}px, ${shape.y}px)`;
        shape.svg.style.transform = `rotate(${shape.angle}deg)`;
    }
    function measure() {
        shapes.forEach((shape, index) => {
            shape.maxX = Math.max(0, field.clientWidth - shape.element.offsetWidth);
            shape.maxY = Math.max(0, field.clientHeight - shape.element.offsetHeight);
            shape.x = initialized ? Math.min(shape.x, shape.maxX) : starts[index][0] * shape.maxX;
            shape.y = initialized ? Math.min(shape.y, shape.maxY) : starts[index][1] * shape.maxY;
            shape.element.style.left = '0';
            shape.element.style.top = '0';
            shape.element.style.right = 'auto';
            paint(shape);
        });
        initialized = true;
    }
    function tick(time) {
        const dt = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, .05);
        lastTime = time;
        shapes.forEach((shape) => {
            shape.x += shape.vx * dt;
            shape.y += shape.vy * dt;
            if (shape.x <= 0 || shape.x >= shape.maxX) {
                shape.x = Math.max(0, Math.min(shape.x, shape.maxX));
                shape.vx = shape.x <= 0 ? Math.abs(shape.vx) : -Math.abs(shape.vx);
            }
            if (shape.y <= 0 || shape.y >= shape.maxY) {
                shape.y = Math.max(0, Math.min(shape.y, shape.maxY));
                shape.vy = shape.y <= 0 ? Math.abs(shape.vy) : -Math.abs(shape.vy);
            }
            shape.angle = (shape.angle + shape.spin * dt) % 360;
            paint(shape);
        });
        frame = requestAnimationFrame(tick);
    }
    function syncMotion() {
        cancelAnimationFrame(frame);
        lastTime = null;
        if (!reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(tick);
    }
    new ResizeObserver(measure).observe(field);
    reducedMotion.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    measure();
    syncMotion();
})();
