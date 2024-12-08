define([
    'jquery',
    'knockout',
    'Melios_PageBuilder/js/copy-paste/serializer',
    'Melios_PageBuilder/js/copy-paste/toast',
    'Melios_PageBuilder/js/utils/can-use-hotkeys'
], function ($, ko, serializer, toast, canUseHotkeys) {
    'use strict';

    $(document).on('copy', e => {
        if (!canUseHotkeys(e)) {
            return;
        }

        var el = $('.pagebuilder-content-type-active');

        if (!el.length) {
            return;
        }

        var contentType = ko.dataFor(el[0])?.contentType;

        if (!contentType) {
            return;
        }

        e.preventDefault();
        e.originalEvent.clipboardData.setData('text', serializer.serialize(contentType));

        toast.show('Copied!');
    });

    $(document).on('paste', e => {
        if (serializer.unserialize(e.originalEvent.clipboardData.getData('text'))) {
            // Prevent inserting serialized data into inputs or contenteditable areas
            // because it's not useful and will confuse non-technical users
            e.preventDefault();

            if (!require.defined('Melios_PageBuilderPro/js/copy-paste/copy-paste')) {
                toast.show('Melios Page Builder Pro version is required to paste copied section.');
            }
        }
    });
});
