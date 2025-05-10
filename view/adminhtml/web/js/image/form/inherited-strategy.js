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
            var key = this.checked ? 'checked' : 'value';

            this[key](flag ? this.inheritedValue : this.initialValue);
        },

        onInheritedValueUpdate: function (value) {
            var key = this.checked ? 'checked' : 'value';

            if (this.disabled()) {
                this[key](value);
            }
        }
    };
});
