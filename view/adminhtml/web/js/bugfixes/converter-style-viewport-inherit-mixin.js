define([
    'mage/utils/wrapper'
], function (wrapper) {
    'use strict';

    return function (target) {
        target.prototype.toDom = wrapper.wrap(target.prototype.toDom, (o, name, data) => {
            var key = name === 'overlay_color' ? 'show_overlay' : 'show_button';

            if (data[key] === undefined) {
                return undefined;
            }
            return o(name, data);
        });
        return target;
    };
});
