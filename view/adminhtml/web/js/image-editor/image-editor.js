define([
    'jquery',
    'knockout',
    'underscore',
    'uiRegistry',
    'Magento_MediaGalleryUi/js/image/image-details',
    'Melios_PageBuilder/js/utils/can-use-hotkeys'
], function ($, ko, _, uiRegistry, ImageDetails, canUseHotkeys) {
    'use strict';

    return ImageDetails.extend({
        defaults: {
            template: 'Melios_PageBuilder/image-editor/image-info',
            target: '#melios-image-editor-canvas',
        },

        initObservable: function () {
            this._super()
                .observe([
                    'imageWidth',
                    'imageHeight'
                ]);

            $(document).on('ready', this.target, async () => {
                var data = (await this.getCropper()).getImageData();

                this.imageWidth(data.naturalWidth);
                this.imageHeight(data.naturalHeight);
            });
            $(document).on('crop', this.target, async () => {
                var cropper = await this.getCropper(),
                    data = cropper.getData(true);

                if (!data.width) {
                    data = {
                        width: cropper.getImageData().naturalWidth,
                        height: cropper.getImageData().naturalHeight,
                    };
                }

                this.imageWidth(data.width);
                this.imageHeight(data.height);
            });

            $(document).on('keydown', (e) => {
                if (!this.isActive() || !canUseHotkeys(e)) {
                    return;
                }

                var modals = $('.modals-wrapper > ._show').sort((a, b) => {
                    return b.style.zIndex - a.style.zIndex;
                });

                if (!modals.first().hasClass('melios-image-editor')) {
                    return;
                }

                if (e.code === 'Escape' &&
                    e.target && !modals[0].contains(e.target) && !e.target.contains(modals[0])
                ) {
                    return;
                }

                switch (e.code) {
                    case 'Escape':
                        this.getCropper().then(cropper => cropper.clear());
                        break;

                    case 'Enter':
                    case 'NumpadEnter':
                        e.preventDefault();
                        this.getCropper().then(cropper => {
                            if (!cropper.getCropBoxData()?.width) {
                                return;
                            }

                            $('body').trigger('processStart');
                            cropper.getCroppedCanvas().toBlob(async blob => {
                                this.setBlob(blob);
                                $('body').trigger('processStop');
                            });
                        });
                        break;

                    case 'KeyA':
                        if (!e.metaKey && !e.ctrlKey) {
                            break;
                        }

                        e.preventDefault();

                        this.getCropper().then(cropper => {
                            cropper.crop();
                            cropper.setCropBoxData(cropper.getCanvasData());
                        });
                        break;

                    case 'ArrowDown':
                    case 'ArrowUp':
                    case 'ArrowRight':
                    case 'ArrowLeft':
                        if (!require.defined('Melios_PageBuilderPro/js/copy-paste/copy-paste')) {
                            require(['Melios_PageBuilder/js/utils/toast'], toast => {
                                toast.show('Melios Page Builder Pro version is required for precise cropping.');
                            });
                        }

                        $(document).trigger('melios:image-editor:crop', { event: e });
                        break;
                }
            });

            return this;
        },

        getCropper: async function () {
            return (await this.getUppy()).getPlugin('ImageEditor').cropper;
        },

        getFolderPath: function () {
            return this.image().path.split('/').slice(0, -1).join('/') || 'wysiwyg';
        },

        getFileName: function () {
            return this.image().path.split('/').at(-1);
        },

        getFileSize: function () {
            return this.image().melios_size;
        },

        getFileExt: function () {
            var ext = this.image().path.includes('.')
                    ? this.image().path.split('.').at(-1)
                    : false,
                trueExt = this.image().content_type.toLowerCase();

            if (!ext || ext === trueExt) {
                return trueExt;
            }

            if (['jpg', 'jpeg'].includes(ext)) {
                return ext;
            }

            return trueExt;
        },

        showImageEditorByData: function (data) {
            this.image(data);
            this.openImageDetailsModal();
        },

        openImageDetailsModal: function () {
            var modalElement = $(this.modalSelector);

            if (!modalElement.length || _.isUndefined(modalElement.modal)) {
                return;
            }

            modalElement.modal('openModal');

            (async () => {
                const res = await fetch(this.image().image_url);
                const blob = await res.blob();
                const type = res.headers.get('content-type');

                this.image().content_type = type.split('/').at(-1).replace('jpeg', 'jpg');
                this.image().melios_size = blob.size;
                this.setBlob(blob);
            })();
        },

        copyImageDimensions: function () {
            require([
                'Melios_PageBuilder/js/utils/clipboard',
                'Melios_PageBuilder/js/utils/toast'
            ], (clipboard, toast) => {
                clipboard.writeText(this.imageWidth() + 'x' + this.imageHeight())
                    .then(() => {
                        toast.show('Copied');
                    }).catch(e => {
                        toast.error(e.message);
                    });
            });
        },

        setCanvasSize: async function (width, height) {
            var oldCanvas = (await this.getCropper()).getCroppedCanvas(),
                resizedCanvas = document.createElement('canvas'),
                ctx = resizedCanvas.getContext('2d');

            $('body').trigger('processStart');

            resizedCanvas.width = width;
            resizedCanvas.height = height;

            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(
                oldCanvas,
                (resizedCanvas.width - oldCanvas.width) / 2,
                (resizedCanvas.height - oldCanvas.height) / 2
            );

            return new Promise(resolve => {
                resizedCanvas.toBlob(async blob => {
                    await this.setBlob(blob);
                    $('body').trigger('processStop');
                    resolve();
                });
            });
        },

        setImageSize: async function (width, height) {
            var oldCanvas = (await this.getCropper()).getCroppedCanvas(),
                resizedCanvas = document.createElement('canvas');

            $('body').trigger('processStart');

            resizedCanvas.width = width;
            resizedCanvas.height = height;
            resizedCanvas.getContext('2d').drawImage(
                oldCanvas,
                0,
                0,
                resizedCanvas.width,
                resizedCanvas.height
            );

            return new Promise(resolve => {
                resizedCanvas.toBlob(async blob => {
                    await this.setBlob(blob);
                    $('body').trigger('processStop');
                    resolve();
                });
            });
        },

        setBlob: async function (blob) {
            return new Promise(resolve => {
                $(this.target).css('opacity', 0);
                this.getUppy().then(async uppy => {
                    uppy.getPlugin('Dashboard').closeFileEditor();
                    uppy.clear();
                    uppy.addFile({
                        name: this.image().image_url.split('/').at(-1),
                        type: blob.type,
                        data: blob
                    });
                    setTimeout(() => {
                        $(this.target).one('ready', () => {
                            $(this.target).css('opacity', '');
                            resolve();
                        });
                        uppy.getPlugin('Dashboard').openFileEditor(uppy.getFiles().at(-1));
                    });
                });
            });
        },

        getUppy: function () {
            if (this.uppyDeferred) {
                return this.uppyDeferred;
            }

            this.uppyDeferred = $.Deferred();

            var prepare = (Uppy) => {
                this.uppy = new Uppy.Uppy();
                this.uppy.use(Uppy.Dashboard, {
                    inline: true,
                    target: this.target,
                    width: '100%',
                    height: 'calc(100vh - 135px)',
                    disableStatusBar: true,
                });
                this.uppy.use(Uppy.ImageEditor, {
                    actions: {
                        zoomIn: false,
                        zoomOut: false,
                    },
                    cropperOptions: {
                        zoomOnWheel: false,
                        toggleDragModeOnDblclick: false,
                        minCropBoxWidth: 0,
                        minCropBoxHeight: 0,
                    },
                });
                this.uppyDeferred.resolve(this.uppy);
            }

            if (require.defined('jquery/uppy-core')) {
                require(['jquery/uppy-core'], () => {
                    /* global Uppy */
                    prepare(Uppy);
                });
            } else {
                // Magento < 2.4.7
                (async () => {
                    var Uppy5 = await import('./uppy-5.2.1.js');
                    prepare(Uppy5);
                })();
            }

            return this.uppyDeferred;
        },

        setInputField: function (input) {
            this.inputField = input[0];
            return this;
        },

        setGalleryModel: function (model) {
            this.messages = model.messages;
            uiRegistry.get('meliosImageEditorActions').gallery = model;
            return this;
        },

        addMediaGridMessage: function (code, message) {
            this.messages?.().add(code, message);
            this.messages?.().scheduleCleanup();
        },
    });
});
