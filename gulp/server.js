var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('server', function(){
  nodemon({
    script: 'server.js',
    ext: 'js html',
    ignore: ['src*']
  });
});