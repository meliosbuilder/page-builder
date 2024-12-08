define([
    'tinymce',
    'mage/utils/wrapper',
    'Melios_PageBuilder/js/copy-paste/serializer'
], (tinyMCE, wrapper, serializer) => {
    'use strict';

    return function (target) {
        target.getSettings = wrapper.wrap(target.getSettings, function(o) {
            var settings = o();

            settings.paste_preprocess = function(plugin, event) {
                if (serializer.unserialize(tinyMCE.DOM.decode(event.content))) {
                    event.preventDefault();
                    event.content = '';
                }
            }

            return settings;
        });

        return target;
    };
});
