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
                if (data[name] === 'lazy') {
                    return 'lazy';
                }
                return false;
            }
        }
    }
});
