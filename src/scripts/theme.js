(function () {
    // Set theme on page load
    // This is done outside the Angular app to avoid a flash of unthemed content before it loads
    let theme = window.localStorage.getItem('theme');
    if (theme?.indexOf('system') > -1) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else if (theme?.indexOf('dark') > -1) {
        theme = 'dark';
    }
    else {
        theme = 'light';
    }
    document.documentElement.classList.add('theme_' + theme);
})();
