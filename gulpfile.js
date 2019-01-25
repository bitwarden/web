const gulp = require('gulp');
const googleWebFonts = require('gulp-google-webfonts');
const del = require('del');
const package = require('./package.json');
const fs = require('fs');

const paths = {
    node_modules: './node_modules/',
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

// ref: https://github.com/t4t5/sweetalert/issues/890
function fixSweetAlert(cb) {
    fs.writeFileSync(paths.node_modules + 'sweetalert/typings/sweetalert.d.ts',
        'import swal, { SweetAlert } from "./core";export default swal;export as namespace swal;');
    cb();
}

exports.clean = clean;
exports.webfonts = gulp.series(clean, webfonts);
exports.prebuild = gulp.series(clean, webfonts);
exports.version = version;
exports.postdist = version;
exports.fixSweetAlert = fixSweetAlert;
exports.postinstall = fixSweetAlert;
