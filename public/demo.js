import { colors } from './assets/colors.js';
import { icons } from './assets/icons.js';
import { sprite } from './assets/sprite.js';

// Save elements we'll need to reference
const dom = {};
[...document.querySelectorAll('body [id]')].forEach((element) => {
  dom[element.id] = element;
});

// Save convenience arrays of keys and values
const colorKeys = Object.keys(colors);
const colorValues = Object.values(colors).map(({ hex }) => hex);
const iconKeys = Object.keys(icons);
const iconValues = Object.values(icons);

// Precompile starting points for various tests
const startArrays = {
  inline: iconValues,
  use: iconKeys.map(
    (key) => `<svg width="24" height="24"><use href="#${key}" /></svg>`
  ),
  useExternal: iconKeys.map(
    (key) =>
      `<svg width="24" height="24"><use href="assets/sprite.svg#${key}" /></svg>`
  ),
  img: iconKeys,
  uri: iconValues,
  png: iconKeys,
  filter: iconKeys.map(
    (key) =>
      `<img src="assets/icons/${key}.svg" alt="${key}" width="24" height="24">`
  ),
  mask: iconKeys.map(
    (key) => `<div style="--icon: url(assets/icons/${key}.svg)">
  <span class="u-hidden-visually">${key}</span>
</div>`
  ),
};

// Optional processing steps for each technique after full array is populated
const postProcesses = {
  img: (key, index) => {
    const color = colorKeys[index % colorKeys.length];
    return `<img src="assets/icons/${key}/${color}.svg" alt="${key}" width="24" height="24">`;
  },
  png: (key, index) => {
    const color = colorKeys[index % colorKeys.length];
    return `<img src="assets/icons/${key}/${color}@2x.png" alt="${key}" width="24" height="24">`;
  },
  uri: (svg, index) => {
    const color = colorValues[index % colorValues.length];
    svg = svg.replace(/^<svg /, `<svg style="fill:${color};stroke:${color};" `);
    // Thanks to: filamentgroup/directory-encoder
    svg = svg
      .replace(/[\t\n\r]/gim, '') // Strip newlines and tabs
      .replace(/\s\s+/g, ' ') // Condense multiple spaces
      .replace(/'/gim, '\\i'); // Normalize quotes
    const encoded = encodeURIComponent(svg)
      .replace(/\(/g, '%28') // Encode brackets
      .replace(/\)/g, '%29');
    const path = `data:image/svg+xml;charset=UTF-8,${encoded}`;
    return `<img src="${path}" alt="" width="24" height="24">`;
  },
};

// Optional image preload paths
const preloads = {
  img: iconKeys
    .map((key) => colorKeys.map((color) => `assets/icons/${key}/${color}.svg`))
    .flat(),
  png: iconKeys
    .map((key) =>
      colorKeys.map((color) => `assets/icons/${key}/${color}@2x.png`)
    )
    .flat(),
  mask: iconKeys.map((key) => `assets/icons/${key}.svg`),
};

// Set color values as CSS custom properties
Object.entries(colors).forEach(([color, { hex, filter }]) => {
  document.documentElement.style.setProperty(`--color-${color}`, hex);
  document.documentElement.style.setProperty(`--filter-${color}`, filter);
});

// Insert SVG sprite into page
document.body.insertAdjacentHTML('afterbegin', sprite);

function preloadImages(paths) {
  const links = paths.map(
    (href) => `<link rel="preload" href="${href}" as="image">`
  );
  document.head.insertAdjacentHTML('beforeend', links.join('\n'));
}

function preloadImagesForTechnique() {
  const { technique } = getOptions();

  if (technique in preloads) {
    preloadImages(preloads[technique]);
    delete preloads[technique]; // Only do this once
  }
}

// https://javascript.info/array-methods#shuffle-an-array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function makeRepetitiveArray(length, values) {
  return Array(Math.ceil(length / values.length))
    .fill(values)
    .flat()
    .slice(0, length);
}

function formatResultTime(time, units = 'ms') {
  return `${parseFloat(time.toFixed(2))} ${units}`;
}

function getOptions() {
  const technique = dom.technique.value;
  const total = parseInt(dom.total.value, 10);
  return { technique, total };
}

function statItemHtml(dt, dd) {
  return `<div class="stats__item">
  <dt>${dt}</dt>
  <dd>${formatResultTime(dd)}</dd>
</div>`;
}

function updateResults(result) {
  const { total } = getOptions();
  const statItems = [
    statItemHtml('Total', result),
    statItemHtml('Per icon', result / total),
  ];

  dom.stats.innerHTML = statItems.join('\n');
  dom.lastRun.innerHTML = new Date().toLocaleTimeString();
}

function runTest() {
  const { technique, total } = getOptions();
  const startArray = startArrays[technique];

  // Clear the output container if it already has children
  dom.output.innerHTML = '';
  dom.output.setAttribute('data-technique', technique);

  // Make and shuffle an array (just to make sure the browser isn't taking
  // shortcuts, but also to make sure the change is noticeable to the viewer)
  let testArray = shuffleArray(makeRepetitiveArray(total, startArray));

  // We postprocess after shuffling so the behavior of the `img` technique
  // doesn't noticeably differ from others.
  if (technique in postProcesses) {
    testArray = testArray.map(postProcesses[technique]);
  }

  const testContent = testArray.join('');

  // We're using `performance.now` instead of `requestAnimationFrame` timestamps
  // because those timestamps are often tethered to the refresh rate of the
  // display, which makes them tricky to reference for very fast paints.
  // @see https://blog.superhuman.com/performance-metrics-for-blazingly-fast-web-apps/
  const startTime = performance.now();

  requestAnimationFrame(() => {
    dom.output.innerHTML = testContent;

    requestAnimationFrame(() => {
      const endTime = performance.now();
      updateResults(endTime - startTime);
    });
  });
}

dom.run.addEventListener('click', runTest);

dom.technique.addEventListener('change', preloadImagesForTechnique);

preloadImagesForTechnique();
