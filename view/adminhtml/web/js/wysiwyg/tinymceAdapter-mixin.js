define([
    'tinymce',
    'mage/utils/wrapper'
], (tinyMCE, wrapper) => {
    'use strict';

    return function (target) {
        target.getSettings = wrapper.wrap(target.getSettings, function(o) {
            var settings = o();

            settings.menubar = true;

            return settings;
        });

        return target;
    };
});
