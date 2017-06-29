/// <binding BeforeBuild='build, dist' Clean='clean' ProjectOpened='build. dist' />

var gulp = require('gulp'),
    rimraf = require('rimraf'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    ghPages = require('gulp-gh-pages'),
    less = require('gulp-less'),
    connect = require('gulp-connect'),
    ngAnnotate = require('gulp-ng-annotate'),
    preprocess = require('gulp-preprocess'),
    runSequence = require('run-sequence'),
    merge = require('merge-stream'),
    ngConfig = require('gulp-ng-config'),
    settings = require('./settings.json'),
    project = require('./package.json'),
    jshint = require('gulp-jshint'),
    _ = require('lodash'),
    webpack = require('webpack-stream'),
    browserify = require('browserify'),
    derequire = require('gulp-derequire'),
    source = require('vinyl-source-stream');

var paths = {};
paths.dist = './dist/';
paths.webroot = './src/'
paths.js = paths.webroot + 'js/**/*.js';
paths.minJs = paths.webroot + 'js/**/*.min.js';
paths.concatJsDest = paths.webroot + 'js/bw.min.js';
paths.libDir = paths.webroot + 'lib/';
paths.npmDir = 'node_modules/';
paths.lessDir = paths.webroot + 'less/';
paths.cssDir = paths.webroot + 'css/';
paths.jsDir = paths.webroot + 'js/';

var randomString = Math.random().toString(36).substring(7);

gulp.task('lint', function () {
    return gulp.src(paths.webroot + 'app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('build', function (cb) {
    return runSequence(
        'clean',
        ['browserify', 'lib', 'webpack', 'less', 'settings', 'lint', 'min:js'],
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
    return gulp.src(
        [
            paths.js,
            '!' + paths.minJs,
            '!' + paths.webroot + 'js/fallback*.js',
            '!' + paths.webroot + 'js/u2f-connector.js'
        ], { base: '.' })
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
            src: paths.npmDir + 'angular-ui-bootstrap/dist/*tpls*.js',
            dest: paths.libDir + 'angular-ui-bootstrap'
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
            src: paths.npmDir + 'angular-resource/*resource*.js',
            dest: paths.libDir + 'angular-resource'
        },
        {
            src: paths.npmDir + 'angular-sanitize/*sanitize*.js',
            dest: paths.libDir + 'angular-sanitize'
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
        },
        {
            src: paths.npmDir + 'node-forge/dist/prime.worker.*',
            dest: paths.libDir + 'forge'
        },
        {
            src: [
                paths.npmDir + 'angulartics-google-analytics/lib/angulartics*.js',
                paths.npmDir + 'angulartics/src/angulartics.js'
            ],
            dest: paths.libDir + 'angulartics'
        },
        {
            src: paths.npmDir + 'duo_web_sdk/index.js',
            dest: paths.libDir + 'duo'
        }
    ];

    var tasks = libs.map(function (lib) {
        return gulp.src(lib.src).pipe(gulp.dest(lib.dest));
    });

    return merge(tasks);
});

gulp.task('webpack', ['webpack:forge']);

gulp.task('webpack:forge', function () {
    var forgeDir = paths.npmDir + '/node-forge/lib/';

    return gulp.src([
        forgeDir + 'pbkdf2.js',
        forgeDir + 'aes.js',
        forgeDir + 'rsa.js',
        forgeDir + 'hmac.js',
        forgeDir + 'sha256.js',
        forgeDir + 'random.js',
        forgeDir + 'forge.js'
    ]).pipe(webpack({
        output: {
            filename: 'forge.js',
            library: 'forge',
            libraryTarget: 'umd'
        },
        node: {
            Buffer: false,
            process: false,
            crypto: false,
            setImmediate: false
        }
    })).pipe(gulp.dest(paths.libDir + 'forge'));
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
                    environment: project.env
                }
            }, require('./settings' + (project.env !== 'Development' ? ('.' + project.env) : '') + '.json') || {})
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

