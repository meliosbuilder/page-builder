define([
    'jquery'
], function ($) {
    'use strict';

    return function() {
        return $('.modals-wrapper > ._show').get().reduce((top, cur) => {
            var z1 = top.style.zIndex,
                z2 = cur.style.zIndex;

            return z2 > z1 ? cur : top;
        });
    }
});
