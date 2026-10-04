define([
    'jquery',
    'mage/translate',
    'Melios_PageBuilder/js/image-editor/load-editor'
], function ($, $t, loadEditor) {
    'use strict';

    return function (target) {
        return target.extend({
            initialize: function () {
                this._super();

                var editIndex = this.actionsList.findIndex(item => {
                    if (item.name === 'edit') {
                        item.title = $t('Edit Details');
                        return true;
                    }
                    return false;
                });

                if (editIndex !== -1) {
                    this.actionsList.splice(editIndex + 1, 0, {
                        name: 'edit-image',
                        title: $t('Edit Image'),
                        classes: 'action-menu-item',
                        handler: 'editImage'
                    });
                }

                 return this;
            },

            editImage: function (record) {
                if (record.content_type?.toLowerCase() === 'svg') {
                    return alert('Melios Builder does not support editing SVG images yet.');
                }

                loadEditor().then(editor => editor
                    .setInputField($('#image-uploader-form').find('[type="file"]'))
                    .setGalleryModel(this.imageModel())
                    .showImageDetailsById(
                        this.imageModel().getId(record)
                    ));
            }
        });
    };
});