gulp.task('browserify', ['browserify:stripe', 'browserify:cc']);

gulp.task('browserify:stripe', function () {
    return browserify(paths.npmDir + 'angular-stripe/src/index.js',
        {
            entry: '.',
            standalone: 'angularStripe',
            global: true
        })
        .transform('exposify', { expose: { angular: 'angular' } })
        .bundle()
        .pipe(source('angular-stripe.js'))
        .pipe(derequire())
        .pipe(gulp.dest(paths.libDir + 'angular-stripe'));
});

gulp.task('browserify:cc', function () {
    return browserify(paths.npmDir + 'angular-credit-cards/src/index.js',
        {
            entry: '.',
            standalone: 'angularCreditCards'
        })
        .transform('exposify', { expose: { angular: 'angular' } })
        .bundle()
        .pipe(source('angular-credit-cards.js'))
        .pipe(derequire())
        .pipe(gulp.dest(paths.libDir + 'angular-credit-cards'));
});

gulp.task('dist:clean', function (cb) {
    return rimraf(paths.dist, cb);
});

gulp.task('dist:move', function () {
    var moves = [
        {
            src: './CNAME',
            dest: paths.dist
        },
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
            src: paths.npmDir + 'node-forge/dist/prime.worker.*',
            dest: paths.dist + 'lib/forge'
        },
        {
            src: paths.webroot + 'js/bw.min.js',
            dest: paths.dist + 'js'
        },
        {
            src: [
                paths.webroot + '**/app/**/*.html',
                paths.webroot + '**/images/**/*',
                paths.webroot + 'index.html',
                paths.webroot + 'u2f-connector.html',
                paths.webroot + 'duo-connector.html',
                paths.webroot + 'favicon.ico',
                paths.webroot + 'app-id.json'
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
        .pipe(preprocess({ context: { cacheTag: randomString } }))
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
        .pipe(preprocess({ context: { cacheTag: randomString } }))
        .pipe(concat(paths.dist + '/js/app.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('dist:js:fallback', function () {
    var mainStream = gulp
        .src([
            paths.webroot + 'js/fallback*.js'
        ]);

    merge(mainStream, config())
        .pipe(preprocess({ context: { cacheTag: randomString } }))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.dist + 'js'));
});

gulp.task('dist:js:u2f', function () {
    var mainStream = gulp
        .src([
            paths.webroot + 'js/u2f*.js'
        ]);

    merge(mainStream, config())
        .pipe(concat(paths.dist + '/js/u2f.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('dist:js:lib', function () {
    return gulp
        .src([
            paths.libDir + 'angulartics/angulartics.js',
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
        .pipe(preprocess({ context: { cacheTag: randomString } }))
        .pipe(gulp.dest('.'));
});

gulp.task('dist', ['build'], function (cb) {
    return runSequence(
        'dist:clean',
        ['dist:move', 'dist:css', 'dist:js:app', 'dist:js:lib', 'dist:js:fallback', 'dist:js:u2f'],
        'dist:preprocess',
        cb);
});

gulp.task('deploy', ['dist'], function () {
    return gulp.src(paths.dist + '**/*')
        .pipe(ghPages({ cacheDir: paths.dist + '.publish' }));
});

gulp.task('deploy-preview', ['dist'], function () {
    return gulp.src(paths.dist + '**/*')
        .pipe(ghPages({
            cacheDir: paths.dist + '.publish',
            remoteUrl: 'git@github.com:bitwarden/web-preview.git'
        }));
});

gulp.task('serve', function () {
    connect.server({
        port: 4001,
        root: ['src'],
        //https: true,
        middleware: function (connect, opt) {
            return [function (req, res, next) {
                if (req.originalUrl.indexOf('app-id.json') > -1) {
                    res.setHeader('Content-Type', 'application/fido.trusted-apps+json');
                }
                next();
            }];
        }
    });
});
