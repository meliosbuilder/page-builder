define([
    'jquery',
    'knockout',
    'mage/utils/wrapper',
    'Melios_PageBuilder/js/image/default-size',
], function ($, ko, wrapper, defaultSize) {
    'use strict';

    return function (target) {
        target.prototype.onImageChanged = wrapper.wrap(
            target.prototype.onImageChanged,
            function (o, data) {
                var url = data[0].url;

                if (url) {
                    defaultSize(url, this.dataStore.get('width'), this.dataStore.get('height')).then(size => {
                        if (!size) {
                            return;
                        }

                        this.dataStore.set('width', size.width);
                        this.dataStore.set('mobile_width', size.width);
                        this.dataStore.set('height', size.height);
                        this.dataStore.set('mobile_height', size.height);
                    });
                }

                return o(data);
            }
        );
        return target;
    };
});
