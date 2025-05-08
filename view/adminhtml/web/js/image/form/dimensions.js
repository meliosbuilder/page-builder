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
            aspectRatio: 0,
            ignoreAspectRatio: false,
            links: {
                width: '${ $.provider }:data.width',
                height: '${ $.provider }:data.height',
                preserveAspectRatio: '${ $.provider }:data.preserve_aspect_ratio',
            },
        },

        initObservable: function () {
            this._super()
                .observe(['width', 'height', 'preserveAspectRatio']);

            this.width.subscribe(newWidth => {
                if (isNaN(newWidth) || !newWidth) {
                    return;
                }

                if (this.canPreserveAspectRatio()) {
                    this.updateSizeIgnoringAspectRatio(
                        'height',
                        Math.round(newWidth / this.aspectRatio)
                    );
                } else if (!+this.preserveAspectRatio() && this.height()) {
                    this.aspectRatio = newWidth / this.height();
                }
            });

            this.height.subscribe(newHeight => {
                if (isNaN(newHeight) || !newHeight) {
                    return;
                }

                if (this.canPreserveAspectRatio()) {
                    this.updateSizeIgnoringAspectRatio(
                        'width',
                        Math.round(newHeight * this.aspectRatio)
                    );
                } else if (!+this.preserveAspectRatio() && this.width()) {
                    this.aspectRatio = this.width() / newHeight;
                }
            });

            uiRegistry.get(`${this.ns}.${this.ns}.general.image`, image => {
                setTimeout(() => {
                    if (!this.width() || !this.height()) {
                        this.onImageChange(image.value());
                    }
                });
                image.value.subscribe(this.onImageChange.bind(this));
            });

            uiRegistry.get(`${this.name}.preserve_aspect_ratio`, checkbox => {
                checkbox.checked(true);
            });

            return this;
        },

        onImageChange: function (image) {
            ko.getObservable(image[0], 'previewWidth')?.subscribe(width => {
                setTimeout(() => {
                    var newRatio = image[0].previewWidth / (image[0].previewHeight || 1),
                        oldRatio = this.width() / (this.height() || 1);

                    this.aspectRatio = newRatio;
                    if (newRatio === oldRatio) {
                        return;
                    }

                    this.updateSizeIgnoringAspectRatio('width', width);
                });
            });
            ko.getObservable(image[0], 'previewHeight')?.subscribe(height => {
                setTimeout(() => {
                    var newRatio = image[0].previewWidth / (image[0].previewHeight || 1),
                        oldRatio = this.width() / (this.height() || 1);

                    this.aspectRatio = newRatio;
                    if (newRatio === oldRatio) {
                        return;
                    }

                    this.updateSizeIgnoringAspectRatio('height', height);
                });
            });
        },

        canPreserveAspectRatio: function () {
            return this.aspectRatio && !this.ignoreAspectRatio && +this.preserveAspectRatio();
        },

        updateSizeIgnoringAspectRatio: function (side, value) {
            this.ignoreAspectRatio = true;
            this[side](value);
            this.ignoreAspectRatio = false;
        }
    })
});
