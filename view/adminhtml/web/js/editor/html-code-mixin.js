define([
    'Magento_Ui/js/lib/view/utils/async',
    'Swissup_Codemirror/js/form/element/codemirror-strategy',
    'Swissup_Codemirror/js/pagebuilder/html-code-fixes'
], function ($, strategy) {
    'use strict';

    return function (target) {
        return target.extend($.extend(true, {}, strategy, {
            defaults: {
                editorConfig: {
                    mode: 'htmlmixed',
                    lineWrapping: true,
                    directives: [
                        {
                            re: /<svg[\s\S]*?<\/svg>/,
                            placeholder: function (match) {
                                return '<span class="mls mls-svg">svg</span>';
                            }
                        },
                    ],
                },
            },

            initialize: function () {
                this._super();

                $.async('#' + this.uid, this.initEditor.bind(this));

                return this;
            }
        }));
    };
});
