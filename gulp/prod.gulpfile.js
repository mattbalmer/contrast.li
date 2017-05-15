const TARGET_ENV = 'production';

const gulp = require('gulp');
const path = require('path');
const fs = require('fs');
const sync = require('gulp-sync')(gulp).sync;
const Config = require('./config')(TARGET_ENV);
var recipe = (name, config) => require('./recipes/' + name)(config);

gulp.task('env', recipe('env', {
  NODE_PATH: 'client/js:node_modules'
}));

gulp.task('clean', recipe('clean', {
  input: './dist'
}));

gulp.task('css', Config.JS_BUNDLES.map(title => {
  gulp.task(`css:${title}`, recipe('stylus', {
    input: `./client/css/${title}.bundle.styl`,
    output: './dist/css',
    name: `${title}.css`,
    include: [
      '_globals/index.styl'
    ]
  }));

  return `css:${title}`;
}));

gulp.task('js:node_modules', recipe('browserify', {
  input: '',
  require: Config.NODE_MODULES,
  output: './dist/vendor',
  name: 'node_modules.js'
}));

gulp.task('js:source', Config.CSS_BUNDLES.map(title => {
  gulp.task(`js:source:${title}`, recipe('tsify-sourcemaps', {
    input: `./client/js/${title}.bundle.${Config.EXT.JS}`,
    external: Config.NODE_MODULES,
    output: './dist/js',
    name: `${title}.js`,
    baseUrl: './client/js'
  }));

  return `js:source:${title}`;
}));

gulp.task('views', recipe('html', {
  cwd: './dist',
  file: './client/html/**/*.html',
  sources: [[
    'vendor/**/*'
  ], [
    'css/source.css',
    'css/**/*',
    'js/**/*'
  ]],
  output: './dist',
  replacements: [
    ['@{SENTRY}', Config.SENTRY],
    ['@{GA}', Config.GA],
    ['@{VERSION}', Config.VERSION],
    ['@{ENV}', Config.ENV],
  ]
}));

gulp.task('static', recipe('copy', {
  input: './static/**/*',
  output: './dist'
}));

gulp.task('watch', () => {
  gulp.watch([
    './client/html/**/*.html',
    './dist/**/*.js',
    './dist/**/*.css',
    './dist/vendor/**/*'
  ], ['views']);
  gulp.watch('./client/css/**/*.styl', ['css']);
  gulp.watch('./static/**/*', ['static']);
  gulp.watch('./bower_components/**/*', ['bower']);
  gulp.watch([
    `./client/js/**/*.${Config.EXT.JS}`
  ], ['js:source']);
});

var compileAsync = ['js:node_modules', 'js:source', 'static', 'css'];
gulp.task('compile', sync(['env', 'clean', compileAsync, 'views']));
gulp.task('default', ['compile', 'watch']);