define([
    'jquery',
    'ko',
    'uiRegistry',
    'mage/translate',
    'Magento_Ui/js/form/components/group'
], function ($, ko, uiRegistry, $t, Component) {
    'use strict';

    return Component.extend({
        defaults: {
            breakLine: false,
            aspectRatio: 0,
            ignoreAspectRatio: false,
        },

        initialize: function () {
            this._super();

            this.additionalClasses['mls-dimensions'] = true;

            return this;
        },

        initObservable: function () {
            this._super()
                .observe([
                    'width',
                    'height',
                    'aspectRatio',
                    'preserveAspectRatio',
                ]);

            this.aspectRatio.subscribe(ratio => {
                setTimeout(() => { // wait until width and height will be updated
                    uiRegistry.get(this.paths['preserveAspectRatio'], checkbox => {
                        var fraction = this.toReducedFraction(this.width(), this.height());
                        $('#' + checkbox.uid).parent().attr(
                            'title',
                            $t('Preserve {ratio} aspect ratio').replace('{ratio}', fraction.join(':'))
                        );
                    });
                });
            });

            this.width.subscribe(newWidth => {
                if (newWidth?.includes?.('x')) {
                    return setTimeout(() => {
                        var [width, height] = newWidth.split('x');
                        this.aspectRatio(width / height);
                        this.width(width);
                    });
                }

                if (isNaN(newWidth) || !newWidth) {
                    return;
                }

                uiRegistry.get(this.paths['width'], input => {
                    if (input.disabled()) {
                        return;
                    }

                    if (this.canPreserveAspectRatio()) {
                        this.updateSizeIgnoringAspectRatio(
                            'height',
                            newWidth / this.aspectRatio()
                        );
                    } else if ((!+this.preserveAspectRatio() || !this.aspectRatio()) && this.height()) {
                        this.aspectRatio(newWidth / this.height());
                    }
                });
            });

            this.height.subscribe(newHeight => {
                if (isNaN(newHeight) || !newHeight) {
                    return;
                }

                uiRegistry.get(this.paths['height'], input => {
                    if (input.disabled()) {
                        return;
                    }

                    if (this.canPreserveAspectRatio()) {
                        this.updateSizeIgnoringAspectRatio(
                            'width',
                            newHeight * this.aspectRatio()
                        );
                    } else if ((!+this.preserveAspectRatio() || !this.aspectRatio()) && this.width()) {
                        this.aspectRatio(this.width() / newHeight);
                    }
                });
            });

            uiRegistry.get(this.paths['image'], image => {
                setTimeout(() => {
                    if (!this.width() || !this.height()) {
                        this.onImageChange(image.value());
                    }
                });
                image.value.subscribe(this.onImageChange.bind(this));
            });

            // preserve aspect ratio is not saved actually - check it when enabling
            uiRegistry.get(this.paths['preserveAspectRatio'], checkbox => {
                checkbox.checked(true);
                checkbox.on('disabled', flag => {
                    if (!flag) {
                        checkbox.checked(true);
                    }
                });
            });

            uiRegistry.get(this.paths['width'], input => {
                input.on('disabled', flag => {
                    if (flag) {
                        this.aspectRatio(0);
                    } else {
                        setTimeout(() => {
                            if (this.width() && this.height()) {
                                this.aspectRatio(this.width() / this.height());
                            }
                        });
                    }
                });
            });

            return this;
        },

        onImageChange: function (image) {
            if (!image[0]) {
                this.updateSizeIgnoringAspectRatio('width', '');
                this.updateSizeIgnoringAspectRatio('height', '');
                uiRegistry.get(`${this.name}.use_mobile_dimensions`)?.checked(false);

                return;
            }

            ko.getObservable(image[0], 'previewWidth')?.subscribe(width => {
                uiRegistry.get(this.paths['width'], input => {
                    setTimeout(() => {
                        var newRatio = image[0].previewWidth / (image[0].previewHeight || 1),
                            oldRatio = this.width() / (this.height() || 1);

                        this.aspectRatio(newRatio);

                        if (input.disabled()) {
                            uiRegistry.get(`${this.name}.use_mobile_dimensions`).checked(true);
                        } else if (newRatio === oldRatio) {
                            return;
                        }

                        this.updateSizeIgnoringAspectRatio('width', width / 2);
                    });
                });
            });
            ko.getObservable(image[0], 'previewHeight')?.subscribe(height => {
                uiRegistry.get(this.paths['height'], input => {
                    setTimeout(() => {
                        var newRatio = image[0].previewWidth / (image[0].previewHeight || 1),
                            oldRatio = this.width() / (this.height() || 1);

                        this.aspectRatio(newRatio);

                        if (input.disabled()) {
                            uiRegistry.get(`${this.name}.use_mobile_dimensions`).checked(true);
                        } else if (newRatio === oldRatio) {
                            return;
                        }

                        this.updateSizeIgnoringAspectRatio('height', height / 2);
                    });
                });
            });
        },

        canPreserveAspectRatio: function () {
            return this.aspectRatio() && !this.ignoreAspectRatio && +this.preserveAspectRatio();
        },

        updateSizeIgnoringAspectRatio: function (side, value) {
            if (value !== '') {
                value = value % 1 === 0 ? value : parseFloat(value.toFixed(1));
            }

            this.ignoreAspectRatio = true;
            this[side](value);
            this.ignoreAspectRatio = false;
        },

        toReducedFraction: function (width, height) {
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const divisor = gcd(width, height);

            return [width / divisor, height / divisor];
        }
    })
});
