define([
    'tinymce',
], function (tinyMCE) {
    'use strict';

    return function (target) {
        return target.extend({
            // Fixed not working "reset"
            reset: function () {
                this._super();
                if (this.value() !== tinyMCE.get(this.wysiwygId).getContent()) {
                    tinyMCE.get(this.wysiwygId).execCommand('mceSetContent', false, this.value());
                }
            }
        });
    };
});
