define([
    'jquery',
    'Melios_PageBuilder/js/image-editor/uppy-mixin'
], function ($, uppyMixin) {
    'use strict';

    var uploadData = false;

    $(document).on('melios:image-editor:upload-before', (e, data) => {
        uploadData = data;
        setTimeout(() => {
            uploadData = false;
        }, 150);
    });

    return function (target) {
        uppyMixin();

        if (require.defined('jquery/uppy-core')) {
            return target;
        }

        // Magento < 2.4.7
        return target.extend({
            onBeforeFileUpload: function (event, data) {
                var fileupload = $(event.target).data('blueimpFileupload');

                if (fileupload && uploadData) {
                    $(event.target).on('fileuploadsend', function (eventBound, postData) {
                        postData.data.append('melios_allow_overwrite', +!uploadData.isNewImage);
                    }.bind(data));
                }

                this._super(event, data);
            },

            onFileUploaded: function (event, data) {
                this._super(event, data);

                $(document).trigger('melios:uppy:upload-success', [
                    data.files[0],
                    {
                        body: data.result
                    }
                ]);
            },

            onFail: function (event, data) {
                this._super(event, data);

                $(document).trigger('melios:uppy:upload-error');
            }
        });
    };
});
