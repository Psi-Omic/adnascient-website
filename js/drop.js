// ── SCROLL ANIMATION: blood drop → phone report ───────
// Plays once when the U-Check strip section scrolls into view.
// Pure canvas 2D, kept subtle (low opacity, background layer).
(function () {
  const canvas = document.getElementById('drop-canvas');
  const section = document.getElementById('ucheck-strip');
  if (!canvas || !section || typeof gsap === 'undefined') return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = section.clientWidth;
    height = section.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const TEAL = '94, 240, 216';
  const LILAC = '201, 184, 240';

  // Animation state, driven by a single 0→1 progress value
  const state = { progress: 0 };

  function drawDrop(progress) {
    // Phase 1 (0 - 0.45): drop falls from top to a "test strip" point
    const dropStartY = height * 0.08;
    const dropEndY = height * 0.5;
    const dropX = width * 0.22;

    const dropPhase = Math.min(progress / 0.45, 1);
    const y = dropStartY + (dropEndY - dropStartY) * easeInQuad(dropPhase);

    if (progress < 0.5) {
      const r = 7 + Math.sin(dropPhase * Math.PI) * 1.5;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${TEAL}, ${0.5 * (1 - dropPhase * 0.3)})`;
      ctx.shadowColor = `rgba(${TEAL}, 0.4)`;
      ctx.shadowBlur = 12;
      // teardrop shape
      ctx.moveTo(dropX, y - r * 1.6);
      ctx.bezierCurveTo(dropX + r, y - r * 0.3, dropX + r, y + r, dropX, y + r);
      ctx.bezierCurveTo(dropX - r, y + r, dropX - r, y - r * 0.3, dropX, y - r * 1.6);
      ctx.fill();
    }

    // Splash ripple once drop "lands" (around progress 0.42-0.55)
    if (progress > 0.4 && progress < 0.65) {
      const rippleP = (progress - 0.4) / 0.25;
      const rippleR = rippleP * 30;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${TEAL}, ${0.4 * (1 - rippleP)})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
      ctx.ellipse(dropX, dropEndY, rippleR, rippleR * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawPhone(progress) {
    // Phase 2 (0.5 - 1.0): phone outline draws in + report bars rise
    if (progress < 0.48) return;
    const phoneP = Math.min((progress - 0.48) / 0.52, 1);

    const pw = 90, ph = 170;
    const px = width * 0.68 - pw / 2;
    const py = height * 0.5 - ph / 2;
    const radius = 14;

    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(${LILAC}, ${0.35 * easeOutQuad(phoneP)})`;
    ctx.lineWidth = 2;
    roundRect(ctx, px, py, pw, ph, radius);
    ctx.stroke();

    // Screen content: report bars rising
    if (phoneP > 0.3) {
      const barsP = Math.min((phoneP - 0.3) / 0.7, 1);
      const barCount = 3;
      const barW = 14;
      const gap = 10;
      const baseX = px + 16;
      const baseY = py + ph - 24;
      const maxBarH = [40, 65, 50];

      for (let i = 0; i < barCount; i++) {
        const delay = i * 0.15;
        const localP = Math.max(0, Math.min((barsP - delay) / (1 - delay), 1));
        const h = maxBarH[i] * easeOutQuad(localP);
        const x = baseX + i * (barW + gap);
        ctx.fillStyle = i === 1
          ? `rgba(${TEAL}, ${0.45 * localP})`
          : `rgba(${LILAC}, ${0.3 * localP})`;
        ctx.fillRect(x, baseY - h, barW, h);
      }

      // Small checkmark glow once bars settle
      if (barsP > 0.85) {
        const checkP = (barsP - 0.85) / 0.15;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${TEAL}, ${0.6 * checkP})`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const cx = px + pw - 22, cy = py + 18;
        ctx.moveTo(cx - 6, cy);
        ctx.lineTo(cx - 1, cy + 5);
        ctx.lineTo(cx + 7, cy - 6);
        ctx.stroke();
      }
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function easeInQuad(t) { return t * t; }
  function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

  function render() {
    ctx.clearRect(0, 0, width, height);
    drawDrop(state.progress);
    drawPhone(state.progress);
  }

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(state, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'bottom 40%',
        scrub: 0.6,
      },
      onUpdate: render,
    });
  }

  render();
})();
