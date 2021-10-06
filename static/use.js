import * as icons from './assets/icons.js';

const iconArray = Object.keys(icons).map(
  (name) => `<svg width="24" height="24"><use href="#${name}"/></svg>`
);
const runButton = document.getElementById('run');
const outputContainer = document.getElementById('output');
const totalInput = document.getElementById('total');
const resultTotalContainer = document.getElementById('result-total');
const resultPerContainer = document.getElementById('result-per');

function makeSprite() {
  const spriteContainer = document.getElementById('sprite');
  const symbols = Object.entries(icons).map(([name, svg]) => {
    const dummyDiv = document.createElement('div');
    dummyDiv.innerHTML = svg;
    const svgElement = dummyDiv.firstChild;
    const viewBox = svgElement.getAttribute('viewBox');
    return `<symbol id="${name}" viewBox="${viewBox}">${svgElement.innerHTML}</symbol>`;
  });
  spriteContainer.innerHTML = symbols.join('\n');
}

function runTest() {
  if (outputContainer.children.length) {
    outputContainer.innerHTML = '';
  }

  const total = parseInt(totalInput.value);
  const testArray = Array(total / iconArray.length)
    .fill(iconArray)
    .flat();

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

makeSprite();

runButton.addEventListener('click', () => runTest());
