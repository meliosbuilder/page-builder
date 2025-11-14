define([
    'jquery',
    'mage/utils/wrapper'
], function ($, wrapper) {
    'use strict';

    return function (target) {
        target.prototype.read = wrapper.wrap(target.prototype.read, (o, el, name) => {
            var result = name.startsWith('--mls-')
                ? (el.style.getPropertyValue(name) || getComputedStyle(el).getPropertyValue(name))
                : o(el, name);

            // this code reads value saved in MeliosBuilder < 1.11
            if (result === '' && name === '--mls-colgroup-gap') {
                result = el.style.getPropertyValue('gap') || getComputedStyle(el).getPropertyValue('gap')
            }

            return result;
        });

        return target;
    };
});
