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
                    // open widget settings
                }
            });
        }

        retrieveOptions() {
            const options = super.retrieveOptions();

            // options.title = new Option({
            //     preview: this,
            //     title: $t('Widget Wrapper'),
            //     template: 'Magento_PageBuilder/content-type/title',
            //     sort: 20
            // });

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

        openWidgetSettings(self, event) {
            //
        }
    };
});
