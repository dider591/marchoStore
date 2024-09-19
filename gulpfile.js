const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const clean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const server = require('browser-sync').create();

const fileIncludeSettings = {
  prefix: '@@',
  basepath: '@file'
};

// Plumber error handler
const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: 'Error: <%= error.message %>',
    })
  };
};

// Clean task
gulp.task('clean', () => {
  return gulp.src('./dist/', { read: false, allowEmpty: true })
    .pipe(clean({ force: true }));
});

// HTML task
gulp.task('html', () => {
  return gulp.src('./src/*.html')
    .pipe(plumber(plumberNotify('HTML')))
    .pipe(fileinclude(fileIncludeSettings))
    .pipe(gulp.dest('./dist'));
});

// SASS task
gulp.task('sass', () => {
  return gulp.src('./src/scss/*.scss')
    .pipe(plumber(plumberNotify('SCSS')))
    .pipe(sourceMaps.init())
    .pipe(sass())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('./dist/css/'));
});

// Images task
gulp.task('images', () => {
  return gulp.src('./src/img/**/*')
    .pipe(gulp.dest('./dist/img/'));
});

// Fonts task
gulp.task('fonts', done => {
  if (fs.existsSync('./src/fonts/')) {
    gulp.src('./src/fonts/**/*')
      .pipe(gulp.dest('./dist/fonts/'));
  }
  done();
});

// Files task
gulp.task('files', done => {
  if (fs.existsSync('./src/files/')) {
    gulp.src('./src/files/**/*')
      .pipe(gulp.dest('./dist/files/'));
  }
  done();
});

// JavaScript task
gulp.task('js', () => {
  if (fs.existsSync('./src/js/')) {
    return gulp.src('./src/js/*.js')
      .pipe(plumber(plumberNotify('JS')))
      .pipe(webpack(require('./webpack.config.js')))
      .pipe(gulp.dest('./dist/js/'));
  }
});

// Server task
gulp.task('server', () => {
  server.init({
    server: {
      baseDir: 'dist'
    },
    notify: false,
    open: true,
  });
});

// Watch task
gulp.task('watch', () => {
  gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('src/**/*.html', gulp.series('html'));
  gulp.watch('src/img/**/*', gulp.series('images'));
  gulp.watch('src/fonts/**/*', gulp.series('fonts'));
  gulp.watch('src/files/**/*', gulp.series('files'));
  gulp.watch('src/js/**/*.js', gulp.series('js'));
  gulp.watch('dist/**/*').on('change', server.reload);
});

// Default task
gulp.task('default', gulp.series('clean', gulp.parallel('html', 'sass', 'images', 'fonts', 'files', 'js'), gulp.parallel('server', 'watch')));