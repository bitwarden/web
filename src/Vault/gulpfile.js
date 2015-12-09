/// <binding BeforeBuild='build, dist' Clean='clean' ProjectOpened='build. dist' />

var gulp = require('gulp'),
    rimraf = require('rimraf'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    ghPages = require('gulp-gh-pages'),
    less = require('gulp-less'),
    ngAnnotate = require('gulp-ng-annotate'),
    preprocess = require('gulp-preprocess'),
    runSequence = require('run-sequence'),
    merge = require('merge-stream'),
    ngConfig = require('gulp-ng-config'),
    settings = require('./settings.json'),
    project = require('./project.json'),
    jshint = require('gulp-jshint'),
    _ = require('lodash');

var paths = {};
paths.dist = '../../dist/';
paths.webroot = './wwwroot/'
paths.js = paths.webroot + 'js/**/*.js';
paths.minJs = paths.webroot + 'js/**/*.min.js';
paths.concatJsDest = paths.webroot + 'js/bw.min.js';
paths.libDir = paths.webroot + 'lib/';
paths.npmDir = 'node_modules/';
paths.lessDir = 'less/';
paths.cssDir = paths.webroot + 'css/';
paths.jsDir = paths.webroot + 'js/';

gulp.task('lint', function () {
    return gulp.src(paths.webroot + 'app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('build', function (cb) {
    return runSequence(
        'clean',
        ['lib', 'less', 'settings', 'lint'],
        cb);
});

gulp.task('clean:js', function (cb) {
    return rimraf(paths.concatJsDest, cb);
});

gulp.task('clean:css', function (cb) {
    return rimraf(paths.cssDir, cb);
});

gulp.task('clean:lib', function (cb) {
    return rimraf(paths.libDir, cb);
});

gulp.task('clean', ['clean:js', 'clean:css', 'clean:lib', 'dist:clean']);

gulp.task('min:js', ['clean:js'], function () {
    return gulp.src([paths.js, '!' + paths.minJs], { base: '.' })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('min:css', [], function () {
    return gulp.src([paths.cssDir + '**/*.css', '!' + paths.cssDir + '**/*.min.css'], { base: '.' })
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('.'));
});

gulp.task('min', ['min:js', 'min:css']);

gulp.task('lib', ['clean:lib'], function () {
    var libs = [
        {
            src: [
                paths.npmDir + 'bootstrap/dist/**/*',
                '!' + paths.npmDir + 'bootstrap/dist/**/npm.js',
                '!' + paths.npmDir + 'bootstrap/dist/**/css/*theme*'
            ],
            dest: paths.libDir + 'bootstrap'
        },
        {
            src: paths.npmDir + 'font-awesome/css/*',
            dest: paths.libDir + 'font-awesome/css'
        },
        {
            src: paths.npmDir + 'font-awesome/fonts/*',
            dest: paths.libDir + 'font-awesome/fonts'
        },
        {
            src: paths.npmDir + 'jquery/dist/*.js',
            dest: paths.libDir + 'jquery'
        },
        {
            src: paths.npmDir + 'admin-lte/dist/js/app*.js',
            dest: paths.libDir + 'admin-lte/js'
        },
        {
            src: paths.npmDir + 'angular/angular*.js',
            dest: paths.libDir + 'angular'
        },
        {
            src: paths.npmDir + 'angular-bootstrap-npm/dist/*tpls*.js',
            dest: paths.libDir + 'angular-bootstrap'
        },
        {
            src: paths.npmDir + 'angular-bootstrap-show-errors/src/*.js',
            dest: paths.libDir + 'angular-bootstrap-show-errors'
        },
        {
            src: paths.npmDir + 'angular-cookies/*cookies*.js',
            dest: paths.libDir + 'angular-cookies'
        },
        {
            src: paths.npmDir + 'angular-jwt/dist/*.js',
            dest: paths.libDir + 'angular-jwt'
        },
        {
            src: paths.npmDir + 'angular-md5/angular-md5*.js',
            dest: paths.libDir + 'angular-md5'
        },
        {
            src: paths.npmDir + 'angular-resource/*resource*.js',
            dest: paths.libDir + 'angular-resource'
        },
        {
            src: [paths.npmDir + 'angular-toastr/dist/**/*.css', paths.npmDir + 'angular-toastr/dist/**/*.js'],
            dest: paths.libDir + 'angular-toastr'
        },
        {
            src: paths.npmDir + 'angular-ui-router/release/*.js',
            dest: paths.libDir + 'angular-ui-router'
        },
        {
            src: paths.npmDir + 'angular-messages/*messages*.js',
            dest: paths.libDir + 'angular-messages'
        },
        {
            src: [paths.npmDir + 'sjcl/core/cbc.js', paths.npmDir + 'sjcl/core/bitArray.js', paths.npmDir + 'sjcl/sjcl.js'],
            dest: paths.libDir + 'sjcl'
        },
        {
            src: paths.npmDir + 'ngstorage/*.js',
            dest: paths.libDir + 'ngstorage'
        },
        {
            src: paths.npmDir + 'papaparse/papaparse*.js',
            dest: paths.libDir + 'papaparse'
        },
        {
            src: paths.npmDir + 'ngclipboard/dist/ngclipboard*.js',
            dest: paths.libDir + 'ngclipboard'
        },
        {
            src: paths.npmDir + 'clipboard/dist/clipboard*.js',
            dest: paths.libDir + 'clipboard'
        }
    ];

    var tasks = libs.map(function (lib) {
        return gulp.src(lib.src).pipe(gulp.dest(lib.dest));
    });

    return merge(tasks);
});

gulp.task('settings', function () {
    return config()
        .pipe(gulp.dest(paths.webroot + 'app'));
});

function config() {
    return gulp.src('./settings.json')
        .pipe(ngConfig('bit', {
            createModule: false,
            constants: _.merge({}, {
                appSettings: {
                    version: project.version,
                    environment: project.environment
                }
            }, require('./settings.' + project.environment + '.json') || {})
        }));
}

gulp.task('less', function () {
    return gulp.src(paths.lessDir + 'vault.less')
        .pipe(less())
        .pipe(gulp.dest(paths.cssDir));
});

gulp.task('watch', function () {
    gulp.watch(paths.lessDir + '*.less', ['less']);
    gulp.watch('./settings*.json', ['settings']);
});

gulp.task('dist:clean', function (cb) {
    return rimraf(paths.dist, cb);
});

gulp.task('dist:move', function () {
    var moves = [
        {
            src: [
                paths.npmDir + 'bootstrap/dist/**/bootstrap.min.js',
                paths.npmDir + 'bootstrap/dist/**/bootstrap.min.css',
                paths.npmDir + 'bootstrap/dist/**/fonts/**/*',
            ],
            dest: paths.dist + 'lib/bootstrap'
        },
        {
            src: [
                paths.npmDir + 'font-awesome/**/font-awesome.min.css',
                paths.npmDir + 'font-awesome/**/fonts/**/*'
            ],
            dest: paths.dist + 'lib/font-awesome'
        },
        {
            src: paths.npmDir + 'jquery/dist/jquery.min.js',
            dest: paths.dist + 'lib/jquery'
        },
        {
            src: paths.npmDir + 'angular/angular.min.js',
            dest: paths.dist + 'lib/angular'
        },
        {
            src: [
                paths.webroot + '**/app/**/*.html',
                paths.webroot + '**/images/**/*',
                paths.webroot + 'index.html',
                paths.webroot + 'favicon.ico'
            ],
            dest: paths.dist
        }
    ];

    var tasks = moves.map(function (move) {
        return gulp.src(move.src).pipe(gulp.dest(move.dest));
    });

    return merge(tasks);
});

gulp.task('dist:css', function () {
    return gulp
        .src([
            paths.cssDir + '**/*.css',
            '!' + paths.cssDir + '**/*.min.css'
        ])
        .pipe(preprocess({ context: settings }))
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.dist + 'css'));
});

gulp.task('dist:js:app', function () {
    var mainStream = gulp
        .src([
            paths.webroot + 'app/app.js',
            '!' + paths.webroot + 'app/settings.js',
            paths.webroot + 'app/**/*Module.js',
            paths.webroot + 'app/**/*.js'
        ]);

    merge(mainStream, config())
        .pipe(preprocess({ context: settings }))
        .pipe(concat(paths.dist + '/js/app.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('dist:js:lib', function () {
    return gulp
        .src([
            paths.libDir + 'sjcl/sjcl.js',
            paths.libDir + 'sjcl/*.js',
            paths.libDir + '**/*.js',
            '!' + paths.libDir + '**/*.min.js',
            '!' + paths.libDir + 'angular/**/*',
            '!' + paths.libDir + 'bootstrap/**/*',
            '!' + paths.libDir + 'jquery/**/*'
        ])
        .pipe(concat(paths.dist + '/js/lib.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('dist:preprocess', function () {
    return gulp
        .src([
            paths.dist + '/**/*.html'
        ], { base: '.' })
        .pipe(preprocess({ context: settings }))
        .pipe(gulp.dest('.'));
});

gulp.task('dist', ['build'], function (cb) {
    return runSequence(
        'dist:clean',
        ['dist:move', 'dist:css', 'dist:js:app', 'dist:js:lib'],
        'dist:preprocess',
        cb);
});

gulp.task('deploy', ['dist'], function () {
    return gulp.src(paths.dist + '**/*')
        .pipe(ghPages({ cacheDir: paths.dist + '.publish' }));
});
