angular
    .module('bit.services')

    .factory('validationService', function () {
        var _service = {};

        _service.addErrors = function (form, reason) {
            var data = reason.data;
            var defaultErrorMessage = 'An unexpected error has occured.';
            form.$errors = [];

            if (!data || !angular.isObject(data)) {
                form.$errors.push(defaultErrorMessage);
                return;
            }

            if (!data.ValidationErrors) {
                if (data.Message) {
                    form.$errors.push(data.Message);
                }
                else {
                    form.$errors.push(defaultErrorMessage);
                }

                return;
            }

            for (var key in data.ValidationErrors) {
                if (!data.ValidationErrors.hasOwnProperty(key)) {
                    continue;
                }

                for (var i = 0; i < data.ValidationErrors[key].length; i++) {
                    _service.addError(form, key, data.ValidationErrors[key][i]);
                }
            }
        };

        _service.addError = function (form, key, errorMessage, clearExistingErrors) {
            if (clearExistingErrors || !form.$errors) {
                form.$errors = [];
            }

            form.$errors.push(errorMessage);
            if (key && key !== '' && form[key] && form[key].$registerApiError) {
                form[key].$registerApiError();
            }
        };


        return _service;
    });
