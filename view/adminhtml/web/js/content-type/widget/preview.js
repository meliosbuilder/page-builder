define([
    'jquery',
    'knockout',
    'mage/translate',
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/content-type/preview',
    'Magento_PageBuilder/js/content-type-menu/hide-show-option',
    'Magento_PageBuilder/js/content-type-menu/option',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/config'
], function ($, ko, $t, wrapper, Parent, HideShow, Option, events, config) {
    'use strict';

    function overrideWidgetTools() {
        WysiwygWidget.Widget.prototype.wysiwygExists = wrapper.wrap(
            WysiwygWidget.Widget.prototype.wysiwygExists,
            function (o) {
                if (widgetTools.getActiveSelectedNode()?.meliosPreview) {
                    return true;
                }
                return o();
            }
        );
        WysiwygWidget.Widget.prototype.updateContent = wrapper.wrap(
            WysiwygWidget.Widget.prototype.updateContent,
            function (o, content) {
                var node = widgetTools.getActiveSelectedNode();

                if (node?.meliosPreview) {
                    return node.meliosPreview.edit.dataStore.set(
                        'html',
                        Base64.idDecode($(content).attr('id'))
                    );
                }
                return o(content);
            }
        );
    }

    return class Widget extends Parent {
        bindEvents() {
            super.bindEvents();

            this.widgetTitle = ko.observable();
            this.widgetIcon = ko.observable();
            this.contentType.dataStore.subscribe(data => {
                var type = data.html.match(/type="(.+?)"/),
                    editorConfig = config.getConfig('tinymce');

                if (!type) {
                    return;
                }

                this.widgetTitle(editorConfig.widgets.types[type[1]] || type[1]);
            });

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
            require(['mage/adminhtml/wysiwyg/widget'], () => {
                var node, html = this.data.main.html();

                if (!this.widgetOverriden) {
                    this.widgetOverriden = true;
                    overrideWidgetTools();
                }

                try {
                    node = $(html);
                } catch {
                }

                if (!node?.length) {
                    node = $('<div>').appendTo('body');
                }

                node.data('melios-widget', true).data('preview', this)
                    .attr('id', Base64.idEncode(html));
                node[0].meliosPreview = this;

                widgetTools.setActiveSelectedNode(node[0]);
                widgetTools.setEditMode(node?.length);
                widgetTools.openDialog(config.getConfig('tinymce').widgets.window_url);
            });
        }

        openContentTypeSettings() {
            return this.edit.open();
        }
    };
});
