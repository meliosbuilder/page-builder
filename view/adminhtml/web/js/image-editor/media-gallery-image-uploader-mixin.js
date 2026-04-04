define([
    'jquery',
    'mage/utils/wrapper',
    'Melios_PageBuilder/js/image-editor/uppy-mixin'
], function ($, wrapper, uppyMixin) {
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

        return target.extend({
            defaults: {
                meliosImageEditorName: 'meliosImageEditor',
                modules: {
                    meliosImageEditor: '${ $.meliosImageEditorName }',
                },
            },

            // Use proper folder if editor is used to save the image
            getTargetFolder: function () {
                var folder = this._super(),
                    editor = this.meliosImageEditor();

                if (folder === '/' && editor?.isActive()) {
                    folder = editor.getFolderPath();
                }

                return folder;
            },

            // Used in Magento < 2.4.7 where Uppy is not used
            initializeFileUpload: function () {
                this._super();

                var fileupload = $(this.imageUploadInputSelector).data('blueimpFileupload');

                if (fileupload?.options.formData && uploadData) {
                    fileupload.options.formData = wrapper.wrap(
                        fileupload?.options.formData,
                        function (o, form) {
                            return o(form).concat(
                                [{
                                    name: 'melios_allow_overwrite',
                                    value: +!uploadData.isNewImage
                                }]
                            );
                        }
                    );
                }
            },
        });
    };
});
