var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var sourcestream = require('vinyl-source-stream');

var dir = {
  src: 'src',
  dist: 'dist/js',
  name: 'app.js'
};

var dev = process.env.STAGE == 'develop';

gulp.task('clean:script', function(){
  gulp.src(path.resolve(dir.dist), { read: false }).pipe(clean({ force: true }));
});

gulp.task('build:script', ['clean:script'], function(){
  browserify(path.resolve(dir.src, dir.name), { debug: dev })
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(sourcestream(dir.name))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: dev }))
    //.pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dir.dist));
});

gulp.task('watch:script', ['build:script'], function(){
  gulp.watch(dir.src + '/**/*.js', ['build:script']);
});