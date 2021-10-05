import * as icons from './assets/icons.js';

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
