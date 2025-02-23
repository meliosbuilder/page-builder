define([
    'jquery'
], function ($) {
    'use strict';

    return function (pagebuilders) {
        return new Promise(resolve => {
            var timeout = setTimeout(function () {
                console.error('Page Builder was rendering for 5 seconds without releasing locks.');
            }, 5000);

            $.when.apply(
                null,
                pagebuilders.map(instance => {
                    return instance.stage.renderingLocks[instance.stage.renderingLocks.length - 1];
                })
            ).then(() => {
                clearTimeout(timeout);
                resolve();
            });
        });
    }
});
