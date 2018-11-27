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

function version(cb) {
    fs.writeFileSync(paths.build + 'version.json', '{"version":"' + package.version + '"}');
    cb();
}

exports.clean = clean;
exports.webfonts = gulp.series(clean, webfonts);
exports.prebuild = gulp.series(clean, webfonts);
exports.version = version;
exports.postdist = version;
