import * as icons from './assets/icons.js';
import * as colors from './assets/colors.js';

const colorArray = Object.values(colors);
const iconPathArray = Object.keys(icons).map((key) => {
  const name = key.replace(/Icon$/g, '');
  return `/icons/${name}`;
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
  const testArray = Array(total / iconPathArray.length)
    .fill(iconPathArray)
    .flat()
    .map((path, index) => {
      const fill = colorArray[index % colorArray.length].replace('#', '');
      return `<img src="${path}/${fill}" alt="" width="24" height="24">`;
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
