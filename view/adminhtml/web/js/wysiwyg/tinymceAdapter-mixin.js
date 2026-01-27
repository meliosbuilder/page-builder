define([
    'jquery',
    'tinymce',
    'underscore',
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/events'
], ($, tinyMCE, _, wrapper, events) => {
    'use strict';

    var curStage;

    function onScroll() {
        const toolbar = document.querySelector('.tox-tinymce-inline:not([style*="display: none"])');

        if (!toolbar) {
            return;
        }

        const rect = toolbar.getBoundingClientRect();
        const minTop = 50;
        const maxBottom = window.innerHeight;

        let delta = 0;

        if (rect.top < minTop) {
            delta = minTop - rect.top;
        } else if (rect.bottom > maxBottom) {
            delta = maxBottom - rect.bottom;
        }

        if (delta !== 0) {
            toolbar.style.top = (toolbar.offsetTop + delta) + 'px';
        }
    }

    document.addEventListener('scroll', onScroll, {
        capture: true,
        passive: true
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
