define([
    'ko',
    'Magento_Ui/js/form/element/abstract'
], function (ko, Abstract) {
    'use strict';

    /**
     * Range slider + number input. Empty value means "Default":
     * number input shows the placeholder, slider stays at min (not in the middle).
     */
    return Abstract.extend({
        defaults: {
            min: 0,
            max: 100,
            step: 1
        },

        initObservable: function () {
            this._super();

            this.rangeValue = ko.pureComputed({
                read: () => this.value() === '' || this.value() == null ? this.min : this.value(),
                write: value => this.value(value)
            });

            return this;
        }
    });
});
