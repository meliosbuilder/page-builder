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
                return data[name] === 'preload';
            }
        }
    }
});
