define([], function () {
    'use strict';

    return {
        defaults: {
            listens: {
                disabled: 'onDisabledUpdate',
                inheritedValue: 'onInheritedValueUpdate'
            },
        },

        onDisabledUpdate: function (flag) {
            this.value(flag ? this.inheritedValue : this.initialValue);
        },

        onInheritedValueUpdate: function (value) {
            if (this.disabled()) {
                this.value(value);
            }
        }
    };
});
