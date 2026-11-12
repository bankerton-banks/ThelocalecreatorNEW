window.LocaleCreator.initializeNavScribbles();

(() => {
  const field = document.querySelector(".shape-field");
  if (!field) return;

  const SHAPE_SETTINGS = [
    { start: [0.04, 0.62], velocity: [15, -10], spin: 5 },
    { start: [0.5, 0.88], velocity: [-12, -14], spin: -4 },
    { start: [0.94, 0.5], velocity: [-17, 11], spin: 6 },
    { start: [0.25, 0.1], velocity: [11, 13], spin: -7 },
    { start: [0.72, 0.15], velocity: [-14, 9], spin: 3 },
    { start: [0.12, 0.95], velocity: [18, -8], spin: 8 },
    { start: [0.6, 0.45], velocity: [-9, -16], spin: -5 },
    { start: [0.85, 0.9], velocity: [13, 12], spin: 4 },
  ];

  const ANGLE_STEP = 23;
  const HIT_RADIUS = 0.35;
  const PUSH_RANGE = 1.15;
  const PUSH_STRENGTH = 30;
  const MAX_FRAME_SECONDS = 0.05;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const shapes = Array.from(field.children).map((element, index) => {
    const settings = SHAPE_SETTINGS[index % SHAPE_SETTINGS.length];
    const [vx, vy] = settings.velocity;

    return {
      element,
      svg: element.querySelector("svg"),
      start: settings.start,
      x: 0,
      y: 0,
      vx,
      vy,
      speed: Math.hypot(vx, vy),
      angle: index * ANGLE_STEP,
      spin: settings.spin,
      size: 0,
      maxX: 0,
      maxY: 0,
    };
  });

  let frame = null;
  let lastTime = null;
  let initialized = false;

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  function paint(shape) {
    shape.element.style.transform = `translate(${shape.x}px, ${shape.y}px)`;
    shape.svg.style.transform = `rotate(${shape.angle}deg)`;
  }

  function measure() {
    shapes.forEach((shape) => {
      shape.size = shape.element.offsetWidth;
      shape.maxX = Math.max(0, field.clientWidth - shape.element.offsetWidth);
      shape.maxY = Math.max(0, field.clientHeight - shape.element.offsetHeight);

      if (initialized) {
        shape.x = Math.min(shape.x, shape.maxX);
        shape.y = Math.min(shape.y, shape.maxY);
      } else {
        shape.x = shape.start[0] * shape.maxX;
        shape.y = shape.start[1] * shape.maxY;
      }

      shape.element.style.left = "0";
      shape.element.style.top = "0";
      shape.element.style.right = "auto";
      paint(shape);
    });

    initialized = true;
  }

  function pushApart(a, b, dt) {
    const dx = b.x + b.size / 2 - (a.x + a.size / 2);
    const dy = b.y + b.size / 2 - (a.y + a.size / 2);
    const distance = Math.hypot(dx, dy) || 0.001;
    const range = (a.size + b.size) * HIT_RADIUS * PUSH_RANGE;
    if (distance >= range) return;

    const push = PUSH_STRENGTH * (1 - distance / range) * dt;
    const nx = dx / distance;
    const ny = dy / distance;

    a.vx -= nx * push;
    a.vy -= ny * push;
    b.vx += nx * push;
    b.vy += ny * push;
  }

  function keepCruisingSpeed(shape) {
    const current = Math.hypot(shape.vx, shape.vy) || 1;
    shape.vx = (shape.vx / current) * shape.speed;
    shape.vy = (shape.vy / current) * shape.speed;
  }

  function softPush(dt) {
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        pushApart(shapes[i], shapes[j], dt);
      }
    }
    shapes.forEach(keepCruisingSpeed);
  }

  function move(shape, dt) {
    shape.x += shape.vx * dt;
    shape.y += shape.vy * dt;

    if (shape.x <= 0 || shape.x >= shape.maxX) {
      shape.x = clamp(shape.x, 0, shape.maxX);
      shape.vx = shape.x <= 0 ? Math.abs(shape.vx) : -Math.abs(shape.vx);
    }

    if (shape.y <= 0 || shape.y >= shape.maxY) {
      shape.y = clamp(shape.y, 0, shape.maxY);
      shape.vy = shape.y <= 0 ? Math.abs(shape.vy) : -Math.abs(shape.vy);
    }

    shape.angle = (shape.angle + shape.spin * dt) % 360;
  }

  function tick(time) {
    const dt =
      lastTime === null
        ? 0
        : Math.min((time - lastTime) / 1000, MAX_FRAME_SECONDS);
    lastTime = time;

    softPush(dt);
    shapes.forEach((shape) => {
      move(shape, dt);
      paint(shape);
    });

    frame = requestAnimationFrame(tick);
  }

  function syncMotion() {
    cancelAnimationFrame(frame);
    lastTime = null;

    if (!reducedMotion.matches && !document.hidden) {
      frame = requestAnimationFrame(tick);
    }
  }

  new ResizeObserver(measure).observe(field);
  reducedMotion.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);

  measure();
  syncMotion();
})();
