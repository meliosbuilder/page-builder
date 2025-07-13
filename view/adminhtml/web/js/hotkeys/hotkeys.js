define([
    'jquery',
    'Melios_PageBuilder/js/utils/can-use-hotkeys',
], function ($, canUseHotkeys) {
    'use strict';

    $(document).on('dblclick', (e) => {
        var target = $(e.target),
            el = $('.pagebuilder-content-type-active .pagebuilder-options-visible:visible');

        if (!el.length || $('.mls-popup:visible').length) {
            return;
        }

        if (target.hasClass('magento-widget') ||
            target.closest('.inline-wysiwyg').length ||
            target.closest('a').length
        ) {
            return;
        }

        $(el).find('.edit-content-type').first().click();
    });

    $(document).on('keydown', (e) => {
        // stop inline editors when pressing ESC
        var editors = $('[contenteditable=true]:focus');
        if (e.code === 'Escape' && editors.length) {
            return editors.blur();
        }

        if (!canUseHotkeys(e)) {
            return;
        }

        // Switch between mobile/desktop cmd+shift+m
        if (e.code === 'KeyM' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
            var switchBtn = $('.pagebuilder-stage-wrapper.stage-full-screen .page-builder-viewport:not([disabled])');
            if (switchBtn.length) {
                e.preventDefault();
                switchBtn.click();
            }

            return;
        }

        if ($(document.activeElement).parents('body').length) {
            return;
        }

        var el = $('.pagebuilder-content-type-active .pagebuilder-options-visible:visible');

        if (!el.length || $('.mls-popup:visible').length) {
            return;
        }

        // delete hovered element
        if (['Backspace', 'Delete'].includes(e.code) && !e.metaKey && !e.ctrlKey) {
            return el.find('.remove-structural').click();
        }

        // edit hovered element
        if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
            return el.find('.edit-content-type').click();
        }
    });

    // Confirm "back" if it's caused by touch swipe gesture and pagebuilder is opened
    (() => {
        var lastScroll = new Date();

        window.addEventListener('wheel', (e) => {
            lastScroll = new Date();
        }, { passive: true });

        window.addEventListener('scroll', e => {
            lastScroll = new Date();
        }, { passive: true });

        window.addEventListener('beforeunload', e => {
            if ($('.pagebuilder-stage-wrapper.stage-full-screen').length &&
                (new Date() - lastScroll) < 2000 // assume it's an accidental swipe
            ) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    })();
});
