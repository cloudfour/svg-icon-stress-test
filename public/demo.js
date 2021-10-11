import { colors } from './assets/colors.js';
import { icons } from './assets/icons.js';
import { sprite } from './assets/sprite.js';

// Save elements we'll need to reference
const dom = {};
[...document.querySelectorAll('body [id]')].forEach((element) => {
  dom[element.id] = element;
});

// Save convenience arrays of keys and values
const colorKeys = [null, ...Object.keys(colors)];
const colorValues = [
  '#000000',
  ...Object.values(colors).map((color) => color.hex),
];
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
    let path = `assets/icons/${key}`;

    if (color) {
      path += `/${color}`;
    }

    return `<img src="${path}.svg" alt="${key}" width="24" height="24">`;
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
  // Clear the output container if it already has children
  if (dom.output.children.length > 0) {
    dom.output.innerHTML = '';
  }

  const technique = dom.technique.value;
  const total = parseInt(dom.total.value, 10);
  const startArray = startArrays[technique];

  dom.output.setAttribute('data-technique', technique);

  let testArray = makeRepetitiveArray(total, startArray);

  if (technique in postProcesses) {
    testArray = testArray.map(postProcesses[technique]);
  }

  requestAnimationFrame((startTime) => {
    for (let i = 0; i < testArray.length; i++) {
      dom.output.insertAdjacentHTML('beforeend', testArray[i]);
    }

    requestAnimationFrame((endTime) => {
      updateResults(startTime, endTime, total);
    });
  });
}

dom.run.addEventListener('click', runTest);
