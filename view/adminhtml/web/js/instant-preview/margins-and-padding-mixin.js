define([
    'underscore'
], function (_) {
    'use strict';

    return function (target) {
        return target.extend({
            // Fixed not working "reset"
            reset: function () {
                this._super();

                _.each(this.initialValue, (attributeData, attributeType) => {
                    _.each(attributeData, (attributeValue, attributeDirection) => {
                        if (attributeValue === '') {
                            this[attributeType + attributeDirection.capitalize()](attributeValue);
                        }
                    });
                });
            },

            // Magento skips empty sides, so a value set from outside (undo/redo) couldn't clear an input
            _updateObservables: function (value) {
                if (value && _.isString(value)) {
                    value = JSON.parse(value);
                }

                ['margin', 'padding'].forEach(type => {
                    ['top', 'right', 'bottom', 'left'].forEach(direction => {
                        this[type + direction.capitalize()](value?.[type]?.[direction] ?? '');
                    });
                });
            }
        });
    };
});
