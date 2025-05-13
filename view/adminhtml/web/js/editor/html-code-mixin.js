define([], function () {
    'use strict';

    return function (target) {
        return target.extend({
            initialize: function () {
                this._super();

                require([
                    'underscore',
                    'Magento_Ui/js/lib/view/utils/async',
                    'Melios_PageBuilder/js/lib/codemirror/lib/codemirror',
                    'Melios_PageBuilder/js/editor/codemirror-config',
                    'Melios_PageBuilder/js/editor/codemirror-fixes',
                    'jquery-ui-modules/resizable'
                ], (_, $, CodeMirror, config) => {
                    $.async('#' + this.uid, textarea => {
                        this.cm = CodeMirror.fromTextArea(textarea, config);
                        this.cm.on('changes', cm => {
                            this.value(cm.getValue());
                        });
                        $(this.cm.getWrapperElement()).resizable({
                            handles: 's',
                            resize: _.debounce(() => this.cm.refresh(), 100),
                            zIndex: 900
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
