define([
    'jquery',
    'ko',
    'uiRegistry',
    'Magento_Ui/js/form/components/group'
], function ($, ko, uiRegistry, Component) {
    'use strict';

    return Component.extend({
        defaults: {
            breakLine: false,
            oldWidth: 0,
            oldHeight: 0,
            ignoreAspectRatio: false,
            links: {
                width: '${ $.provider }:data.width',
                height: '${ $.provider }:data.height',
            },
            imports: {
                preserveAspectRatio: '${ $.provider }:data.preserve_aspect_ratio',
            },
        },

        initObservable: function () {
            this._super()
                .observe(['width', 'height']);

            this.width.subscribe(newWidth => {
                if (this.canPreserveAspectRatio() && newWidth) {
                    this.updateSizeIgnoringAspectRatio(
                        'height',
                        Math.round(newWidth / (this.oldWidth / this.oldHeight))
                    );
                }
                this.oldWidth = newWidth;
            });

            this.height.subscribe(newHeight => {
                if (this.canPreserveAspectRatio() && newHeight) {
                    this.updateSizeIgnoringAspectRatio(
                        'width',
                        Math.round(newHeight * (this.oldWidth / this.oldHeight))
                    );
                }
                this.oldHeight = newHeight;
            });

            uiRegistry.get(`${this.ns}.${this.ns}.general.image`, image => {
                this.onImageChange(image.value());
                image.value.subscribe(this.onImageChange.bind(this));
            });

            return this;
        },

        onImageChange: function (image) {
            ko.getObservable(image[0], 'previewWidth')?.subscribe(width => {
                setTimeout(() => {
                    var newRatio = Math.round(image[0].previewWidth / (image[0].previewHeight || 1)),
                        oldRatio = Math.round(this.width() / (this.height() || 1));

                    if (newRatio === oldRatio) {
                        return;
                    }

                    this.updateSizeIgnoringAspectRatio('width', width);
                });
            });
            ko.getObservable(image[0], 'previewHeight')?.subscribe(height => {
                setTimeout(() => {
                    var newRatio = Math.round(image[0].previewWidth / (image[0].previewHeight || 1)),
                        oldRatio = Math.round(this.width() / (this.height() || 1));

                    if (newRatio === oldRatio) {
                        return;
                    }

                    this.updateSizeIgnoringAspectRatio('height', height);
                });
            });
        },

        canPreserveAspectRatio: function () {
            return !this.ignoreAspectRatio
                && +this.preserveAspectRatio
                && this.oldWidth
                && this.oldHeight;
        },

        updateSizeIgnoringAspectRatio: function (side, value) {
            this.ignoreAspectRatio = true;
            this[side](value);
            this.ignoreAspectRatio = false;
        }
    })
});
