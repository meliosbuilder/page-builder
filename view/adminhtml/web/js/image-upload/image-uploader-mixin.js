define([], function () {
    'use strict';

    var extensions = [
        'avif',
        'webp',
    ];

    return function (target) {
        return target.extend({
            initialize: function () {
                this._super();

                if (!this.allowedExtensions?.includes) {
                    return;
                }

                extensions.forEach(extension => {
                    if (!this.allowedExtensions.includes(extension)) {
                        this.allowedExtensions += ' ' + extension;
                    }
                });
            }
        });
    };
});
