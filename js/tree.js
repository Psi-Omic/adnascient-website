// ── SUBTLE NEON TREE (background accent, hero) ────────
// A faint branching "tree of life" line-art rendered behind the DNA helix.
// Kept very low-opacity and static-ish so it reads as ambience, not a focal point.
(function () {
  const canvas = document.getElementById('tree-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  let width, height, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Recursive branch generator
  function branch(x, y, len, angle, depth, lineWidth) {
    if (depth === 0 || len < 4) return;

    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    const spread = 0.45 + Math.random() * 0.25;
    const nextLen = len * (0.72 + Math.random() * 0.08);

    branch(x2, y2, nextLen, angle - spread, depth - 1, lineWidth * 0.78);
    branch(x2, y2, nextLen, angle + spread, depth - 1, lineWidth * 0.78);

    // Occasional extra middle branch for organic asymmetry
    if (Math.random() > 0.6 && depth > 2) {
      branch(x2, y2, nextLen * 0.8, angle + (Math.random() - 0.5) * 0.3, depth - 1, lineWidth * 0.7);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const baseX = width * 0.5;
    const baseY = height * 0.98;
    const trunkLen = height * 0.22;

    ctx.strokeStyle = 'rgba(94, 240, 216, 0.16)';
    ctx.shadowColor = 'rgba(94, 240, 216, 0.25)';
    ctx.shadowBlur = 6;
    ctx.lineCap = 'round';

    branch(baseX, baseY, trunkLen, -Math.PI / 2, 7, 2.2);

    // Second pass in lilac, slightly offset, for depth
    ctx.strokeStyle = 'rgba(201, 184, 240, 0.10)';
    ctx.shadowColor = 'rgba(201, 184, 240, 0.18)';
    branch(baseX + 12, baseY, trunkLen * 0.95, -Math.PI / 2 + 0.05, 7, 1.8);
  }

  // Seeded so it doesn't redraw randomly every frame — draw once, redraw on resize
  draw();
  window.addEventListener('resize', () => {
    resize();
    draw();
  });
})();
