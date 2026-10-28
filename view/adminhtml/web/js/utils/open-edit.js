define([
    'jquery',
    'Magento_PageBuilder/js/events'
], function ($, events) {
    'use strict';

    var elOpening = null,
        elEditing = null;

    events.on('contentType:editBefore', data => {
        elEditing = data.contentType;
    });
    $(document).on('modalclosed', '.pagebuilder_modal_form_pagebuilder_modal_form_modal', () => {
        elEditing = null;
    });

    /**
     * Edit forms don't open while ajax requests are running. See Melios_PageBuilder edit-content-mixin,
     * and hidden Builder previews (products, blocks) still load their html when data changes.
     * The last element asked for opens once they're done.
     */
    function open(contentType) {
        var waiting = elOpening;

        elOpening = contentType;

        if (!$.active) {
            elOpening = null;
            contentType.preview.openEdit();
        } else if (!waiting) {
            $(document).one('ajaxStop', () => {
                var target = elOpening;

                elOpening = null;
                target?.preview.openEdit();
            });
        }
    }

    return {
        open,
        isEditing: contentType => contentType === elEditing || contentType === elOpening,
        currentEl: () => elEditing,
    };
});
