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

// https://javascript.info/array-methods#shuffle-an-array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function average(nums) {
  return nums.reduce((a, b) => a + b) / nums.length;
}

function median(nums) {
  const sorted = nums.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return average([sorted[middle - 1], sorted[middle]]);
  }

  return sorted[middle];
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
  const cycles = parseInt(dom.cycles.value, 10);
  return { technique, total, cycles };
}

function statItemHtml(dt, dd) {
  return `<div class="stats__item">
  <dt>${dt}</dt>
  <dd>${formatResultTime(dd)}</dd>
</div>`;
}

function updateResults(results) {
  const statItems = [];

  if (results.length > 1) {
    statItems.push(
      statItemHtml('Average', average(results)),
      statItemHtml('Median', median(results))
    );
  } else {
    const { total } = getOptions();
    const result = results[0];
    statItems.push(
      statItemHtml('Total', result),
      statItemHtml('Per icon', result / total)
    );
  }

  dom.stats.innerHTML = statItems.join('\n');
  dom.lastRun.innerHTML = new Date().toLocaleTimeString();
}

function runTest(technique, total, callback) {
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

      if (callback) {
        callback(endTime - startTime);
      }
    });
  });
}

async function runTests() {
  dom.run.disabled = true;

  const { technique, total, cycles } = getOptions();

  const test = (resolve) => {
    runTest(technique, total, resolve);
  };
  const results = [];

  console.log(
    `Running "${technique}" test of ${total} icon${
      total > 1 ? 's' : ''
    } ${cycles} time${cycles > 1 ? 's' : ''}…`
  );

  for (let i = 0; i < cycles; i++) {
    const result = await new Promise(test);
    console.log(result);
    results.push(result);
  }

  updateResults(results);
  dom.run.disabled = false;
}

dom.run.addEventListener('click', runTests);
