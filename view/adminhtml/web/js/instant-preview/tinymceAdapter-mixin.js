define([
    'jquery',
    'mage/utils/wrapper',
    'Melios_PageBuilder/js/utils/fullscreen'
], ($, wrapper, fullscreen) => {
    'use strict';

    return function (target) {
        target.getSettings = wrapper.wrap(target.getSettings, function(getSettings) {
            var settings = getSettings();

            if (typeof settings.plugins === 'string') {
                settings.plugins += ' fullscreen';
            } else {
                settings.plugins.push('fullscreen');
            }

            settings.toolbar = 'fullscreen | ' + settings.toolbar;

            settings.setup = wrapper.wrap(settings.setup, (o, editor) => {
                o(editor);
                editor.on('ExecCommand', (e) => {
                    if (!e.isDefaultPrevented() && e.command === 'mceFullScreen') {
                        var el = $(e.target.container);

                        if (el.hasClass('tox-fullscreen')) {
                            fullscreen.enter(el);
                        } else {
                            fullscreen.exit(el);
                        }
                    }
                });
            });

            return settings;
        });

        return target;
    };
});
