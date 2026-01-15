define([
    'jquery',
    'underscore'
], function ($, _) {
    'use strict';

    var ls = window.localStorage;

    function getData() {
        try {
            return JSON.parse(ls.getItem('melios') || '{}');
        } catch (e) {
            return {};
        }
    }

    function isSet(path) {
        return _.has(getData(), path.split('.'));
    }

    function get(path) {
        return _.get(getData(), path.split('.'));
    }

    function set(path, value) {
        var data = getData(),
            tmp = data,
            parts = path.split('.'),
            last = parts.pop();

        parts.forEach(part => {
            if (!$.isPlainObject(tmp[part])) {
                tmp[part] = {};
            }
            tmp = tmp[part];
        });

        tmp[last] = value;

        ls.setItem('melios', JSON.stringify(data));
    }

    return {
        isSet,
        get,
        set,
    }
});
