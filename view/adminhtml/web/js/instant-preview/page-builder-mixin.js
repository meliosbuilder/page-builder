define([
    'jquery',
    'knockout',
    'Magento_PageBuilder/js/events',
    'Melios_PageBuilder/js/instant-preview/top-modal-utils',
], function ($, ko, events, topModalUtils) {
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
            $('.pagebuilder_modal_form_pagebuilder_modal_form_modal._show button.close').click();
        }
    });

    // Update form when switching view mode
    var lastEdit, prevEdit;
    events.on('contentType:editBefore', (data) => {
        prevEdit = lastEdit;
        lastEdit = data.contentType;
    });
    events.on('stage:viewportChangeAfter', () => {
        var popup = $('.pagebuilder_modal_form_pagebuilder_modal_form_modal._show');

        if (!popup.length || !lastEdit?.preview) {
            return;
        }

        lastEdit.preview.openEdit();
    });

    // Update form data when inline editor inside preview stage is used
    function syncDataToModal(event, data) {
        topModalUtils.updateModalData(data.state);
    }
    events.on('contentType:editBefore', (data) => {
        prevEdit?.dataStore.events.off('state', syncDataToModal);
        lastEdit.dataStore.events.on('state', syncDataToModal);
    });

    // Close slideout when element is removed
    events.on('contentType:removeAfter', (data) => {
        if (data.contentType.id === lastEdit?.id) {
            $('.pagebuilder_modal_form_pagebuilder_modal_form_modal._show button.close').click();
        }
    });

    return function (target) {
        return target;
    };
});
