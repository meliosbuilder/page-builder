define([
    'jquery',
    'knockout',
    'Magento_PageBuilder/js/events'
], function ($, ko, events) {
    'use strict';

    $('body').addClass('melios-instant-preview');

    /**
     * Update on input event
     */
    var memo = new WeakMap();

    $(document)
        .on('change', '.pagebuilder_modal_form_pagebuilder_modal_form_modal', (e) => {
            memo.set(e.target, new Date());
        })
        .on('input', '.pagebuilder_modal_form_pagebuilder_modal_form_modal', (e) => {
            setTimeout(() => {
                var record = memo.get(e.target);
                if (!record || new Date() - record > 30) {
                    $(e.target).change();
                }
            });
        });

    /**
     * Colorpicker
     * 1. Update preview instantly without adding color to recent.
     * 2. Restore proper value when closed using "Cancel"
     */
    $(document).on(
        'move.spectrum hide.spectrum',
        '.pagebuilder_modal_form_pagebuilder_modal_form_modal',
        (e, color) => {
            var input = $(e.target).nextAll('.colorpicker-input'),
                cmp = ko.dataFor(input[0]);

            input.val(color?.toHexString() || '');
            cmp.source.data[cmp.index] = input.val();
            cmp.source.save();
        }
    );

    // Close form on pagebuilder exit
    events.on('stage:fullScreenModeChangeAfter', (data) => {
        if (!data.fullScreen) {
            $('.modals-wrapper > ._show button.close').each(function() {
                $(this).click();
            });
        }
    });

    // Update form when switching view mode
    var lastEdit;
    events.on('contentType:editBefore', (data) => { lastEdit = data.contentType; });
    events.on('stage:viewportChangeAfter', () => {
        var popup = $('.pagebuilder_modal_form_pagebuilder_modal_form_modal._show');

        if (!popup.length || !lastEdit?.preview) {
            return;
        }

        lastEdit.preview.openEdit();
    });

    return function (target) {
        return target;
    };
});
