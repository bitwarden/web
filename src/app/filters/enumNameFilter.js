angular
    .module('bit.filters')

    .filter('enumName', function () {
        return function (input, name) {
            if (typeof input !== 'number') {
                return input.toString();
            }

            var output;
            switch (name) {
                case 'OrgUserStatus':
                    switch (input) {
                        case 0:
                            output = 'Invited';
                            break;
                        case 1:
                            output = 'Accepted';
                            break;
                        case 2:
                        /* falls through */
                        default:
                            output = 'Confirmed';
                    }
                    break;
                case 'OrgUserType':
                    switch (input) {
                        case 0:
                            output = 'Owner';
                            break;
                        case 1:
                            output = 'Admin';
                            break;
                        case 2:
                        /* falls through */
                        default:
                            output = 'User';
                    }
                    break;
                default:
                    output = input.toString();
            }

            return output;
        };
    });
