var path = require('path');
var gulp = require('gulp');

require('require-all')(path.resolve(__dirname, 'gulp'));

gulp.task('build', ['build:script']);
gulp.task('watch', ['watch:script']);

gulp.task('default', ['watch', 'server']);