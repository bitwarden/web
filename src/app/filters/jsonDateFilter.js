angular
    .module('bit.filters')

    .filter('jsonDate', function () {
        return function (input) {
            return input.split('T').join(' ');
        };
    });
