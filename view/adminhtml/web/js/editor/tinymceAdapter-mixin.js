define([
    'Magento_Ui/js/lib/view/utils/async',
], function ($) {
    'use strict';

    $.async('.tox-textarea', textarea => {
        require([
            'Melios_PageBuilder/js/utils/storage',
            'Melios_PageBuilder/js/lib/codemirror/lib/codemirror',
            'Melios_PageBuilder/js/editor/codemirror-config',
            'Melios_PageBuilder/js/editor/codemirror-control-panel',
            'Melios_PageBuilder/js/editor/codemirror-text-marks',
        ], (storage, CodeMirror, config, controlPanel, textMarks) => {
            config.theme = storage.get('editor.theme', 'default');

            var cm = CodeMirror.fromTextArea(textarea, config);

            cm.on('changes', cm => {
                textarea.value = cm.getValue();
            });

            controlPanel(cm);
            textMarks(cm);
        });
    });

    return function (target) {
        return target;
    };
});
