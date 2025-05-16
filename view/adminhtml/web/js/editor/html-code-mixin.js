define([], function () {
    'use strict';

    return function (target) {
        return target.extend({
            initialize: function () {
                this._super();

                require([
                    'Magento_Ui/js/lib/view/utils/async',
                    'Melios_PageBuilder/js/utils/storage',
                    'Melios_PageBuilder/js/lib/codemirror/lib/codemirror',
                    'Melios_PageBuilder/js/editor/codemirror-config',
                    'Melios_PageBuilder/js/editor/codemirror-resizable',
                    'Melios_PageBuilder/js/editor/codemirror-control-panel',
                    'Melios_PageBuilder/js/editor/codemirror-fixes'
                ], ($, storage, CodeMirror, config, resizable, controlPanel) => {
                    $.async('#' + this.uid, textarea => {
                        config.theme = storage.get('editor.theme', 'default');
                        this.cm = CodeMirror.fromTextArea(textarea, config);
                        this.cm.on('changes', cm => {
                            this.value(cm.getValue());
                        });
                        this.value.subscribe(value => {
                            if (value !== this.cm.getValue()) {
                                this.cm.setValue(value);
                            }
                        });

                        resizable(this.cm);
                        controlPanel(this.cm);
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
