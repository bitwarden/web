angular
    .module('bit.directives')

    // adaptation of https://github.com/uttesh/ngletteravatar
    .directive('letterAvatar', function () {
        // ref: http://stackoverflow.com/a/16348977/1090359
        function stringToColor(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }

            var color = '#';
            for (var i = 0; i < 3; i++) {
                var value = (hash >> (i * 8)) & 0xFF;
                color += ('00' + value.toString(16)).substr(-2);
            }

            return color;
        }

        function getFirstLetters(data, count) {
            var parts = data.split(' ');
            if (parts && parts.length > 1) {
                var text = '';
                for (var i = 0; i < count; i++) {
                    text += parts[i].substr(0, 1);
                }
                return text;
            }

            return null;
        }

        function getSvg(width, height, color) {
            var svgTag = angular.element('<svg></svg>')
                .attr({
                    'xmlns': 'http://www.w3.org/2000/svg',
                    'pointer-events': 'none',
                    'width': width,
                    'height': height
                })
                .css({
                    'background-color': color,
                    'width': width + 'px',
                    'height': height + 'px'
                });

            return svgTag;
        }

        function getCharText(character, textColor, fontFamily, fontWeight, fontsize) {
            var textTag = angular.element('<text text-anchor="middle"></text>')
                .attr({
                    'y': '50%',
                    'x': '50%',
                    'dy': '0.35em',
                    'pointer-events': 'auto',
                    'fill': textColor,
                    'font-family': fontFamily
                })
                .text(character)
                .css({
                    'font-weight': fontWeight,
                    'font-size': fontsize + 'px',
                });

            return textTag;
        }

        return {
            restrict: 'AE',
            replace: true,
            scope: {
                data: '@'
            },
            link: function (scope, element, attrs) {
                var params = {
                    charCount: attrs.charcount || 2,
                    data: attrs.data,
                    textColor: attrs.textcolor || '#ffffff',
                    bgColor: attrs.bgcolor,
                    height: attrs.height || 45,
                    width: attrs.width || 45,
                    fontsize: attrs.fontsize || 20,
                    fontWeight: attrs.fontweight || 300,
                    fontFamily: attrs.fontfamily || 'Open Sans, HelveticaNeue-Light, Helvetica Neue Light, ' +
                    'Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif',
                    round: attrs.round || 'true',
                    dynamic: attrs.dynamic || 'true',
                    class: attrs.class || ''
                };

                if (params.dynamic === 'true') {
                    scope.$watch('data', function () {
                        generateLetterAvatar();
                    });
                }
                else {
                    generateLetterAvatar();
                }

                function generateLetterAvatar() {
                    var c = null,
                        upperData = scope.data.toUpperCase();

                    if (params.charCount > 1) {
                        c = getFirstLetters(upperData, params.charCount);
                    }

                    if (!c) {
                        c = upperData.substr(0, params.charCount);
                    }

                    var cobj = getCharText(c, params.textColor, params.fontFamily, params.fontWeight, params.fontsize);
                    var color = params.bgColor ? params.bgColor : stringToColor(upperData);
                    var svg = getSvg(params.width, params.height, color);
                    svg.append(cobj);
                    var lvcomponent = angular.element('<div>').append(svg).html();

                    var svgHtml = window.btoa(unescape(encodeURIComponent(lvcomponent)));
                    var src = 'data:image/svg+xml;base64,' + svgHtml;

                    var img = angular.element('<img>').attr({ src: src, title: scope.data });

                    if (params.round === 'true') {
                        img.css('border-radius', '50%');
                    }

                    if (params.class) {
                        img.addClass(params.class);
                    }

                    if (params.dynamic === 'true') {
                        element.empty();
                        element.append(img);
                    }
                    else {
                        element.replaceWith(img);
                    }
                }
            }
        };
    });
