// //////////////////////////////////////////////////////
// REQUIRED NPM PACKAGES
// //////////////////////////////////////////////////////

var gulp = require('gulp'),

    // CORE
    notify = require('gulp-notify'), // Gulp plugin to send messages based on Vinyl Files or Errors to Mac OS X, Linux or Windows using the node-notifier module. Fallbacks to Growl or simply logging. [https://github.com/mikaelbr/gulp-notify]
    del = require('del'), // Similar to rimraf, but with a Promise API and support for multiple files and globbing. It also protects you against deleting the current working directory and above. [https://www.npmjs.com/package/del]
    rename = require('gulp-rename'), // gulp-rename is a gulp plugin to rename files easily. [https://www.npmjs.com/package/gulp-rename]
		cache = require('gulp-cache'), // A temp file based caching proxy task for gulp. [https://www.npmjs.com/package/gulp-cache]
		plumber = require('gulp-plumber'), // This 🐒-patch plugin is fixing issue with Node Streams piping. For explanations, read this small article. Briefly it replaces pipe method and removes standard onerror handler on error event, which unpipes streams on error by default. [https://www.npmjs.com/package/gulp-plumber]
		browserSync = require('browser-sync'), // With each web page, device and browser, testing time grows exponentially. From live reloads to URL pushing, form replication to click mirroring, Browsersync cuts out repetitive manual tasks. [https://www.browsersync.io/]
    reload = browserSync.reload,

    // HTML TEMPLATING
    pug = require('gulp-pug'),

    // SASS
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),

    // CONCATENATION & MINIFICATION

		uglify = require('gulp-uglify'), // JavaScript parser / mangler / compressor / beautifier toolkit [https://www.npmjs.com/package/gulp-uglify]
		concat = require('gulp-concat'), // This will concat files by your operating systems newLine. It will take the base directory from the first file that passes through [https://www.npmjs.com/package/gulp-concat]
		imagemin = require('gulp-imagemin'), // Minify PNG, JPEG, GIF and SVG images [https://github.com/sindresorhus/gulp-imagemin]
		uncss = require('gulp-uncss'), // UnCSS is a tool that removes unused CSS from your stylesheets. It works across multiple files and supports Javascript-injected CSS.
    mincss = require('gulp-minify-css');
    // postcss = require('gulp-postcss'), // Pipe CSS through PostCSS processors with a single parse. [https://github.com/postcss/gulp-postcss]
    // cssnano = require('cssnano'), // cssnano takes your nicely formatted CSS and runs it through many focused optimisations, to ensure that the final result is as small as possible for a production environment. [http://cssnano.co/]


// //////////////////////////////////////////////////////
// PACKAGE STRUCTURE & PATHS
// //////////////////////////////////////////////////////

var paths = {
    // PACKAGE STRUCTURE
    app: 'app',
    appFiles: 'app/**/*',
    build: 'build',

    // HTML & PUG TEMPLATING
    html: 'app/**/*.html',
    php: '',
    pug: 'app/pug/**/*.pug',
    pugExclude:'!app/pug/includes/**/*.pug',

    // JS MINIFICATION & WATCH
    js: 'app/js/lib/**/*.js',
    jsUnmin: '!app/js/**/*.min.js',
    jsExclude: '!app/js/lib/_exclude/**/*.js',
    jsdir: 'app/js',

    // SASS PREPROCESSING
    scss: 'app/scss/app.scss',
    scssWatch: 'app/scss/',
    css: 'app/css',

    // IMAGE MINIFICATION
    images: 'app/img',

    // GARBAGE COLLECTION
    buildScss: 'build/scss',
    buildJsUnmin: 'build/js/!(*.min.js)',
    buildPug: 'build/pug'
};


// //////////////////////////////////////////////////////
// JAVASCRIPT TASK gulp scripts
// //////////////////////////////////////////////////////

