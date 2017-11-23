const gulp = require('gulp');
// js
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('rollup-plugin-babel');
//watch
const watch = require('gulp-watch');
// styles
const concat = require('gulp-concat');
const gulpSourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');

const distDir = './dist';
const stylesGlob = 'src/**/*.pcss';
const scriptsGlob = 'src/**/*.js';
const assetsGlob = 'src/assets/*';

//bs
const browserSync = require('browser-sync').create();

const babelConfig = {
	"presets": [
	  [
		"es2015",
		{
		  "modules": false
		}
	  ]
	],
	"plugins": [
	  "external-helpers"
	],
	babelrc: false
  };

const rollupJS = (inputFile, options) => {
	console.log('starting rollup files');
	return () => {
	  return rollup({
		input: options.basePath + inputFile,
		format: options.format,
		sourcemap: options.sourcemap,
		plugins: options.plugins
	  })
	  // point to the entry file.
	  .pipe(source(inputFile, options.basePath))
	  // we need to buffer the output, since many gulp plugins don't support streams.
	  .pipe(buffer())
	  .pipe(sourcemaps.init({loadMaps: true}))
	  // some transformations like uglify, rename, etc.
	  .pipe(sourcemaps.write('.'))
	  .pipe(gulp.dest(options.distPath));
	};
  }

  gulp.task('rollup', rollupJS('app.js', {
	basePath: './src/',
	format: 'umd',
	distPath: distDir,
	sourcemap: true,
	plugins: [babel(babelConfig)]
  }));

  gulp.task('assets', function () {
	return gulp.src(assetsGlob)
		.pipe(gulp.dest(distDir + '/assets'));
});

  gulp.task('styles', function() {
        return gulp.src(stylesGlob)
            .pipe(gulpSourcemaps.init())
            .pipe(postcss([ require('postcss-nested') ]))
            .pipe(concat('style.css'))
            .pipe(gulpSourcemaps.write())
            .pipe(gulp.dest(distDir))
    })

  gulp.task('stream', function () {
    // Endless stream mode
    watch(scriptsGlob, gulp.series('rollup'));
    watch(stylesGlob, gulp.series('styles'));
    watch(assetsGlob, gulp.series('assets'));
});

gulp.task('build', gulp.series('rollup', 'styles', 'assets'))

gulp.task('bs', function(){
	browserSync.init({
        server: {
            baseDir: "./"
        }
	});

	watch(distDir + '/*', browserSync.reload);
})

gulp.task('default', gulp.series('build', gulp.parallel('bs', 'stream')));


