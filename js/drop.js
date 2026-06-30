// ── SCROLL ANIMATION: red drop falls onto phone → report appears ──
(function () {
  const canvas = document.getElementById('drop-canvas');
  const wrapper = canvas ? canvas.parentElement : null;
  const section = document.getElementById('ucheck-strip');
  if (!canvas || !wrapper || !section || typeof gsap === 'undefined') return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = wrapper.clientWidth;
    height = wrapper.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const RED = '232, 92, 92';
  const TEAL = '94, 240, 216';
  const LILAC = '201, 184, 240';

  const state = { progress: 0 };

  function easeInQuad(t) { return t * t; }
  function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
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

  function render() {
    ctx.clearRect(0, 0, width, height);

    const progress = state.progress;
    const cx = width / 2;

    // Phone geometry — centered
    const pw = Math.min(150, width * 0.4);
    const ph = pw * 1.95;
    const px = cx - pw / 2;
    const py = height / 2 - ph / 2 + 20;
    const radius = 20;

    // Phone always faintly visible as an outline so the composition reads immediately
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(${LILAC}, 0.28)`;
    ctx.lineWidth = 2.5;
    roundRect(ctx, px, py, pw, ph, radius);
    ctx.stroke();
    // notch
    ctx.fillStyle = `rgba(${LILAC}, 0.28)`;
    roundRect(ctx, cx - 16, py + 10, 32, 5, 3);
    ctx.fill();

    // ── Phase 1 (0 - 0.55): red drop falls toward the phone screen
    const dropStartY = -20;
    const dropEndY = py + ph * 0.32;
    const dropPhase = Math.min(progress / 0.55, 1);

    if (progress < 0.58) {
      const y = dropStartY + (dropEndY - dropStartY) * easeInQuad(dropPhase);
      const r = 13 + Math.sin(dropPhase * Math.PI) * 2;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${RED}, 0.9)`;
      ctx.shadowColor = `rgba(${RED}, 0.55)`;
      ctx.shadowBlur = 18;
      ctx.moveTo(cx, y - r * 1.7);
      ctx.bezierCurveTo(cx + r, y - r * 0.2, cx + r, y + r, cx, y + r);
      ctx.bezierCurveTo(cx - r, y + r, cx - r, y - r * 0.2, cx, y - r * 1.7);
      ctx.fill();

      // subtle highlight
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.shadowBlur = 0;
      ctx.ellipse(cx - r * 0.3, y - r * 0.2, r * 0.22, r * 0.32, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Splash ripple once the drop lands on the screen
    if (progress > 0.5 && progress < 0.72) {
      const rippleP = (progress - 0.5) / 0.22;
      ctx.shadowBlur = 0;
      for (let i = 0; i < 2; i++) {
        const delay = i * 0.15;
        const rp = Math.max(0, Math.min((rippleP - delay) / (1 - delay), 1));
        const rippleR = rp * 40;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${RED}, ${0.5 * (1 - rp)})`;
        ctx.lineWidth = 2;
        ctx.ellipse(cx, dropEndY, rippleR, rippleR * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // ── Phase 2 (0.55 - 1.0): report content rises on the phone screen
    if (progress > 0.55) {
      const reportP = Math.min((progress - 0.55) / 0.45, 1);

      // Screen fill (subtle glow as "loading" then "ready")
      ctx.save();
      roundRect(ctx, px + 8, py + 24, pw - 16, ph - 48, 10);
      ctx.clip();
      ctx.fillStyle = `rgba(${TEAL}, ${0.05 * easeOutQuad(reportP)})`;
      ctx.fillRect(px, py, pw, ph);

      // Header label line
      if (reportP > 0.15) {
        const labelP = Math.min((reportP - 0.15) / 0.25, 1);
        ctx.fillStyle = `rgba(${LILAC}, ${0.5 * labelP})`;
        ctx.fillRect(px + 16, py + 34, (pw - 32) * 0.55 * easeOutQuad(labelP), 6);
      }

      // Three report bars, staggered rise
      const barCount = 3;
      const barW = (pw - 32 - (barCount - 1) * 10) / barCount;
      const baseY = py + ph - 36;
      const maxBarH = [ph * 0.22, ph * 0.34, ph * 0.27];
      const barColors = [LILAC, TEAL, LILAC];

      for (let i = 0; i < barCount; i++) {
        const delay = 0.3 + i * 0.12;
        const localP = Math.max(0, Math.min((reportP - delay) / (1 - delay), 1));
        const h = maxBarH[i] * easeOutBack(localP);
        const x = px + 16 + i * (barW + 10);
        ctx.fillStyle = `rgba(${barColors[i]}, ${0.6 * Math.min(localP * 1.5, 1)})`;
        roundRect(ctx, x, baseY - h, barW, Math.max(h, 0), 4);
        ctx.fill();
      }
      ctx.restore();

      // Checkmark badge once report is fully drawn
      if (reportP > 0.85) {
        const checkP = (reportP - 0.85) / 0.15;
        const ccx = px + pw - 26, ccy = py + 26;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${TEAL}, ${0.9 * checkP})`;
        ctx.shadowColor = `rgba(${TEAL}, 0.6)`;
        ctx.shadowBlur = 10;
        ctx.arc(ccx, ccy, 11 * checkP, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(10,10,15,0.9)';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 0;
        ctx.moveTo(ccx - 5, ccy);
        ctx.lineTo(ccx - 1, ccy + 4);
        ctx.lineTo(ccx + 6, ccy - 5);
        ctx.stroke();
      }
    }
  }

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(state, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'bottom 50%',
        scrub: 0.6,
      },
      onUpdate: render,
    });
  }

  render();
})();
