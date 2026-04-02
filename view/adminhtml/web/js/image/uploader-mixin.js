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
                if (data[0].url) {
                    var img = new Image();

                    img.onload = () => {
                        var oldWidth = this.dataStore.get('width'),
                            oldHeight = this.dataStore.get('height'),
                            newWidth = img.width / 2,
                            newHeight = img.height / 2;

                        if (oldWidth &&
                            oldHeight &&
                            Math.round(oldWidth / oldHeight) === Math.round(newWidth / newHeight) &&
                            Math.abs(newWidth - oldWidth) / oldWidth <= 0.3
                        ) {
                            return;
                        }

                        this.dataStore.set('width', newWidth);
                        this.dataStore.set('mobile_width', newWidth);
                        this.dataStore.set('height', newHeight);
                        this.dataStore.set('mobile_height', newHeight);
                    };
                    img.src = data[0].url;
                }

                return o(data);
            }
        );
        return target;
    };
});
