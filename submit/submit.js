window.LocaleCreator.initializeNavScribbles();

(() => {
  const field = document.querySelector(".shape-field");
  if (!field) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const starts = [
    [0.04, 0.62],
    [0.5, 0.88],
    [0.94, 0.5],
    [0.25, 0.1],
    [0.72, 0.15],
    [0.12, 0.95],
    [0.6, 0.45],
    [0.85, 0.9],
  ];
  const velocities = [
    [15, -10],
    [-12, -14],
    [-17, 11],
    [11, 13],
    [-14, 9],
    [18, -8],
    [-9, -16],
    [13, 12],
  ];
  const spins = [5, -4, 6, -7, 3, 8, -5, 4];
  const shapes = Array.from(field.children).map((element, index) => ({
    element,
    svg: element.querySelector("svg"),
    x: 0,
    y: 0,
    vx: velocities[index % velocities.length][0],
    vy: velocities[index % velocities.length][1],
    angle: index * 23,
    spin: spins[index % spins.length],
    maxX: 0,
    maxY: 0,
    size: 0,
  }));
  shapes.forEach((shape) => {
    shape.speed = Math.hypot(shape.vx, shape.vy);
  });

  const PUSH_RANGE = 1.15;
  const PUSH_STRENGTH = 30;
  function softPush(dt) {
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const a = shapes[i];
        const b = shapes[j];
        const ra = a.size * 0.35;
        const rb = b.size * 0.35;
        const dx = b.x + b.size / 2 - (a.x + a.size / 2);
        const dy = b.y + b.size / 2 - (a.y + a.size / 2);
        const distance = Math.hypot(dx, dy) || 0.001;
        const range = (ra + rb) * PUSH_RANGE;
        if (distance >= range) continue;
        const push = PUSH_STRENGTH * (1 - distance / range) * dt;
        const nx = dx / distance;
        const ny = dy / distance;
        a.vx -= nx * push;
        a.vy -= ny * push;
        b.vx += nx * push;
        b.vy += ny * push;
      }
    }
    shapes.forEach((shape) => {
      const current = Math.hypot(shape.vx, shape.vy) || 1;
      shape.vx = (shape.vx / current) * shape.speed;
      shape.vy = (shape.vy / current) * shape.speed;
    });
  }
  let frame = null;
  let lastTime = null;
  let initialized = false;
  function paint(shape) {
    shape.element.style.transform = `translate(${shape.x}px, ${shape.y}px)`;
    shape.svg.style.transform = `rotate(${shape.angle}deg)`;
  }
  function measure() {
    shapes.forEach((shape, index) => {
      shape.size = shape.element.offsetWidth;
      shape.maxX = Math.max(0, field.clientWidth - shape.element.offsetWidth);
      shape.maxY = Math.max(0, field.clientHeight - shape.element.offsetHeight);
      shape.x = initialized
        ? Math.min(shape.x, shape.maxX)
        : starts[index % starts.length][0] * shape.maxX;
      shape.y = initialized
        ? Math.min(shape.y, shape.maxY)
        : starts[index % starts.length][1] * shape.maxY;
      shape.element.style.left = "0";
      shape.element.style.top = "0";
      shape.element.style.right = "auto";
      paint(shape);
    });
    initialized = true;
  }
  function tick(time) {
    const dt = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    softPush(dt);
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
    if (!reducedMotion.matches && !document.hidden)
      frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(measure).observe(field);
  reducedMotion.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);
  measure();
  syncMotion();
})();
