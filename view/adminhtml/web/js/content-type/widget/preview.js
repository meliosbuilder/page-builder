define([
    'mage/translate',
    'Magento_PageBuilder/js/content-type/preview',
    'Magento_PageBuilder/js/content-type-menu/hide-show-option',
    'Magento_PageBuilder/js/content-type-menu/option',
    'Magento_PageBuilder/js/events'
], function ($t, Parent, HideShow, Option, events) {
    'use strict';

    return class Widget extends Parent {
        bindEvents() {
            super.bindEvents();

            events.on('melios-widget:dropAfter', args => {
                if (args.id === this.contentType.id && !this.data.main.html()) {
                    this.openWidgetSettings();
                }
            });
        }

        retrieveOptions() {
            const options = super.retrieveOptions();

            options.editContentType = new Option({
                preview: this,
                icon: "<i class='icon-admin-pagebuilder-widgets'></i>",
                title: $t('Edit Widget'),
                action: this.onOptionEdit,
                classes: ['edit-content-type'],
                sort: 30
            });

            options.edit = new Option({
                preview: this,
                icon: "<i class='icon-admin-pagebuilder-systems'></i>",
                title: $t('Edit Container'),
                action: this.openContentTypeSettings,
                classes: ['edit-content-type-container'],
                sort: 31
            });

            options.hideShow = new HideShow({
                preview: this,
                icon: HideShow.showIcon,
                title: HideShow.showText,
                action: this.onOptionVisibilityToggle,
                classes: ['hide-show-content-type'],
                sort: 40
            });

            return options;
        }

        openEdit() {
            this.openWidgetSettings();
        }

        openWidgetSettings(self, event) {
            console.log('openWidgetSettings');
        }

        openContentTypeSettings() {
            return this.edit.open();
        }
    };
});
