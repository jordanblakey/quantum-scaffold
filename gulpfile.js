// //////////////////////////////////////////////////////
// REQUIRED NPM PACKAGES
// //////////////////////////////////////////////////////

var gulp = require('gulp'),

    // CORE
    notify = require('gulp-notify'),
    del = require('del'),
    rename = require('gulp-rename'),
    cache = require('gulp-cache'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,

    // HTML TEMPLATING
    pug = require('gulp-pug'),

    // SASS
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),

    // CONCATENATION & MINIFICATION
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin');


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
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
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
