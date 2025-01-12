define([
    'jquery'
], function ($) {
    'use strict';

    return function () {
        return {
            read: function (element) {
                if (element.dataset.mlsLoading === 'lazy') {
                    return 'lazy';
                }

                if (element.dataset.mlsPreload) {
                    return 'preload';
                }

                return 'auto';
            }
        }
    }
});
