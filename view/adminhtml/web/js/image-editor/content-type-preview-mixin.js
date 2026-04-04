define([
    'jquery',
    'knockout',
    'underscore',
    'uiRegistry',
    'mage/utils/wrapper',
    'mage/translate',
    'Magento_PageBuilder/js/content-type-menu/option'
], function ($, ko, _, registry, wrapper, $t, MenuOption) {
    'use strict';

    function updateEditorOptionState(cmp) {
        var value = cmp.previewData[cmp.meliosEditorImageAttr]?.();

        if (cmp.viewport() !== 'desktop') {
            return cmp.meliosEditorOption.isDisabled(true);
        }

        cmp.meliosEditorOption.isDisabled(!value || !value.length);
    }

    return function (target) {
        target.prototype.retrieveOptions = wrapper.wrap(
            target.prototype.retrieveOptions,
            function (o) {
                var options = o(),
                    imageAttr = this.config?.additional_data?.uploaderConfig?.dataScope;

                if (imageAttr) {
                    options.mlsImageEditor = new MenuOption({
                        preview: this,
                        // eslint-disable-next-line max-len
                        icon: '<svg width="22" height="22" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3C20.5523 3 21 3.44772 21 4V5.757L19 7.757V5H5V13.1L9 9.1005L13.328 13.429L12.0012 14.7562L11.995 18.995L16.2414 19.0012L17.571 17.671L18.8995 19H19V16.242L21 14.242V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H20ZM21.7782 7.80761L23.1924 9.22183L15.4142 17L13.9979 16.9979L14 15.5858L21.7782 7.80761ZM15.5 7C16.3284 7 17 7.67157 17 8.5C17 9.32843 16.3284 10 15.5 10C14.6716 10 14 9.32843 14 8.5C14 7.67157 14.6716 7 15.5 7Z"></path></svg>',
                        title: $t('Edit Image'),
                        action: function () {
                            var url = this.contentType.dataStore.state[imageAttr][0].url,
                                urlObj = new URL(url, window.location.href),
                                path = urlObj.pathname.includes('/.renditions/')
                                    ? urlObj.pathname.split('/.renditions/').at(-1)
                                    : urlObj.pathname.split('/media/').at(-1);

                            registry.get('meliosImageEditor', editor => {
                                editor
                                    .setInputField($('#' + this.contentType.id).find('input[type="file"]'))
                                    .setGalleryModel(false)
                                    .showImageEditorByData({
                                        image_url: url,
                                        path: path,
                                    });
                            });
                        },
                        classes: ['mls-icon-edit-image'],
                        sort: 25,
                    });
                    this.meliosEditorImageAttr = imageAttr;
                    this.meliosEditorOption = options.mlsImageEditor;
                    this.meliosEditorOption.isDisabled(true);
                    this.viewport.subscribe(value => updateEditorOptionState(this));
                }

                return options;
            }
        );

        target.prototype.populatePreviewData = wrapper.wrap(
            target.prototype.populatePreviewData,
            function (o) {
                o();

                if (this.meliosEditorOption) {
                    this.previewData[this.meliosEditorImageAttr].subscribe(value => {
                        updateEditorOptionState(this);
                    });
                }
            }
        );

        return target;
    };
});
