define([
    'jquery'
], function ($) {
    'use strict';

    return function () {
        return {
            fromDom: function (value) {
                return value;
            },
            toDom: function (name, data) {
                var mapping = {
                    lazy: 'low',
                    low: 'low',
                    high: 'high',
                    preload: 'high',
                };

                return mapping[data[name]];
            }
        }
    }
});
