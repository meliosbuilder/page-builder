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
                        this.dataStore.set('width', img.width / 2);
                        this.dataStore.set('mobile_width', img.width / 2);
                        this.dataStore.set('height', img.height / 2);
                        this.dataStore.set('mobile_height', img.height / 2);
                    };
                    img.src = data[0].url;
                }

                return o(data);
            }
        );
        return target;
    };
});
