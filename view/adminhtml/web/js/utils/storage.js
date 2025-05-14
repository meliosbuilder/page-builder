define([
    'underscore'
], function (_) {
    'use strict';

    var data;

    function readStorage() {
        data = JSON.parse(localStorage.getItem('melios') || '{}');
    }

    function writeStorage() {
        localStorage.setItem('melios', JSON.stringify(data));
    }

    return {
        get(key, fallback) {
            if (!data) {
                readStorage();
            }
            return _.get(data, key.split('.'), fallback);
        },

        set(key, value) {
            var tmp = data,
                keys = key.split('.');

            keys.slice(0, -1).forEach(k => {
                tmp[k] = tmp[k] || {};

                if (!_.isObject(tmp[k])) {
                    tmp[k] = {};
                }

                tmp = tmp[k];
            });
            tmp[keys.at(-1)] = value;

            writeStorage();
        }
    }
});
