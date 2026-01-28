define([
    'jquery',
    'tinymce',
    'underscore',
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/events'
], ($, tinyMCE, _, wrapper, events) => {
    'use strict';

    var stickyToolbar = (() => {
        var minTop = 50,
            waitTimer,
            defaultTop,
            toolbar;

        function start() {
            toolbar = $('.tox-tinymce-inline:not([style*="display: none"])')[0];

            if (toolbar) {
                defaultTop = toolbar.offsetTop;
                return updatePosition();
            }

            waitTimer = setTimeout(start, 100);
        }

        function stop() {
            clearTimeout(waitTimer);
            toolbar = null;
        }

        function updatePosition() {
            if (!toolbar) {
                return;
            }

            const rect = toolbar.getBoundingClientRect();
            const maxBottom = window.innerHeight;

            let delta = 0;

            if (rect.top < minTop) {
                delta = minTop - rect.top;
            } else if (rect.bottom > maxBottom) {
                delta = maxBottom - rect.bottom;
            } else if (defaultTop < 0 && rect.top > 1 && toolbar.offsetTop > defaultTop) {
                delta = minTop - rect.top;
            } else if (defaultTop > 0 && rect.bottom < maxBottom && toolbar.offsetTop < defaultTop) {
                delta = maxBottom - rect.bottom;
            }

            toolbar.style.top = toolbar.offsetTop + delta + 'px';
        }

        document.addEventListener('scroll', updatePosition, {
            capture: true,
            passive: true
        });

        return {
            start,
            stop,
        };
    })();

    return function (target) {
        target.getSettings = wrapper.wrap(target.getSettings, function(o) {
            var settings = o();

            settings.menubar = true;
            settings.promotion = false;

            if (settings.toolbar && !settings.toolbar.includes(' code')) {
                settings.toolbar += ' | code';
            }

            settings.setup = wrapper.wrap(settings.setup, (o, editor) => {
                o(editor);

                editor.on('focus', () => setTimeout(stickyToolbar.start, 200));
                editor.on('blur', stickyToolbar.stop);
            });

            return settings;
        });

        return target;
    };
});
