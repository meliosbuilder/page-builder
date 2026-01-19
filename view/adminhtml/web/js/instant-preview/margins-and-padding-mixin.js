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
            }
        });
    };
});
