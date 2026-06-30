// ── FULL-PAGE DNA DOUBLE HELIX (Three.js, fixed background) ──
(function () {
  const canvas = document.getElementById('dna-canvas');
  if (!canvas || !window.THREE) return;

  let width = window.innerWidth;
  let height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 2000);
  camera.position.set(0, 0, 20);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const lilac = 0xc9b8f0;
  const teal = 0x5ef0d8;

  const helixGroup = new THREE.Group();
  scene.add(helixGroup);

  const RADIUS = 4.5;
  const HEIGHT = 60;        // tall enough to feel like it spans the page
  const TURNS = 9;
  const SEGMENTS = 420;
  const RUNG_COUNT = 60;

  function strandPoint(t, offset) {
    const angle = t * TURNS * Math.PI * 2 + offset;
    const x = Math.cos(angle) * RADIUS;
    const y = (t - 0.5) * HEIGHT;
    const z = Math.sin(angle) * RADIUS;
    return new THREE.Vector3(x, y, z);
  }

  function buildStrand(offset, color) {
    const points = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      points.push(strandPoint(i / SEGMENTS, offset));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, SEGMENTS, 0.16, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.55,
    });
    return new THREE.Mesh(tubeGeo, tubeMat);
  }

  helixGroup.add(buildStrand(0, lilac));
  helixGroup.add(buildStrand(Math.PI, teal));

  // Base-pair rungs connecting the two strands at intervals
  const rungMat = new THREE.MeshBasicMaterial({
    color: 0x9b88c9,
    transparent: true,
    opacity: 0.28,
  });
  for (let i = 0; i <= RUNG_COUNT; i++) {
    const t = i / RUNG_COUNT;
    const pA = strandPoint(t, 0);
    const pB = strandPoint(t, Math.PI);
    const dist = pA.distanceTo(pB);
    const mid = pA.clone().lerp(pB, 0.5);

    const rungGeo = new THREE.CylinderGeometry(0.05, 0.05, dist, 6);
    const rung = new THREE.Mesh(rungGeo, rungMat);
    rung.position.copy(mid);
    rung.lookAt(pB);
    rung.rotateX(Math.PI / 2);
    helixGroup.add(rung);

    // small glowing nodes at each strand point for a "nucleotide" feel
    const nodeGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const nodeA = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: lilac, transparent: true, opacity: 0.7 }));
    nodeA.position.copy(pA);
    helixGroup.add(nodeA);
    const nodeB = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: teal, transparent: true, opacity: 0.7 }));
    nodeB.position.copy(pB);
    helixGroup.add(nodeB);
  }

  helixGroup.rotation.z = 0.25;
  // Position so it's visible off to the side, not blocking text
  helixGroup.position.x = 6.5;

  // Ambient particles
  const particleCount = 90;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = RADIUS + 3 + Math.random() * 5;
    const angle = Math.random() * Math.PI * 2;
    particlePositions[i * 3] = helixGroup.position.x + Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * HEIGHT * 1.1;
    particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: lilac,
    size: 0.07,
    transparent: true,
    opacity: 0.35,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Scroll-driven vertical travel through the helix + continuous rotation
  let scrollY = window.scrollY;
  let targetScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  });

  let mouseX = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);

    scrollY += (targetScrollY - scrollY) * 0.06;
    const docHeight = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const scrollProgress = scrollY / docHeight; // 0 -> 1

    helixGroup.rotation.y += 0.0025;
    // Travel the camera up through the helix as the user scrolls
    helixGroup.position.y = scrollProgress * HEIGHT * 0.7 - HEIGHT * 0.1;
    particles.position.y = helixGroup.position.y;

    camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.02;
    camera.lookAt(helixGroup.position.x, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);
})();
