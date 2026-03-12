define([
    'jquery'
], function ($) {
    'use strict';

    return class RemoveAuto {
        fromDom(value) {
            return value.replace('auto ', '');
        }

        toDom(name, data) {
            if (data[name]) {
                return 'auto ' + data[name];
            }
        }
    }
});
