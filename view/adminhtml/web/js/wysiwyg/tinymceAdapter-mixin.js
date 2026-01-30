define([
    'tinymce',
    'mage/utils/wrapper'
], (tinyMCE, wrapper) => {
    'use strict';

    return function (target) {
        target.getSettings = wrapper.wrap(target.getSettings, function(o) {
            var settings = o();

            settings.menubar = true;
            settings.promotion = false;

            if (settings.toolbar && !settings.toolbar.includes(' code')) {
                settings.toolbar += ' | code';
            }

            return settings;
        });

        return target;
    };
});
