const gulp = require('gulp');
const googleWebFonts = require('gulp-google-webfonts');
const del = require('del');
const package = require('./package.json');
const fs = require('fs');

const paths = {
    src: './src/',
    build: './build/',
    cssDir: './src/css/',
};

function clean() {
    return del([paths.cssDir]);
}

function webfonts() {
    return gulp.src('./webfonts.list')
        .pipe(googleWebFonts({
            fontsDir: 'webfonts',
            cssFilename: 'webfonts.css',
            format: 'woff',
        }))
        .pipe(gulp.dest(paths.cssDir));
};

function cleanupNodeTypes() {
    return del(['./jslib/node_modules/@types/node/']);
}

function version() {
    fs.writeFileSync(paths.build + 'version.json', '{"version":"' + package.version + '"}');
}

gulp.task('clean', clean);
gulp.task('webfonts', ['clean'], webfonts);
gulp.task('cleanupNodeTypes', cleanupNodeTypes);
gulp.task('prebuild', ['webfonts']);
gulp.task('prebuild:prod', ['prebuild', 'cleanupNodeTypes']);
gulp.task('version', version);
gulp.task('postdist', ['version']);
