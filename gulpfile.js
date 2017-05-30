const gulp = require('gulp');
const babel = require('gulp-babel');
const mocha = require('gulp-mocha');
const eslint = require('gulp-eslint');
const watch = require('gulp-watch');

gulp.task('scripts', () => {
    return gulp.src('src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});

gulp.task('lint', () => {
    return gulp.src('src/**/*.js')
        .pipe(
            eslint({
                fix: true
            })
        )
        .pipe(eslint.format())
        .pipe(gulp.dest('src'));
});

gulp.task('watch', () => {
	return gulp.watch('src/**/*.js', ['lint', 'scripts']);
});

gulp.task('test', () => {
	return gulp.src(['test/*.js'])
        .pipe(mocha({
            compilers: 'js:babel-register'
		}));
});

gulp.task('default', ['lint', 'scripts', 'test', 'watch']);
