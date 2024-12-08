var config = {
    config: {
        mixins: {
            'Magento_PageBuilder/js/form/element/wysiwyg': {
                // Open pagebuilder using Alt+0 hotkey
                'Melios_PageBuilder/js/open-pagebuilder/wysiwyg-mixin': true,
            },

            // BUGFIXES
            // Fixed incorrectly added 'no-column-line' class when pagebuilder is slowly rendered
            'Magento_PageBuilder/js/content-type/column-group/preview': {
                'Melios_PageBuilder/js/bugfixes/column-group-preview-mixin': true
            },
        }
    },
};
