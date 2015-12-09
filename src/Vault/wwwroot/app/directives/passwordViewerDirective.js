angular
    .module('bit.directives')

    .directive('passwordViewer', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var passwordViewer = attr.passwordViewer;
                if (!passwordViewer) {
                    return;
                }

                element.onclick = function (event) { };
                element.on('click', function (event) {
                    var passwordElement = $(passwordViewer);
                    if (passwordElement && passwordElement.attr('type') == 'password') {
                        element.removeClass('fa-eye').addClass('fa-eye-slash');
                        passwordElement.attr('type', 'text');
                    }
                    else if (passwordElement && passwordElement.attr('type') == 'text') {
                        element.removeClass('fa-eye-slash').addClass('fa-eye');
                        passwordElement.attr('type', 'password');
                    }
                });
            }
        };
    });
