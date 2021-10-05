import * as icons from './assets/icons.js';
import * as colors from './assets/colors.js';

const colorArray = Object.values(colors);
const iconArray = Object.keys(icons).map((key) => {
  const name = key.replace(/Icon$/g, '');
  return `<div class="mask-icon" style="--icon: url(/icons/${name})"></div>`;
});
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
    .flat();

  const startTime = performance.now();

  for (let i = 0; i < testArray.length; i++) {
    outputContainer.insertAdjacentHTML('beforeend', testArray[i]);
  }

  const endTime = performance.now();
  const time = endTime - startTime;
  const timePer = time / total;
  resultTotalContainer.innerHTML = `${time} ms`;
  resultPerContainer.innerHTML = `${timePer.toFixed(2)} ms`;
}

runButton.addEventListener('click', () => runTest());
