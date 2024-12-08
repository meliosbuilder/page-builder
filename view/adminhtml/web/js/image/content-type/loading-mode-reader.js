define([
    'jquery'
], function ($) {
    'use strict';

    return function () {
        return {
            read: function (element) {
                if (element.loading === 'lazy') {
                    return 'lazy';
                }

                if (element.dataset.mlsPreload) {
                    return 'preload';
                }

                if (element.fetchPriority) {
                    return element.fetchPriority;
                }

                return 'auto';
            }
        }
    }
});
