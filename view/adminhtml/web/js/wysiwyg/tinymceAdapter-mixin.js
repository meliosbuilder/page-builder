define([
    'jquery',
    'tinymce',
    'underscore',
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/events'
], ($, tinyMCE, _, wrapper, events) => {
    'use strict';

    events.on('stage:fullScreenModeChangeAfter', (data) => {
        if (data.fullScreen) {
            $('.pagebuilder-stage-wrapper.stage-is-active')
                .get(0)
                .addEventListener('scroll', (e) => {
                    var scrollTop = e.target.scrollTop;

                    console.log(
                        scrollTop,
                        $('.tox-tinymce-inline:not([style*="display: none"])').offset()
                    );
                }, { passive: true });
        }
    });

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
