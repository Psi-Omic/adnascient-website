// ── SIDE NEON TREE (fixed background, fades after ~1.5 screens) ──
(function () {
  const canvas = document.getElementById('tree-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function branch(x, y, len, angle, depth, lineWidth) {
    if (depth === 0 || len < 5) return;

    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    const spread = 0.4 + Math.random() * 0.25;
    const nextLen = len * (0.74 + Math.random() * 0.07);

    branch(x2, y2, nextLen, angle - spread, depth - 1, lineWidth * 0.78);
    branch(x2, y2, nextLen, angle + spread, depth - 1, lineWidth * 0.78);

    if (Math.random() > 0.65 && depth > 2) {
      branch(x2, y2, nextLen * 0.82, angle + (Math.random() - 0.5) * 0.3, depth - 1, lineWidth * 0.7);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Anchored to the left edge, growing tall enough to span ~1.5x viewport height
    const baseX = width * 0.08;
    const baseY = height * 1.4;
    const trunkLen = height * 0.55;

    ctx.lineCap = 'round';

    ctx.strokeStyle = 'rgba(94, 240, 216, 0.14)';
    ctx.shadowColor = 'rgba(94, 240, 216, 0.22)';
    ctx.shadowBlur = 6;
    branch(baseX, baseY, trunkLen, -Math.PI / 2, 9, 3);

    ctx.strokeStyle = 'rgba(201, 184, 240, 0.10)';
    ctx.shadowColor = 'rgba(201, 184, 240, 0.16)';
    branch(baseX + 14, baseY, trunkLen * 0.95, -Math.PI / 2 + 0.04, 9, 2.4);
  }

  resize();
  window.addEventListener('resize', resize);

  // Fade the tree out as the user scrolls past roughly 1.5 viewport heights
  function updateFade() {
    const fadeDistance = window.innerHeight * 1.5;
    const progress = Math.min(window.scrollY / fadeDistance, 1);
    canvas.style.opacity = String(0.55 * (1 - progress));
  }
  window.addEventListener('scroll', updateFade, { passive: true });
  updateFade();
})();
