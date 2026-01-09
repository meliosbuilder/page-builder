define([
    'jquery',
    'mage/utils/wrapper'
], function ($, wrapper) {
    'use strict';

    var timer;

    function initEditor(textarea) {
        if ($(textarea).nextAll('.CodeMirror').length) {
            return;
        }

        require([
            'Melios_PageBuilder/js/lib/codemirror/lib/codemirror',
            'Melios_PageBuilder/js/editor/codemirror-config',
            'Melios_PageBuilder/js/editor/codemirror-control-panel',
            'Melios_PageBuilder/js/editor/codemirror-text-marks',
        ], (CodeMirror, config, controlPanel, textMarks) => {
            var cm = CodeMirror.fromTextArea(textarea, config());

            cm.on('changes', cm => {
                textarea.value = cm.getValue();
            });

            controlPanel(cm);
            textMarks(cm);
        });
    }

    function waitForTextareaAndInitEditor(selector) {
        var el = $(selector)[0];

        clearTimeout(timer);

        if (el) {
            return initEditor(el);
        }

        timer = setTimeout(() => waitForTextareaAndInitEditor(selector), 200);
    }

    return function (target) {
        target.getSettings = wrapper.wrap(target.getSettings, function(o) {
            var settings = o();

            settings.setup = wrapper.wrap(settings.setup, (o, editor) => {
                o(editor);
                editor.on('ExecCommand', (e) => {
                    if (!e.isDefaultPrevented() && e.command === 'mceCodeEditor') {
                        waitForTextareaAndInitEditor('.tox-textarea');
                    }
                });
            });

            return settings;
        });

        return target;
    };
});
