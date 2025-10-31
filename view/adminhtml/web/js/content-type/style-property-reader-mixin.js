define([
    'jquery',
    'mage/utils/wrapper'
], function ($, wrapper) {
    'use strict';

    return function (target) {
        target.prototype.read = wrapper.wrap(target.prototype.read, (o, el, name) => {
            return name.startsWith('--mls-')
                ? (el.style.getPropertyValue(name) || getComputedStyle(el).getPropertyValue(name))
                : o(el, name);
        });

        return target;
    };
});
