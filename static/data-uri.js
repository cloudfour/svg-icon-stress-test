import * as icons from './assets/icons.js';
import * as colors from './assets/colors.js';

const colorArray = Object.values(colors);
const iconArray = Object.values(icons);
const runButton = document.getElementById('run');
const outputContainer = document.getElementById('output');
const totalInput = document.getElementById('total');
const resultTotalContainer = document.getElementById('result-total');
const resultPerContainer = document.getElementById('result-per');

function runTest() {
  if (outputContainer.children.length) {
    outputContainer.innerHTML = '';
  }

  const total = parseInt(totalInput.value);
  const testArray = Array(total / iconArray.length)
    .fill(iconArray)
    .flat()
    .map((svg, index) => {
      const fill = colorArray[index % colorArray.length];
      const filled = svg.replace(
        /^<svg /,
        `<svg style="fill:${fill};stroke:${fill};" `
      );
      // Thanks to: filamentgroup/directory-encoder
      const cleaned = filled
        .replace(/[\t\n\r]/gim, '') // Strip newlines and tabs
        .replace(/\s\s+/g, ' ') // Condense multiple spaces
        .replace(/'/gim, '\\i'); // Normalize quotes
      // Encoded
      const encoded = encodeURIComponent(cleaned)
        .replace(/\(/g, '%28') // Encode brackets
        .replace(/\)/g, '%29');
      const path = `data:image/svg+xml;charset=UTF-8,${encoded}`;
      return `<img src="${path}" alt="" width="24" height="24">`;
    });

  requestAnimationFrame(() => {
    const startTime = performance.now();

    for (let i = 0; i < testArray.length; i++) {
      outputContainer.insertAdjacentHTML('beforeend', testArray[i]);
    }

    requestAnimationFrame(() => {
      const endTime = performance.now();
      const time = endTime - startTime;
      const timePer = time / total;
      resultTotalContainer.innerHTML = `${parseFloat(time.toFixed(2))} ms`;
      resultPerContainer.innerHTML = `${parseFloat(timePer.toFixed(2))} ms`;
    });
  });
}

runButton.addEventListener('click', () => runTest());
