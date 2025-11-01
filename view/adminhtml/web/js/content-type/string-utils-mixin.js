define([
    'jquery',
    'mage/utils/wrapper'
], function ($, wrapper) {
    'use strict';

    return function (target) {
        target.fromSnakeToCamelCase = wrapper.wrap(target.fromSnakeToCamelCase, (o, string) => {
            return string.startsWith('--mls-') ? string : o(string);
        });
        return target;
    };
});
