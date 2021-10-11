const { src, dest, parallel } = require('gulp');
const svgStore = require('gulp-svgstore');
const replace = require('gulp-replace');
const wrap = require('gulp-wrap');
const rename = require('gulp-rename');
const colors = require('./colors.json');

const iconGlob = 'node_modules/@cloudfour/patterns/src/assets/icons/*.svg';

function spriteModule() {
  return src(iconGlob)
    .pipe(svgStore({ inlineSvg: true }))
    .pipe(
      replace(
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
        `<svg style="display:none;"`
      )
    )
    .pipe(wrap('export const sprite = `<%= contents %>`;'))
    .pipe(rename('sprite.js'))
    .pipe(dest('public/assets'));
}

function icons() {
  const destGlob = 'public/assets/static';
  const pipes = [
    src(iconGlob).pipe(dest(destGlob)),
    ...Object.entries(colors).map(([name, values]) => {
      const { hex } = values;
      return src(iconGlob)
        .pipe(replace(/^<svg /, `<svg style="fill:${hex};stroke:${hex};" `))
        .pipe(
          rename((path) => {
            path.dirname += `/${path.basename}`;
            path.basename = name;
          })
        )
        .pipe(dest(destGlob));
    }),
  ];

  return Promise.all(pipes);
}

function colorModule() {
  return src('colors.json')
    .pipe(wrap('export const colors = <%= contents %>;', {}, { parse: false }))
    .pipe(rename('colors.js'))
    .pipe(dest('public/assets'));
}

exports.colorModule = colorModule;
exports.icons = icons;
exports.spriteModule = spriteModule;
exports.default = parallel(spriteModule, icons, colorModule);
