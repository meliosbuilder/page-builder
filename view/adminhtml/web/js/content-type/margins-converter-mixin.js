define([
    'underscore'
], function (_) {
    'use strict';

    // Magento appends "px" to every side, "auto" margin has to stay as is
    return function (Margins) {
        const toDom = Margins.prototype.toDom;

        Margins.prototype.toDom = function () {
            return _.mapObject(toDom.apply(this, arguments), value => value === 'autopx' ? 'auto' : value);
        };

        return Margins;
    };
});
