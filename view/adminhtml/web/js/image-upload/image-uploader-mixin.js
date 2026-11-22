define([
    'jquery',
    'mage/translate'
], function ($, $t) {
    'use strict';

    var extensions = [
        'avif',
        'svg',
        'webp',
    ];

    return function (target) {
        return target.extend({
            defaults: {
                mlsMenuOpened: false
            },

            initialize: function () {
                this._super();

                if (!this.allowedExtensions?.includes) {
                    return;
                }

                extensions.forEach(extension => {
                    if (!this.allowedExtensions.includes(extension)) {
                        this.allowedExtensions += ' ' + extension;
                    }
                });
            },

            initObservable: function () {
                this._super();
                this.observe('mlsMenuOpened');

                return this;
            },

            /**
             * Image picker (Melios_PageBuilder/form/element/uploader/image-picker)
             */
            mlsGetTitle: function () {
                var file = this.value()[0],
                    lines = [];

                if (file) {
                    lines.push([
                        file.name,
                        file.previewWidth && file.previewWidth + '×' + file.previewHeight,
                        file.size && this.formatSize(file.size)
                    ].filter(Boolean).join(', '));
                }
                if (this.maxFileSize) {
                    lines.push($t('Maximum file size') + ': ' + this.formatSize(this.maxFileSize));
                }
                if (this.allowedExtensions) {
                    lines.push($t('Allowed file types') + ': ' + this.getAllowedFileExtensionsInCommaDelimitedFormat());
                }

                return lines.join('\n');
            },

            mlsToggleMenu: function () {
                this.mlsMenuOpened(!this.mlsMenuOpened());
            },

            mlsCloseMenu: function () {
                this.mlsMenuOpened(false);

                return true;
            },

            mlsOnFocusout: function (component, event) {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    this.mlsCloseMenu();
                }
            },

            mlsOnKeydown: function (component, event) {
                if (event.key !== 'Escape' || !this.mlsMenuOpened()) {
                    return true;
                }

                // Close the menu only, not the whole form
                event.stopPropagation();
                this.mlsCloseMenu();
            },

            mlsUpload: function (component, event) {
                // Core binds uppy "browse" to the first button (2.4.7+), older versions use label[for=input]
                $(event.currentTarget).closest('.mls-image-picker')
                    .find('.file-uploader-area .file-uploader-button').first().trigger('click');
            },

            mlsSelectFromGallery: function () {
                $('#' + this.mediaGalleryUid).trigger('click');
            },

            mlsCanEdit: function () {
                var url = this.value()[0]?.url;

                return !!url && !/\.svg(\?|$)/i.test(url);
            },

            mlsEditImage: function (component, event) {
                var root = $(event.currentTarget).closest('.mls-image-picker'),
                    url = this.value()[0].url,
                    pathname = new URL(url, window.location.href).pathname,
                    path = pathname.includes('/.renditions/')
                        ? pathname.split('/.renditions/').at(-1)
                        : pathname.split('/media/').at(-1);

                this.mlsCloseMenu();

                require(['Melios_PageBuilder/js/image-editor/load-editor'], loadEditor => {
                    loadEditor().then(editor => {
                        // Saved image goes through this field's uploader (uppy input or legacy file input)
                        editor
                            .setInputField(root.find('.file-uploader-area input[type="file"]').last())
                            .setGalleryModel(false)
                            .showImageEditorByData({
                                image_url: url,
                                path: decodeURIComponent(path),
                            });
                    });
                });
            }
        });
    };
});
