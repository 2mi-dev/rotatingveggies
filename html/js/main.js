// ===== Rotating Veggies – Single Script (kein ES-Module) =====

// --- Daten + Helpers ---
const VEGGIES = [
  { key: "broccoli",     label: "Broccoli",      weight: 6 },
  { key: "carrot",       label: "Carrot",        weight: 6 },
  { key: "carrot_gold",  label: "Golden Carrot", weight: 1 },
  { key: "cauliflower",  label: "Cauliflower",   weight: 6 },
  { key: "tomato",       label: "Tomato",        weight: 6 },
  { key: "cucumber",     label: "Cucumber",      weight: 6 },
  { key: "pea_pod",      label: "Pea pod",       weight: 6 },
  { key: "corn",         label: "Corn",          weight: 6 },
  { key: "eggplant",     label: "Eggplant",      weight: 6 },
  { key: "lettuce",      label: "Lettuce",       weight: 6 },
  { key: "potato",       label: "Potato",        weight: 6 },
  { key: "pumpkin",      label: "Pumpkin",       weight: 6 },
  { key: "radish",       label: "Radish",        weight: 6 },
  { key: "salsify",      label: "Salsify",       weight: 6 },
  { key: "red_pepper",   label: "Pepper",        weight: 6 },
  { key: "red_chili",    label: "Chili",         weight: 6 },
  { key: "green_bean",   label: "Green bean",    weight: 6 },
  { key: "butternut",    label: "Butternut",     weight: 6 },
  { key: "beetroot",     label: "Beetroot",      weight: 6 },
  { key: "parsnip",      label: "Parsnip",       weight: 6 },
  { key: "fennel",       label: "Fennel",        weight: 6 },
  { key: "spinach",      label: "Spinach",       weight: 6 },
  { key: "celery",       label: "Celery",        weight: 6 },
  { key: "garlic",       label: "Garlic",        weight: 6 },
  { key: "ginger",       label: "Ginger",        weight: 6 },
  { key: "avocado",      label: "Avocado",       weight: 6 },
  { key: "mushroom",     label: "Mushroom",      weight: 6 },
  { key: "artichoke",    label: "Artichoke",     weight: 6 },
  { key: "radicchio",    label: "Radicchio",     weight: 6 },
  { key: "chard",        label: "Chard",         weight: 6 },
  { key: "asparagus",    label: "Asparagus",     weight: 6 },
  { key: "onion",        label: "Onion",         weight: 6 },
  { key: "red_onion",    label: "Red onion",     weight: 6 },
  { key: "leek",         label: "Leek",          weight: 6 }
];

const fileFor = (key) => `assets/pixel_${key}_128.png`;
const isGoldenKey = (key) => key === "carrot_gold";

function pickWeighted(list) {
  const total = list.reduce((s, v) => s + (v.weight || 1), 0);
  let r = Math.random() * total;
  for (const v of list) { r -= (v.weight || 1); if (r < 0) return v; }
  return list[0];
}

// (Optional) Preload – schadet nicht
(function preload() {
  const head = document.head;
  VEGGIES.forEach(v => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = fileFor(v.key);
    head.appendChild(link);
  });
})();

// --- DOM Refs ---
const stage    = document.getElementById('stage');
const sprite   = document.getElementById('sprite');
const headline = document.getElementById('headline');

// --- State ---
let inBurst = false;

// --- Funktionen ---
function showVeggie(veggie) {
  // Fallback, falls ein einzelnes Asset fehlt
  sprite.onerror = () => {
    console.warn('Fehlendes Asset:', sprite.src);
    sprite.onerror = null; // Endlosschleife vermeiden
    sprite.src = fileFor('broccoli');
  };

  sprite.src   = fileFor(veggie.key);
  sprite.alt   = veggie.label;
  sprite.title = veggie.label;

  const golden = isGoldenKey(veggie.key);
  headline.style.display = golden ? "block" : "none";

  const dir = Math.random() < 0.5 ? 1 : -1;
  document.documentElement.style.setProperty("--dir", dir);

  if (golden && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sprite.addEventListener('click', onGoldenClick, { once: true });
  }
}

function onGoldenClick() {
  if (inBurst) return;
  inBurst = true;
  spawnGoldenBurst(() => { inBurst = false; });
}

function applyStageSize() {
  const vw = Math.min(window.innerWidth, window.screen.width || window.innerWidth);
  const vh = Math.min(window.innerHeight, window.screen.height || window.innerHeight);
  const vminPx = Math.min(vw, vh) * 0.78;
  const size = Math.min(vminPx, 520);
  stage.style.width = size + 'px';
}

function wobbleStart() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let t = 0;
  (function wobble() {
    t += 0.016;
    const wob = 0.08;
    sprite.style.translate = `${Math.sin(t * 2.1) * wob * 6}px ${Math.cos(t * 1.8) * wob * 5}px`;
    requestAnimationFrame(wobble);
  })();
}

// --- Golden Carrot Burst (Canvas) ---
function spawnGoldenBurst(onEnd) {
  const canvas = document.createElement('canvas');
  canvas.id = 'burst';
  stage.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 3);

  function resizeCanvas() {
    const rect = stage.getBoundingClientRect();
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  resizeCanvas();
  addEventListener('resize', resizeCanvas, { passive:true });

  const img = new Image();
  img.src = fileFor('carrot_gold');

  img.onload = () => startBurst(img);
  if (img.complete) startBurst(img);

  function startBurst(image) {
    const rect = stage.getBoundingClientRect();
    const origin = { x: rect.width / 2, y: rect.height / 2 };

    const count = 90;
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 180 + Math.random() * 220;
      particles.push({
        x: origin.x, y: origin.y,
        vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        life: 0, ttl: 900 + Math.random()*400,
        size: 10 + Math.random()*12,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 3.0
      });
    }

    let prev = performance.now();
    function tick(now) {
      const dt = Math.min(50, now - prev);
      prev = now;

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      let alive = 0;
      for (const p of particles) {
        p.life += dt; if (p.life > p.ttl) continue;
        const drag = 0.998; p.vx *= drag; p.vy *= drag;
        p.x += (p.vx * dt) / 1000; p.y += (p.vy * dt) / 1000;
        p.rot += p.vr * (dt / 1000);

        const t = p.life / p.ttl;
        const alpha = 1 - t*t;
        if (alpha <= 0) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(image, -p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();
        alive++;
      }

      if (alive > 0) requestAnimationFrame(tick);
      else {
        canvas.remove();
        removeEventListener('resize', resizeCanvas);
        if (onEnd) onEnd();
      }
    }
    requestAnimationFrame(tick);
  }
}

// --- Boot ---
(function boot(){
  applyStageSize();
  addEventListener('resize', applyStageSize, { passive: true });
  addEventListener('orientationchange', applyStageSize);

  showVeggie(pickWeighted(VEGGIES));

  sprite.addEventListener('click', () => {
    if (!inBurst) showVeggie(pickWeighted(VEGGIES));
  });

  wobbleStart();
})();
