import * as icons from './assets/icons.js';

const iconArray = Object.keys(icons).map((key) => {
  const name = key.replace(/Icon$/g, '');
  return `<div class="mask-icon" style="--icon: url(/icons/${name})">
  <span class="u-hidden-visually">${name}</span>
</div>`;
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
  resultTotalContainer.innerHTML = `${parseFloat(time.toFixed(2))} ms`;
  resultPerContainer.innerHTML = `${parseFloat(timePer.toFixed(2))} ms`;
}

runButton.addEventListener('click', () => runTest());
