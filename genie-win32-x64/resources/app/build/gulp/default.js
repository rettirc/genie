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
const html2js = require('gulp-ng-html2js');
const pug = require('gulp-pug');
const minifyHtml = require('gulp-minify-html');
const electron = require('gulp-electron');

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
				'angular-ui-router/release/angular-ui-router.min.js',

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

	function tmpls() {
		return gulp.src([
				'**/*.pug'
			],
			{ cwd: 'public/scripts/to-min' }
		)
			.pipe(pug({ client: false }))
			.pipe(minifyHtml({
				empty: true,
				spare: true,
				quotes: true
			}))
			.pipe(html2js({ moduleName: 'genie.templates' }))
			.pipe(concat('templates.js'));
	}

	return queue({ objectMode: true }, deps, appScripts, tmpls)
		.pipe(concat('genie.js'))
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

const packageJson = require("../../package.json");

gulp.task('electron', function() {

    gulp.src("")
    .pipe(electron({
        src: '../../public',
        packageJson: packageJson,
        release: 'release',
        cache: 'cache',
        version: 'v1.6.1',
        platforms: ['darwin-x64', 'linux-ia32', 'linux-x64', 'linux-arm'],
        platformResources: {
            darwin: {
                CFBundleDisplayName: packageJson.name,
                CFBundleIdentifier: packageJson.name,
                CFBundleName: packageJson.name,
                CFBundleVersion: packageJson.version
            },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version
            }
        }
    }))
    .pipe(gulp.dest(""));
});
