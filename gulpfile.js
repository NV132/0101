// gulp 설정 샘플
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

gulp.task('scss', function() {
  return gulp.src('scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('assets/css'));
});

// SCSS 파일 변경 시 자동 컴파일
gulp.task('watch', function() {
  gulp.watch('scss/**/*.scss', gulp.series('scss'));
});

gulp.task('default', gulp.series('scss')); 