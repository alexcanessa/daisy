const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
 
gulp.task('scripts', () => {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
	return gulp.watch('src/*.js', ['scripts']);
});

gulp.task('default', ['scripts', 'watch']);