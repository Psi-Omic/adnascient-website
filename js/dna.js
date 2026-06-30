// ── ROTATING DNA HELIX (Three.js) ─────────────────────
(function () {
  const canvas = document.getElementById('dna-canvas');
  if (!canvas || !window.THREE) return;

  const container = canvas.parentElement;
  let width = container.clientWidth;
  let height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Colors matching brand palette
  const lilac = new THREE.Color(0xc9b8f0);
  const teal = new THREE.Color(0x5ef0d8);

  const helixGroup = new THREE.Group();
  scene.add(helixGroup);

  const RADIUS = 3.2;
  const HEIGHT = 14;
  const TURNS = 3.2;
  const RUNGS = 26;
  const SPHERE_SEG = 12;

  const sphereGeo = new THREE.SphereGeometry(0.16, SPHERE_SEG, SPHERE_SEG);

  function strandPoint(t, offset) {
    const angle = t * TURNS * Math.PI * 2 + offset;
    const x = Math.cos(angle) * RADIUS;
    const y = (t - 0.5) * HEIGHT;
    const z = Math.sin(angle) * RADIUS;
    return new THREE.Vector3(x, y, z);
  }

  // Two backbone strands
  const strandAMat = new THREE.MeshBasicMaterial({ color: lilac, transparent: true, opacity: 0.85 });
  const strandBMat = new THREE.MeshBasicMaterial({ color: teal, transparent: true, opacity: 0.85 });

  for (let i = 0; i <= RUNGS; i++) {
    const t = i / RUNGS;
    const pA = strandPoint(t, 0);
    const pB = strandPoint(t, Math.PI);

    const sphereA = new THREE.Mesh(sphereGeo, strandAMat);
    sphereA.position.copy(pA);
    helixGroup.add(sphereA);

    const sphereB = new THREE.Mesh(sphereGeo, strandBMat);
    sphereB.position.copy(pB);
    helixGroup.add(sphereB);

    // Rung connecting the two strands (every other step, for "base pair" feel)
    if (i % 2 === 0) {
      const rungGeo = new THREE.BufferGeometry().setFromPoints([pA, pB]);
      const rungMat = new THREE.LineBasicMaterial({
        color: 0x9b88c9,
        transparent: true,
        opacity: 0.3,
      });
      const rungLine = new THREE.Line(rungGeo, rungMat);
      helixGroup.add(rungLine);
    }

    // Tube segments along each strand for a "ribbon" feel
    if (i > 0) {
      const tPrev = (i - 1) / RUNGS;
      const prevA = strandPoint(tPrev, 0);
      const prevB = strandPoint(tPrev, Math.PI);

      const lineGeoA = new THREE.BufferGeometry().setFromPoints([prevA, pA]);
      const lineA = new THREE.Line(lineGeoA, new THREE.LineBasicMaterial({ color: lilac, transparent: true, opacity: 0.5 }));
      helixGroup.add(lineA);

      const lineGeoB = new THREE.BufferGeometry().setFromPoints([prevB, pB]);
      const lineB = new THREE.Line(lineGeoB, new THREE.LineBasicMaterial({ color: teal, transparent: true, opacity: 0.5 }));
      helixGroup.add(lineB);
    }
  }

  // Subtle ambient particles around the helix
  const particleCount = 60;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = RADIUS + 2 + Math.random() * 3;
    const angle = Math.random() * Math.PI * 2;
    particlePositions[i * 3] = Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * HEIGHT * 1.3;
    particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xc9b8f0,
    size: 0.05,
    transparent: true,
    opacity: 0.4,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  helixGroup.rotation.z = 0.35;

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    helixGroup.rotation.y += 0.0045;
    particles.rotation.y += 0.0012;

    // Gentle parallax tilt following mouse / touch
    helixGroup.rotation.x += (mouseY * 0.15 - helixGroup.rotation.x) * 0.03;
    camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);
})();
