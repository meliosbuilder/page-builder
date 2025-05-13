define([], function () {
    'use strict';

    return function (target) {
        return target.extend({
            initialize: function () {
                this._super();

                require([
                    'Magento_Ui/js/lib/view/utils/async',
                    'Melios_PageBuilder/js/lib/codemirror/lib/codemirror',
                    'Melios_PageBuilder/js/editor/codemirror-config'
                ], ($, CodeMirror, config) => {
                    $.async('#' + this.uid, textarea => {
                        this.cm = CodeMirror.fromTextArea(textarea, config);
                        this.cm.on('changes', cm => {
                            this.value(cm.getValue());
                        });
                        this.value.subscribe(value => {
                            if (value !== this.cm.getValue()) {
                                this.cm.setValue(value);
                            }
                        });
                    });
                });

                return this;
            },

            destroy: function (skipUpdate) {
                this.cm?.toTextArea();

                return this._super(skipUpdate);
            }
        });
    };
});
