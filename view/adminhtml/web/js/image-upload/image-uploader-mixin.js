define([
    'jquery'
], function ($) {
    'use strict';

    var extensions = [
        'avif',
        'svg',
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
            },

            /**
             * Media gallery triggers "change" right after closing the dialog,
             * before the insert request returns the image url. Ignore it,
             * otherwise an empty file is added (broken preview, /media/undefined request).
             */
            addFileFromMediaGallery: function (imageUploader, e) {
                var result;

                if (!$(e.target).val()) {
                    return;
                }

                result = this._super(imageUploader, e);
                // Next gallery pick must not re-add this file on the early "change"
                $(e.target).val('');

                return result;
            }
        });
    };
});
