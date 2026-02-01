var config = {
    map: {
        '*': {
            'htmlhint': 'Melios_PageBuilder/js/lib/htmlhint',
            '@floating-ui/core': 'Melios_PageBuilder/js/lib/floating-ui/core',
            '@floating-ui/dom': 'Melios_PageBuilder/js/lib/floating-ui/dom',
        },
    },
    config: {
        mixins: {
            'Magento_Ui/js/form/element/abstract': {
                'Melios_PageBuilder/js/instant-preview/abstract-element-mixin': true,
            },
            'Magento_Ui/js/dynamic-rows/dynamic-rows': {
                'Melios_PageBuilder/js/instant-preview/dynamic-rows-mixin': true,
            },
            'Magento_PageBuilder/js/modal/modal': {
                'Melios_PageBuilder/js/instant-preview/modal-mixin': true,
            },
            'Magento_PageBuilder/js/form/element/margins-and-padding': {
                'Melios_PageBuilder/js/instant-preview/margins-and-padding-mixin': true,
            },
            'Magento_PageBuilder/js/content-type-menu/edit': {
                'Melios_PageBuilder/js/instant-preview/edit-content-mixin': true,
            },
            'Magento_Ui/js/form/element/wysiwyg': {
                'Melios_PageBuilder/js/instant-preview/wysiwyg-mixin': true,
            },

            'Magento_PageBuilder/js/wysiwyg/tinymce': {
                'Melios_PageBuilder/js/wysiwyg/wysiwyg-tinymce-mixin': true,
            },

            'Magento_PageBuilder/js/page-builder': {
                // Spotlight: Hotkeys, focus-trap
                'Melios_PageBuilder/js/spotlight/page-builder-mixin': true,
                // Spotlight: Toggle sidebar panel
                'Melios_PageBuilder/js/spotlight/page-builder-header-mixin': true,
                // Simple Save: Add save button, hide template buttons
                'Melios_PageBuilder/js/simple-save/page-builder-mixin': true,
                // Instant Preview
                'Melios_PageBuilder/js/instant-preview/page-builder-mixin': true,
            },

            'Magento_PageBuilder/js/form/element/html-code': {
                // Html Editor
                'Melios_PageBuilder/js/editor/html-code-mixin': true,
            },

            'Magento_PageBuilder/js/form/element/wysiwyg': {
                // Open pagebuilder using Alt+0 hotkey
                'Melios_PageBuilder/js/open-pagebuilder/wysiwyg-mixin': true,
            },

            'Magento_PageBuilder/js/uploader': {
                // Apply dimensions when uploading/selecting image without opening the form
                'Melios_PageBuilder/js/image/uploader-mixin': true,
            },

            'mage/adminhtml/wysiwyg/tiny_mce/tinymce5Adapter': {
                // Do not paste raw data from copy-paste buffer
                'Melios_PageBuilder/js/copy-paste/tinymceAdapter-mixin': true,
                // Enable menubar
                'Melios_PageBuilder/js/wysiwyg/tinymceAdapter-mixin': true,
                // Codemirror
                'Melios_PageBuilder/js/editor/tinymceAdapter-mixin': true,
                // Fullscreen
                'Melios_PageBuilder/js/instant-preview/tinymceAdapter-mixin': true,
            },
            'mage/adminhtml/wysiwyg/tiny_mce/tinymceAdapter': {
                // Do not paste raw data from copy-paste buffer
                'Melios_PageBuilder/js/copy-paste/tinymceAdapter-mixin': true,
                // Enable menubar
                'Melios_PageBuilder/js/wysiwyg/tinymceAdapter-mixin': true,
                // Codemirror
                'Melios_PageBuilder/js/editor/tinymceAdapter-mixin': true,
                // Fullscreen
                'Melios_PageBuilder/js/instant-preview/tinymceAdapter-mixin': true,
            },

            // Allow modern images upload
            'Magento_Ui/js/form/element/image-uploader': {
                'Melios_PageBuilder/js/image-upload/image-uploader-mixin': true,
            },
            'Magento_Backend/js/media-uploader': {
                'Melios_PageBuilder/js/image-upload/media-uploader-mixin': true,
            },

            // Wrap dropppable into RowContentType
            'Magento_PageBuilder/js/drag-drop/matrix': {
                'Melios_PageBuilder/js/make-droppable/matrix-mixin': true,
            },
            'Magento_PageBuilder/js/drag-drop/sortable': {
                'Melios_PageBuilder/js/make-droppable/sortable-mixin': true,
            },

            // Tailwind
            // allow > inside css class: [&>div]:pt-0
            'Magento_Ui/js/lib/validation/validator': {
                'Melios_PageBuilder/js/tailwind/validator-mixin': true,
            },

            // Allow saving css properties as styles (--mls-*)
            'Magento_PageBuilder/js/property/style-property-reader': {
                'Melios_PageBuilder/js/content-type/style-property-reader-mixin': true,
            },
            'Magento_PageBuilder/js/utils/string': {
                'Melios_PageBuilder/js/content-type/string-utils-mixin': true,
            },

            'Magento_PageBuilder/js/content-type/column/preview': {
                'Melios_PageBuilder/js/column-sort-order/column-preview-mixin': true
            },

            // BUGFIXES
            // Fixed incorrectly added 'no-column-line' class when pagebuilder is slowly rendered
            'Magento_PageBuilder/js/content-type/column-group/preview': {
                'Melios_PageBuilder/js/bugfixes/column-group-preview-mixin': true
            },
            // Fixed error when min height is empty, but other mobile values are not
            'Magento_PageBuilder/js/converter/style/min-height': {
                'Melios_PageBuilder/js/bugfixes/converter-style-min-height-mixin': true
            },
            // Do not close modal on Escape, if nested pagebuilder is opened
            'Magento_Ui/js/modal/modal': {
                'Melios_PageBuilder/js/bugfixes/modal-mixin': true
            },
        }
    },
    deps: [
        'Melios_PageBuilder/js/copy-paste/copy-paste',
        'Melios_PageBuilder/js/hotkeys/hotkeys',
        'Melios_PageBuilder/js/tailwind/editor',
    ]
};
