define([
    'jquery',
    'mage/translate'
], function ($, $t) {
    'use strict';

    return function (target) {
        return target.extend({
            defaults: {
                meliosImageEditorName: 'meliosImageEditor',
                modules: {
                    meliosImageEditor: '${ $.meliosImageEditorName }'
                }
            },

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
                this.meliosImageEditor()
                    .setInputField($('#image-uploader-form').find('[type="file"]'))
                    .setGalleryModel(this.imageModel())
                    .showImageDetailsById(
                        this.imageModel().getId(record)
                    );
            }
        });
    };
});
