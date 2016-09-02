angular
    .module('bit.directives')

    .directive('passwordMeter', function () {
        return {
            template: '<div class="progress {{outerClass}}"><div class="progress-bar progress-bar-{{valueClass}}" ' +
                + 'role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="100" ' +
                + 'ng-style="{width : ( value + \'%\' ) }"><span class="sr-only">{{value}}%</span></div></div>',
            restrict: 'A',
            scope: {
                password: '=passwordMeter',
                username: '=passwordMeterUsername',
                outerClass: '@?'
            },
            link: function (scope) {
                var measureStrength = function (username, password) {
                    if (!password || password === username) {
                        return 0;
                    }

                    var strength = password.length;

                    if (username && username !== '') {
                        if (username.indexOf(password) !== -1) strength -= 15;
                        if (password.indexOf(username) !== -1) strength -= username.length;
                    }

                    if (password.length > 0 && password.length <= 4) strength += password.length;
                    else if (password.length >= 5 && password.length <= 7) strength += 6;
                    else if (password.length >= 8 && password.length <= 15) strength += 12;
                    else if (password.length >= 16) strength += 18;

                    if (password.match(/[a-z]/)) strength += 1;
                    if (password.match(/[A-Z]/)) strength += 5;
                    if (password.match(/\d/)) strength += 5;
                    if (password.match(/.*\d.*\d.*\d/)) strength += 5;
                    if (password.match(/[!,@,#,$,%,^,&,*,?,_,~]/)) strength += 5;
                    if (password.match(/.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~]/)) strength += 5;
                    if (password.match(/(?=.*[a-z])(?=.*[A-Z])/)) strength += 2;
                    if (password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)) strength += 2;
                    if (password.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!,@,#,$,%,^,&,*,?,_,~])/)) strength += 2;

                    strength = Math.round(strength * 2);
                    return Math.max(0, Math.min(100, strength));
                };

                var getClass = function (strength) {
                    switch (Math.round(strength / 33)) {
                        case 0:
                        case 1:
                            return 'danger';
                        case 2:
                            return 'warning';
                        case 3:
                            return 'success';
                    }
                };

                var updateMeter = function (scope) {
                    scope.value = measureStrength(scope.username, scope.password);
                    scope.valueClass = getClass(scope.value);
                };

                scope.$watch('password', function () {
                    updateMeter(scope);
                });

                scope.$watch('username', function () {
                    updateMeter(scope);
                });
            },
        };
    });
