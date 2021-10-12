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
  img: iconKeys,
  uri: iconValues,
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

// Set color values as CSS custom properties
Object.entries(colors).forEach(([color, { hex, filter }]) => {
  document.documentElement.style.setProperty(`--color-${color}`, hex);
  document.documentElement.style.setProperty(`--filter-${color}`, filter);
});

// Insert SVG sprite into page
document.body.insertAdjacentHTML('afterbegin', sprite);

function makeRepetitiveArray(length, values) {
  return Array(Math.ceil(length / values.length))
    .fill(values)
    .flat()
    .slice(0, length);
}

function formatResultTime(time, units = 'ms') {
  return `${parseFloat(time.toFixed(2))} ${units}`;
}

function updateResults(startTime, endTime, total = 1) {
  const time = endTime - startTime;
  dom.result.innerHTML = formatResultTime(time);
  dom.resultPer.innerHTML = total > 1 ? formatResultTime(time / total) : '–';
  const lastRun = new Date(endTime);
  dom.lastRun.innerHTML = lastRun.toLocaleTimeString();
}

function runTest() {
  const technique = dom.technique.value;
  const total = parseInt(dom.total.value, 10);
  const startArray = startArrays[technique];

  // Clear the output container if it already has children
  dom.output.innerHTML = '';
  dom.output.setAttribute('data-technique', technique);

  let testArray = makeRepetitiveArray(total, startArray);

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
      updateResults(startTime, endTime, total);
    });
  });
}

dom.run.addEventListener('click', runTest);
