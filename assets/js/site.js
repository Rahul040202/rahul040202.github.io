const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pageTitles = {
  home: 'Rahul G | Machine Learning Engineer',
  work: 'Experience | Rahul G',
  projects: 'Projects | Rahul G',
  writing: 'Writing | Rahul G',
  about: 'About | Rahul G',
  contact: 'Contact | Rahul G'
};

function route() {
  const requested = location.hash.replace('#/', '') || 'home';
  const page = pageTitles[requested] ? requested : 'home';
  document.querySelectorAll('.page').forEach(element => element.classList.toggle('active', element.id === `page-${page}`));
  document.querySelectorAll('.nav-links a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#/${page}`));
  document.title = pageTitles[page];
  scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();

const phrases = [
  'LLM-powered applications.',
  'Agentic AI workflows.',
  'Computer Vision systems.',
  'End-to-end ML products.'
];
const typedText = document.querySelector('#typed-text');
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;
function type() {
  const phrase = phrases[phraseIndex];
  if (reducedMotion) { typedText.textContent = phrase; return; }
  charIndex += deleting ? -1 : 1;
  typedText.textContent = phrase.slice(0, charIndex);
  let delay = deleting ? 34 : 66;
  if (!deleting && charIndex === phrase.length) { deleting = true; delay = 1500; }
  else if (deleting && charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 300; }
  setTimeout(type, delay);
}
type();

document.querySelector('#theme-toggle').addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('portfolio-theme', nextTheme);
});
document.querySelector('#year').textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const canvas = document.querySelector('#network');
const context = canvas.getContext('2d');
const layerSizes = [4, 6, 7, 6, 3];
let width = 0;
let height = 0;
let nodes = [];
let pulses = [];
let lastPulse = 0;
const randomIndex = length => Math.floor(Math.random() * length);
function resizeNetwork() {
  const ratio = devicePixelRatio || 1;
  width = innerWidth;
  height = innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  nodes = layerSizes.map((count, layer) => Array.from({ length: count }, (_, row) => ({
    x: width * (0.05 + 0.9 * layer / (layerSizes.length - 1)),
    y: height * (0.12 + 0.76 * (row + 0.5) / count),
    phase: Math.random() * Math.PI * 2
  })));
}
function drawNetwork(time) {
  context.clearRect(0, 0, width, height);
  const styles = getComputedStyle(root);
  const color = styles.getPropertyValue('--network').trim();
  const accent = styles.getPropertyValue('--accent2').trim();
  const positions = nodes.map(layer => layer.map(node => [node.x + Math.sin(time / 1500 + node.phase) * 5, node.y + Math.cos(time / 1300 + node.phase) * 5]));
  context.lineWidth = 1;
  context.strokeStyle = `rgba(${color},.11)`;
  for (let layer = 0; layer < positions.length - 1; layer++) {
    positions[layer].forEach(a => positions[layer + 1].forEach(b => {
      context.beginPath(); context.moveTo(a[0], a[1]); context.lineTo(b[0], b[1]); context.stroke();
    }));
  }
  positions.forEach((layer, layerIndex) => layer.forEach((point, rowIndex) => {
    context.beginPath(); context.arc(point[0], point[1], 3.5 + Math.sin(time / 700 + rowIndex + layerIndex) * 0.8, 0, Math.PI * 2);
    context.fillStyle = `rgba(${color},.8)`; context.fill();
  }));
  if (!reducedMotion) {
    if (time - lastPulse > 260 && pulses.length < 26) {
      lastPulse = time;
      pulses.push({ layer: 0, from: randomIndex(layerSizes[0]), to: randomIndex(layerSizes[1]), progress: 0 });
    }
    pulses = pulses.filter(pulse => {
      pulse.progress += 0.018;
      const from = positions[pulse.layer][pulse.from];
      const to = positions[pulse.layer + 1][pulse.to];
      const x = from[0] + (to[0] - from[0]) * pulse.progress;
      const y = from[1] + (to[1] - from[1]) * pulse.progress;
      context.beginPath(); context.arc(x, y, 3, 0, Math.PI * 2); context.fillStyle = accent; context.shadowColor = accent; context.shadowBlur = 14; context.fill(); context.shadowBlur = 0;
      if (pulse.progress >= 1) {
        if (pulse.layer + 2 < positions.length) { pulse.layer++; pulse.from = pulse.to; pulse.to = randomIndex(layerSizes[pulse.layer + 1]); pulse.progress = 0; return true; }
        return false;
      }
      return true;
    });
    requestAnimationFrame(drawNetwork);
  }
}
resizeNetwork();
drawNetwork(0);
addEventListener('resize', () => { resizeNetwork(); if (reducedMotion) drawNetwork(0); });
