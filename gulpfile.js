const gulp = require('gulp');
const googleWebFonts = require('gulp-google-webfonts');

gulp.task('build', ['webfonts']);

gulp.task('webfonts', () => {
    return gulp.src('./webfonts.list')
        .pipe(googleWebFonts({
            fontsDir: 'webfonts',
            cssFilename: 'webfonts.css'
        }))
        .pipe(gulp.dest('./src/css/'));
});
