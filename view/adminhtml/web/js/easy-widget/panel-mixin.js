define([
    'underscore',
    'mage/utils/wrapper'
], function (_, wrapper) {
    'use strict';

    return function (target) {
        target.prototype.populateContentTypes = wrapper.wrap(
            target.prototype.populateContentTypes,
            function (o) {
                this.pageBuilder.config.menu_sections.melios_widgets = {
                    label: 'Widgets',
                    name: 'melios_widgets',
                    sortOrder: '100',
                    translate: 'label',
                };

                _.map(this.pageBuilder.config.tinymce?.widgets.types || {}, (label, type) => {
                    this.pageBuilder.config.content_types[type] = {
                        label,
                        name: 'text',
                        allowed_parents: this.pageBuilder.config.content_types.text.allowed_parents,
                        menu_section: 'melios_widgets',
                        is_system: true,
                    };
                });

                o();
            }
        );

        return target;
    };
});
