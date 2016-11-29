const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const browserSync = require('browser-sync');
const nodemon = require('gulp-nodemon');
const gutil = require('gulp-util');
const concat = require('gulp-concat');
const queue = require('streamqueue');
const concatCSS = require('gulp-concat-css');


const paths = {
	styles: {
		src: 'public/styles/sass/base.scss',
		dest: 'public/styles'
	}
};

const BROWSER_SYNC_RELOAD_DELAY = 500;

/*
 * For small tasks you can use arrow functions and export
 */
// gulp.task('clean', () => del([ 'assets' ]));

/*
 * You can still declare named functions and export them as tasks
 */
const styles = function styles() {

	function bootstrap() {
		return gulp.src([
				'bootstrap/dist/css/bootstrap.min.css'
			],
			{ cwd: 'bower_components' }
		);
	}

	function appStyles() {
		return gulp.src([
				paths.styles.src
			])
			.pipe(sass())
	}

	return queue({ objectMode: true }, bootstrap, appStyles)
		.pipe(concatCSS('genie.css'))
		.pipe(cleanCSS())
		// pass in options to the stream
		.pipe(rename({
			basename: 'style',
			suffix: '.min'
		}))
		.pipe(gulp.dest(paths.styles.dest));

};

const watch = function watch() {
	gulp.watch([
			'public/styles/sass/**/*',
		],
		gulp.series(styles)
	);
	gulp.watch([
			'public/scripts/to-min/**/*',
		],
		gulp.series(scripts)
	);
};

const _nodemon = function _nodemon(cb) {
	let called = false;
	return nodemon({
		// nodemon our expressjs server
		script: 'app.js',

		//watch core server file(s) that require server restart on change
		watch: [
			'controllers/**/*',
			'app.js'
		]
	})
		.on('start', () => {
			// ensure start only got called once
			if (!called) cb();
			called = true;
		})
		.on('restart', () => {
			//reload connected browsers after a slight delay
			setTimeout(
				() => {
					browserSync.reload({stream: false});
				},
				BROWSER_SYNC_RELOAD_DELAY
			);
		});
};

const _browserSync = function _browserSync() {
	return browserSync({

		open: false,

		//informs browser-sync to proxy our expressjs app which would run at the following location
		proxy: 'http://localhost:3000',

		// informs browser-sync to use the following port for the proxied app
		// notice that the default port is 3000, which would clash with our expressjs
		port: gutil.env.port || 3001,

		// open the proxied app in chrome
		browser: ['google-chrome'],

		files: [
			'public/styles/**/*.css',
		]
	});
};

const scripts = function scripts() {
	function deps() {
		return gulp.src([
				// angular
				'angular/angular.min.js',
				'angular-bootstrap/ui-bootstrap-tpls.js',

				// d3
				'd3/d3.min.js',

				// bootstrap
				'jquery/dist/jquery.min.js',
				'bootstrap/dist/js/bootstrap.min.js'
			],
			{ cwd: 'bower_components' }
		);
	}

	function appScripts() {
		return gulp.src([
				'**/*.js'
			],
			{ cwd: 'public/scripts/to-min' }
		)
	}

	return queue({ objectMode: true }, deps, appScripts)
		.pipe(concat('glovo.js'))
		.pipe(gulp.dest('public/scripts'))
		.pipe(browserSync.reload({ stream: true }));
};

gulp.task('default', gulp.series(
	gulp.parallel(
		styles,
		scripts
	),
	gulp.parallel(
		watch,
		gulp.series(_nodemon, _browserSync)
	)
));
