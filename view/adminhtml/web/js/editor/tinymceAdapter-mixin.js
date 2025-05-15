define([
    'Magento_Ui/js/lib/view/utils/async',
], function ($) {
    'use strict';

    $.async('.tox-textarea', textarea => {
        require([
            'Melios_PageBuilder/js/utils/storage',
            'Melios_PageBuilder/js/lib/codemirror/lib/codemirror',
            'Melios_PageBuilder/js/editor/codemirror-config',
            'Melios_PageBuilder/js/editor/codemirror-features'
        ], (storage, CodeMirror, config, features) => {
            config.theme = storage.get('editor.theme', 'default');

            var cm = CodeMirror.fromTextArea(textarea, config);

            cm.on('changes', cm => {
                textarea.value = cm.getValue();
            });

            features(cm);
        });
    });

    return function (target) {
        return target;
    };
});
