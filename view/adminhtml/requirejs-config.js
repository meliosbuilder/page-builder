var config = {
    config: {
        mixins: {
            'Magento_PageBuilder/js/page-builder': {
                // Spotlight: Hotkeys, focus-trap
                'Melios_PageBuilder/js/spotlight/page-builder-mixin': true,
                // Spotlight: Toggle sidebar panel
                'Melios_PageBuilder/js/spotlight/page-builder-header-mixin': true,
            },

            'Magento_PageBuilder/js/form/element/wysiwyg': {
                // Open pagebuilder using Alt+0 hotkey
                'Melios_PageBuilder/js/open-pagebuilder/wysiwyg-mixin': true,
            },

            'mage/adminhtml/wysiwyg/tiny_mce/tinymce5Adapter': {
                // Do not paste raw data from copy-paste buffer
                'Melios_PageBuilder/js/copy-paste/tinymceAdapter-mixin': true,
                // Enable menubar
                'Melios_PageBuilder/js/wysiwyg/tinymceAdapter-mixin': true
            },
            'mage/adminhtml/wysiwyg/tiny_mce/tinymceAdapter': {
                // Do not paste raw data from copy-paste buffer
                'Melios_PageBuilder/js/copy-paste/tinymceAdapter-mixin': true,
                // Enable menubar
                'Melios_PageBuilder/js/wysiwyg/tinymceAdapter-mixin': true
            },

            // BUGFIXES
            // Fixed incorrectly added 'no-column-line' class when pagebuilder is slowly rendered
            'Magento_PageBuilder/js/content-type/column-group/preview': {
                'Melios_PageBuilder/js/bugfixes/column-group-preview-mixin': true
            },
        }
    },
    deps: [
        'Melios_PageBuilder/js/copy-paste/copy-paste',
        'Melios_PageBuilder/js/hotkeys/hotkeys',
    ]
};
