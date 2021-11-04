// Set theme on page load
// This is done outside the Angular app to avoid a flash of unthemed content before it loads
// The defaultTheme is also set in the html itself to make sure that some theming is always applied
(function () {
    const defaultTheme = 'light'
    const htmlEl = document.documentElement;
    let theme = defaultTheme;

    const globalsJson = window.localStorage.getItem('globals');
    const globals = JSON.parse(globalsJson);
    console.debug(globals);
    if (globals.theme != null) {
        if (globals.theme.indexOf('system') > -1) {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else if (globals.theme.indexOf('dark') > -1) {
            theme = 'dark';
        }
    }

    if (!htmlEl.classList.contains('theme_' + theme)) {
        htmlEl.classList.remove('theme_' + defaultTheme);
        htmlEl.classList.add('theme_' + theme);
    }
})();
