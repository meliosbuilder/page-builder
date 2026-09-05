define([], function () {
    'use strict';

    return function () {
        return {
            fromDom: function (value) {
                if (typeof value !== 'string' || !value.length) {
                    return [];
                }

                return value.split(/\s+/).filter(Boolean);
            },

            toDom: function (name, data) {
                var value = data[name];

                if (typeof value === 'string') {
                    value = value.split(/\s+/).filter(Boolean);
                }

                if (!Array.isArray(value) || !value.length) {
                    return undefined;
                }

                return value.join(' ');
            }
        };
    };
});
