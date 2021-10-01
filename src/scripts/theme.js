(function () {
    // Set theme on page load
    // This is done outside the Angular app to avoid a flash of unthemed content before it loads
    const defaultTheme = 'light'
    let theme = defaultTheme;

    const savedTheme = window.localStorage.getItem('theme');
    if (savedTheme.indexOf('system') > -1) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else if (savedTheme.indexOf('dark') > -1) {
        theme = 'dark';
    }

    document.documentElement.classList.remove('theme_' + defaultTheme);
    document.documentElement.classList.add('theme_' + theme);
})();
