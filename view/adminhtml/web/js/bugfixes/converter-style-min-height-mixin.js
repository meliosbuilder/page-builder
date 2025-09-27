define([
    'mage/utils/wrapper'
], function (wrapper) {
    'use strict';

    return function (target) {
        target.prototype.toDom = wrapper.wrap(target.prototype.toDom, (o, name, data) => {
            if (data[name] === undefined) {
                data[name] = '';
            }
            return o(name, data);
        });
        return target;
    };
});
