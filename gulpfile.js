// //////////////////////////////////////////////////////
// Required
// //////////////////////////////////////////////////////

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    sass = require('gulp-sass'),
    pug = require('gulp-pug'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer');

var paths = {
    // PACKAGE STRUCTURE
    app: 'app',
    appFiles: 'app/**/*',
    build: 'build',

    // HTML & PUG TEMPLATING
    html: 'app/**/*.html',
    pug: 'app/pug/*.pug',

    // JS MINIFICATION & WATCH
    js: 'app/js/**/*.js',
    jsUnmin: '!app/js/**/*.min.js',
    jsdir: 'app/js',

    // SASS PREPROCESSING
    scss: 'app/scss/app.scss',
    scssWatch: 'app/scss/',
    css: 'app/css',

    // GARBAGE COLLECTION
    buildScss: 'build/scss',
    buildJsUnmin: 'build/js/!(*.min.js)',
    buildPug: 'build/pug'
};

// //////////////////////////////////////////////////////
// Scripts Task
// //////////////////////////////////////////////////////
gulp.task('scripts', function(){
    gulp.src([paths.js, paths.jsUnmin])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename({suffix:'.min'}))
    // .pipe(concat('app.min.js'))
    .pipe(gulp.dest(paths.jsdir))
    .pipe(reload({stream:true}));
});

// //////////////////////////////////////////////////////
// Compass / Sass Tasks
// //////////////////////////////////////////////////////
// });

// gulp.task('sass', function(){
gulp.task('sass', function(){
    gulp.src(paths.scss)
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest(paths.css))
    .pipe(reload({stream:true}));
});

// //////////////////////////////////////////////////////
// Browser-Sync Tasks
// //////////////////////////////////////////////////////
gulp.task('browser-sync', function(){
    browserSync({
        server:{
            baseDir: paths.app
        }
    });
});

// task to run build server for testing final app
gulp.task('build:serve', function(){
    browserSync({
        server:{
            baseDir: paths.build
        }
    });
});

// //////////////////////////////////////////////////////
// HTML Tasks
// //////////////////////////////////////////////////////
gulp.task('html', function(){
    gulp.src(paths.html)
    .pipe(reload({stream:true}));
});

// //////////////////////////////////////////////////////
// Pug Tasks
// //////////////////////////////////////////////////////
gulp.task('pug', function(){
    return gulp.src(paths.pug)
    .pipe(pug({
        // Pug Options Here.
        pretty: true
    }))
    .pipe(gulp.dest(paths.app));
});

// //////////////////////////////////////////////////////
// Build Tasks
// //////////////////////////////////////////////////////

// Clear out all files and folders from build folder
gulp.task('build:cleanfolder', function(cb){
    del([
        'build/**'
    ], cb);
});

// Task to create build directory for all files.
gulp.task('build:copy', function(){
    return gulp.src(paths.appFiles)
    .pipe(gulp.dest(paths.build));
});

// Task to remove unwanted build files
// List all files and directories here that you don't want to include
gulp.task('build:remove', ['build:copy'], function(cb){
    del([
        paths.buildScss,
        // 'build/js/!(app.min.js)'
        paths.buildJsUnmin,
        paths.buildPug,
    ], cb);
});

gulp.task('build', ['build:copy', 'build:remove', 'build:serve']);

// //////////////////////////////////////////////////////
// Watch Tasks
// //////////////////////////////////////////////////////
gulp.task('watch', function(){
    gulp.watch(paths.js, ['scripts']);
    gulp.watch(paths.scss, ['sass']);
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.pug, ['pug']);
});

// //////////////////////////////////////////////////////
// Default Task
// //////////////////////////////////////////////////////
gulp.task('default', ['scripts', 'sass', 'pug', 'html', 'browser-sync', 'watch']);
