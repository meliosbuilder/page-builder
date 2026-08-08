define([
    'jquery',
    'knockout',
    'mage/utils/wrapper',
], function ($, ko, wrapper) {
    'use strict';

    return function (target) {
        target.prototype.onImageChanged = wrapper.wrap(
            target.prototype.onImageChanged,
            function (o, data) {
                var url = data[0].url,
                    isVector = url.toLowerCase().endsWith('.svg');

                if (url) {
                    var img = new Image();

                    img.onload = () => {
                        var oldWidth = this.dataStore.get('width'),
                            oldHeight = this.dataStore.get('height'),
                            newWidth = img.width,
                            newHeight = img.height,
                            widthFactor = Math.max(oldWidth, newWidth) / Math.min(oldWidth, newWidth);

                        if (!isVector) {
                            newWidth /= 2;
                            newHeight /= 2;
                        }

                        if (oldWidth &&
                            oldHeight &&
                            Math.round(oldWidth / oldHeight) === Math.round(newWidth / newHeight) &&
                            Math.abs(newWidth - oldWidth) / oldWidth <= 0.3 &&
                            widthFactor < 2
                        ) {
                            return;
                        }

                        this.dataStore.set('width', newWidth);
                        this.dataStore.set('mobile_width', newWidth);
                        this.dataStore.set('height', newHeight);
                        this.dataStore.set('mobile_height', newHeight);
                    };
                    img.src = url;
                }

                return o(data);
            }
        );
        return target;
    };
});
