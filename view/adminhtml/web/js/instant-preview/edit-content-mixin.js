define([
    'underscore',
    'mage/utils/wrapper'
], function (_, wrapper) {
    'use strict';

    return function (target) {
        // prevent js errors when clicking the edit icon fast enough
        target.prototype.open = wrapper.wrap(
            target.prototype.open,
            _.debounce(function (o) {
                o();
            }, 500, true)
        );

        return target;
    };
});
