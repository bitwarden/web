angular
    .module('bit.filters')

    .filter('enumLabelClass', function () {
        return function (input, name) {
            if (typeof input !== 'number') {
                return input.toString();
            }

            var output;
            switch (name) {
                case 'OrgUserStatus':
                    switch (input) {
                        case 0:
                            output = 'label-default';
                            break;
                        case 1:
                            output = 'label-warning';
                            break;
                        case 2:
                        /* falls through */
                        default:
                            output = 'label-success';
                    }
                    break;
                default:
                    output = 'label-default';
            }

            return output;
        };
    });
