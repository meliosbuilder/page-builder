define([
    'jquery'
], function ($) {
    'use strict';

    return function () {
        return {
            read: function (element) {
                if (element.dataset.mlsSmLoading === 'lazy') {
                    return 'lazy';
                }

                if (element.dataset.mlsSmPreload) {
                    return 'preload';
                }

                return 'auto';
            }
        }
    }
});
