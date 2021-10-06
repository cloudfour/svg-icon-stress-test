import * as icons from './assets/icons.js';
import * as filters from './assets/filters.js';

const filterArray = Object.values(filters);
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
      const filter = filterArray[index % filterArray.length];
      return `<img src="${path}" alt="" width="24" height="24" style="filter:${filter}">`;
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