gulp.task('scripts', function(){
    gulp.src([paths.js, paths.jsExclude])
    .pipe(plumber())
    // TO CONCATENATE ALL SCRIPTS,
    // COMMENT OUT RENAME AND USE CONCAT:
    .pipe(concat('app.min.js'))
    // TO MINIFY INDIVIDUAL SCRIPTS,
    // COMMENT OUT CONCAT AND USE RENAME:
    .pipe(uglify())
    // .pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest(paths.jsdir))
    // THIS LINE SENDS JS FOLDER TO WATCH TASK.
    .pipe(reload({stream:true}));
});

// //////////////////////////////////////////////////////
// SASS TASK ($ gulp sass)
// //////////////////////////////////////////////////////

gulp.task('sass', function(){
    gulp.src(paths.scss)
    .pipe(plumber())
    // outputStyle values: compressed, expanded
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(uncss( {html: [paths.html] } ))
    .pipe(mincss({
        keepSpecialComments: 0
    }))
    .pipe(gulp.dest(paths.css))
    // THIS LINE SENDS SCSS FOLDER TO WATCH TASK.
    .pipe(reload({stream:true}));
});


// //////////////////////////////////////////////////////
// PUG TASKS ($ gulp pug)
// //////////////////////////////////////////////////////

gulp.task('pug', function(){
    gulp.src([paths.pug, paths.pugExclude])
    .pipe(pug({
        // PUG OPTIONS HERE.
        pretty: true
    }))
    .pipe(gulp.dest(paths.app));
});


// //////////////////////////////////////////////////////
// IMAGES ($ gulp images)
// //////////////////////////////////////////////////////

gulp.task('images', function() {
  gulp.src('img/**/*')
    .pipe(plumber())
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('img'))
    .pipe(reload({stream:true}));
});


// //////////////////////////////////////////////////////
// BROWSER-SYNC TASKS
// //////////////////////////////////////////////////////

// TASK TO RUN SERVER AT /APP
gulp.task('browser-sync', function(){
    browserSync({
        server:{
            baseDir: paths.app
        }
    });
});

// TASK TO RUN BUILD SERVER AT /BUILD
gulp.task('build:serve', function(){
    browserSync({
        server:{
            baseDir: paths.build
        }
    });
});


// //////////////////////////////////////////////////////
// HTML TASKS
// //////////////////////////////////////////////////////

gulp.task('html', function(){
    gulp.src(paths.html)
// THIS LINE SENDS HTML FOLDER TO WATCH TASK.
    .pipe(reload({stream:true}));
});


// //////////////////////////////////////////////////////
// BUILD TASKS ($ gulp build)
// //////////////////////////////////////////////////////

// CLEAR OUT ALL FILES AND FOLDERS FROM BUILD FOLDER
gulp.task('build:cleanfolder', function(cb){
    del([
        'build/**'
    ], cb);
});

// TASK TO CREATE BUILD DIRECTORY FOR ALL FILES
gulp.task('build:copy', function(){
    return gulp.src(paths.appFiles)
    .pipe(gulp.dest(paths.build));
});

// TASK TO REMOVE UNWANTED FILES FROM BUILD
// LIST FILES AND DIRECTORIES HERE YOU DON'T WANT TO INCLUDE
gulp.task('build:remove', ['build:copy'], function(cb){
    del([
        paths.buildScss,
        // IF ALL WORKING, THIS CAN BE REMOVED
        // 'build/js/!(app.min.js)'
        paths.buildJsUnmin,
        paths.buildPug,
    ], cb);
});

gulp.task('build:notify', function(){
    gulp.src(".")
    .pipe(notify("Build successful. Serving & watching..."));
});

gulp.task('build', ['build:copy', 'build:remove', 'build:notify', 'build:serve', ]);


// //////////////////////////////////////////////////////
// WATCH TASKS ($ gulp watch)
// //////////////////////////////////////////////////////

gulp.task('watch', function(){
    gulp.watch(paths.js, ['scripts']);
    gulp.watch(paths.scss, ['sass']);
    gulp.watch(paths.img, ['images']);
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.pug, ['pug']);
    gulp.src(".")
    .pipe(notify("Success. Serving & watching..."));
});


// //////////////////////////////////////////////////////
// DEFAULT TASK ($ gulp)
// //////////////////////////////////////////////////////
gulp.task('default', ['scripts', 'sass', 'pug', 'html', 'browser-sync', 'watch']);
