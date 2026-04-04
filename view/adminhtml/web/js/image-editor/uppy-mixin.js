define([
    'jquery',
    'mage/utils/wrapper'
], function ($, wrapper) {
    'use strict';

    var done = false,
        uploadData = false;

    $(document).on('melios:image-editor:upload-before', (e, data) => {
        uploadData = data;
        setTimeout(() => {
            uploadData = false;
        }, 150);
    });

    return function () {
        if (!require.defined('jquery/uppy-core') || done) {
            return;
        }

        done = true;

        /* global Uppy */
        Uppy.Uppy.prototype.emit = wrapper.wrap(Uppy.Uppy.prototype.emit, function (o, ...params) {
            if (['upload-success', 'upload-error', 'complete'].includes(params[0])) {
                $(document).trigger(`melios:uppy:${params[0]}`, params.slice(1));
            }
            o(...params);
        });

        Uppy.Uppy.prototype.upload = wrapper.wrap(Uppy.Uppy.prototype.upload, function (o) {
            var meta = this.getState().meta,
                folder = meta.target_folder;

            if (uploadData) {
                this.setMeta({
                    melios_allow_overwrite: +!uploadData.isNewImage
                });
                delete meta.melios_allow_overwrite;

                if (uploadData.target_folder && (!folder || folder === '/')) {
                    this.setMeta({
                        target_folder: uploadData.target_folder,
                    });
                    delete meta.target_folder;
                }

                // restore default values
                setTimeout(() => {
                    this.setState({ meta });
                }, 160);
            }

            return o();
        });
    };
});
