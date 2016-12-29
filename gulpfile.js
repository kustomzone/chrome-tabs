// jshint esversion: 6

(() => {
  'use strict';

  let gulp = require('gulp');
  let src = require('vinyl-source-stream');

  let browserify = require('browserify');
  let closureCompiler = require('google-closure-compiler').gulp();
  let stripComments = require('gulp-strip-comments');

  gulp.task('browserify', () => {
    return browserify('./src/js/main.js').exclude('jquery')
      .bundle().pipe(src('bundle.js'))
      .pipe(gulp.dest('./dists/js'));
  });

  gulp.task('minify', ['browserify'], () => {
    return gulp.src('./dists/js/bundle.js', { base: './' })
      .pipe(closureCompiler({
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT5',
        js_output_file: 'bundle.min.js',
        output_wrapper: '(function(){%output%})();',
        compilation_level: 'SIMPLE_OPTIMIZATIONS'
      })).pipe(stripComments())
      .pipe(gulp.dest('./dists/js'));
  });

  gulp.task('default', ['browserify', 'minify']);
})();
