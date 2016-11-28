const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const hub = require('gulp-hub');

gulp.task('optimize-images', function optimize() {
	return gulp.src([
		'**/*.jpg',
		'**/*.png'
	], {base: './'})
		.pipe(imagemin())
		.pipe(gulp.dest('./'));
});

hub(['./build/gulp/default.js']);
