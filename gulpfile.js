const { basename } = require('path');
const { src, dest, parallel } = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const svgStore = require('gulp-svgstore');
const wrap = require('gulp-wrap');
const colors = require('./colors.json');

const iconNames = [
  'arrow-down-right',
  'bell',
  'envelope',
  'heart',
  'magnifying-glass',
];

const iconGlob = `node_modules/@cloudfour/patterns/src/assets/icons/{${iconNames.join(
  ','
)}}.svg`;

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

function iconModule() {
  return (
    src(iconGlob)
      // .pipe(wrap('export const <%= file.path %> = `<%= contents %>`;'))
      .pipe(
        wrap((data) => {
          const key = basename(data.file.path, '.svg');
          return `'${key}': \`${data.contents}\`,`;
        })
      )
      .pipe(concat('icons.js'))
      .pipe(wrap('export const icons = { <%= contents %> };'))
      .pipe(dest('public/assets'))
  );
}

function staticIcons() {
  const destGlob = 'public/assets/icons';
  const pipes = [
    src(iconGlob)
      .pipe(
        replace(
          /^<svg /,
          `<svg style="fill:currentColor;stroke:currentColor;" `
        )
      )
      .pipe(dest(destGlob)),
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
exports.iconModule = iconModule;
exports.spriteModule = spriteModule;
exports.staticIcons = staticIcons;
exports.default = parallel(colorModule, iconModule, spriteModule, staticIcons);
