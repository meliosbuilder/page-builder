define([
    'jquery',
    'knockout',
    'underscore',
    'mage/translate',
    'Magento_MediaGalleryUi/js/image/image-actions',
    'Magento_Ui/js/modal/prompt'
], function ($, ko, _, $t, ImageActions, prompt) {
    'use strict';

    var bgWatchers = new WeakMap();

    return ImageActions.extend({
        defaults: {
            meliosImageEditorName: 'meliosImageEditor',
            modules: {
                meliosEditor: '${ $.meliosImageEditorName }',
            },
        },

        meliosSetCanvasSize: async function () {
            try {
                var { width, height } = await this.promptSize($t('Enter canvas size'), {
                    width: this.meliosEditor().imageWidth(),
                    height: this.meliosEditor().imageHeight(),
                });
            } catch (e) {
                return;
            }

            this.meliosEditor().setCanvasSize(width, height);
        },

        meliosSetImageSize: async function () {
            try {
                var { width, height } = await this.promptSize($t('Enter image size'), {
                    width: this.meliosEditor().imageWidth(),
                    height: this.meliosEditor().imageHeight(),
                });
            } catch (e) {
                return;
            }

            this.meliosEditor().setImageSize(width, height);
        },

        promptSize: async function(title, defaults) {
            return new Promise((resolve, reject) => {
                require(['Melios_PageBuilder/js/image-editor/prompt-size'], promptSize => {
                    promptSize({
                        title,
                        defaults,
                        resolve,
                        reject
                    });
                });
            });
        },

        meliosSaveImageAs: function () {
            var name = this.meliosEditor().getFileName(),
                ext = this.meliosEditor().getFileExt(),
                extWithDot = '.' + ext;

            if (name.toLowerCase().endsWith(extWithDot)) {
                name = name.slice(0, -extWithDot.length);
                name = name.replace(/_copy_.*/, '');
                name += '_copy_' + Math.random().toString(36).slice(2, 7);
            }

            prompt({
                content: $t('Enter file name'),
                value: name,
                actions: {
                    confirm: (val) => {
                        this.meliosSave(val);
                    }
                }
            });
        },

        meliosSaveImage: function () {
            this.meliosSave();
        },

        meliosSave: async function (imageName) {
            var editor = this.meliosEditor(),
                isNewImage = !!imageName,
                originalSize = editor.getFileSize(),
                quality = [0.92, 0.85, 0.8],
                tries = 0,
                ext, type, done;

            if (imageName && imageName.includes('.')) {
                var maybeExt = imageName.split('.').at(-1);

                if (['jpg', 'jpeg', 'avif', 'webp', 'png', 'gif', 'tiff', 'bmp'].includes(maybeExt)) {
                    ext = maybeExt;
                }
            }

            ext = ext || editor.getFileExt() || 'webp';
            type = 'image/' + ext.replace('jpg', 'jpeg');

            // cropperjs bugfix: make sure that the canvas size is same as shown in panel
            await editor.setCanvasSize(editor.imageWidth(), editor.imageHeight());

            var canvas = (await editor.getCropper()).getCroppedCanvas();

            imageName = imageName || editor.getFileName();
            if (!imageName.toLowerCase().endsWith('.' + ext)) {
                imageName += '.' + ext;
            }

            $('body').trigger('processStart');
            do {
                done = await new Promise(resolve => {
                    canvas.toBlob(blob => {
                        if (blob.size <= originalSize || !quality[tries + 1]) {
                            this.triggerFileSubmit(blob, imageName, isNewImage);
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }, type, quality[tries]);
                });
                tries++;
            } while (!done);
        },

        triggerFileSubmit: function (blob, imageName, isNewImage) {
            var editor = this.meliosEditor(),
                file = new File([blob], imageName, { type: blob.type }),
                dt = new DataTransfer();

            $(document).trigger('melios:image-editor:upload-before', {
                isNewImage,
                file,
                target_folder: editor.getFolderPath(),
            });
            $(document).one('melios:uppy:upload-error.meliosImageEditorSave', () => {
                $(document).off('.meliosImageEditorSave');
                $('body').trigger('processStop');
            });
            $(document).one('melios:uppy:upload-success.meliosImageEditorSave', (e, f, response) => {
                var encodedId, fileName = response.body?.name;

                $(document).off('.meliosImageEditorSave');

                if (response.body.error) {
                    $('body').trigger('processStop');
                }

                if (!fileName) {
                    return;
                }

                encodedId = btoa(
                        new TextEncoder()
                            .encode(editor.getFolderPath() + '/' + fileName)
                            .reduce((data, byte) => {
                                return data + String.fromCharCode(byte);
                            }, '')
                    )
                    .replace(/\+/g, ':')
                    .replace(/\//g, '_')
                    .replace(/=/g, '-');

                this.meliosSaveAfter(isNewImage, fileName, encodedId).then(() => {
                    $('body').trigger('processStop');
                });
            });

            dt.items.add(file);
            editor.inputField.files = dt.files;
            editor.inputField.dispatchEvent(new Event('change', { bubbles: true }));

            if (this.gallery) {
                var selected = this.gallery.getSelected(),
                    provider = this.gallery.provider();

                this.mediaGalleryImageDetails().removeCached(selected.id);
                this.mediaGalleryEditDetails().removeCached(selected.id);

                provider.on('reloaded', () => {
                    provider.off('meliosSaveImage');

                    // New image is always the first one, because
                    // Magento silently changes "Sort by" to newest after upload.
                    // See Magento_MediaGalleryUi/js/image-uploader@openNewestImages
                    if (isNewImage) {
                        require(['Melios_PageBuilder/js/utils/is-in-viewport'], isInViewport => {
                            var el = $('.masonry-image-grid img')[0];

                            if (!isInViewport(el, { sideToCheck: 'top' })) {
                                el.scrollIntoView({
                                    behavior: 'smooth'
                                });
                            }
                        });
                        $('body').trigger('processStop');
                        return this.gallery.select(provider.data.items[0]);
                    }

                    this.gallery.select(provider.data.items.find(item => item.id == selected.id));
                    this.meliosSaveAfter(isNewImage, imageName, selected.encoded_id).then(() => {
                        $('body').trigger('processStop');
                    });
                }, 'meliosSaveImage');
            }

            this.closeModal();
        },

        meliosSaveAfter: function (isNewImage, imageName, encodedFilename) {
            // trigger '/.renditions/' image rendering without pressing "Add selected"
            return $.ajax({
                url: this.onInsertUrl,
                data: {
                    filename: encodedFilename,
                    store_id: this.storeId,
                    as_is: 0,
                    force_static_path: 1,
                    form_key: window.FORM_KEY,
                },
                showLoader: true,
                complete: () => {
                    if (!isNewImage) {
                        this.reloadStageImagesByName(imageName);
                    }
                }
            });
        },

        reloadStageImagesByName: function (imageName) {
            var re = new RegExp(`(${imageName})(\\?[^)"']*)?`, 'g');

            $('.pagebuilder-stage').find(`[src*="/${imageName}"]`).each(function () {
                var url = new URL(this.src);

                url.searchParams.set('mls', Math.random());
                this.src = url.toString();
            });

            $('.pagebuilder-stage').find(`[data-background-images*="/${imageName}"]`).each(function () {
                var newBgImage = $(this).css('background-image').replace(re, (match, name, query) => {
                    query = query || '';
                    query = query.replace(/mls=0\.\d+/g, '').replace(/&$/, '').replace(/\?$/, '');

                    return `${name}${query || ''}${query ? '&' : '?'}mls=${Math.random()}`;
                });

                $(this).css('background-image', newBgImage);

                // We just inlined bg style.
                // Need to remove it as soon as user changes the image to another.
                bgWatchers.get(this)?.dispose();
                bgWatchers.set(
                    this,
                    ko.dataFor(this).previewData.background_image.subscribe(_.debounce(v => {
                        if (!newBgImage.includes(v[0].url)) {
                            bgWatchers.get(this)?.dispose();
                            $(this).css('background-image', '');
                        }
                    }, 300))
                );
            });
        },

        closeModal: function () {
            var modalElement = $(this.modalSelector),
                modalWindow = $(this.modalWindowSelector);

            if (!modalWindow.hasClass('_show') || !modalElement.length || _.isUndefined(modalElement.modal)) {
                return;
            }

            modalElement.modal('closeModal');
        }
    });
});
