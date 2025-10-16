define([
    'Magento_Ui/js/lib/view/utils/async',
], function ($) {
    'use strict';

    function createEditor(input) {
        var parentEl = $('<div class="mls-css-editor no-animation"></div>')
            .insertAfter(input)
            .height($(input).outerHeight());

        $(input).hide().parent().find('.btn-enlarge').remove();

        requestAnimationFrame(() => parentEl.removeClass('no-animation'));

        require([
            'Melios_PageBuilder/js/lib/codemirror/lib/codemirror',
            'Melios_PageBuilder/js/editor/codemirror-config',
            'Melios_PageBuilder/js/editor/codemirror-resizable',
            'Melios_PageBuilder/js/editor/codemirror-control-panel',
            'Melios_PageBuilder/js/editor/codemirror-text-marks',
            'Melios_PageBuilder/js/editor/codemirror-fixes',
            'Melios_PageBuilder/js/tailwind/codemirror-classlist'
        ], (CodeMirror, config, resizable, textMarks, controlPanel) => {
            var cm = CodeMirror(parentEl[0], Object.assign(config(), {
                lineNumbers: false,
                lint: false,
                mode: 'classlist',
                formatter: {
                    parser: 'classlist',
                    printWidth: 9999,
                    deps: [
                      'Melios_PageBuilder/js/lib/prettier/standalone',
                      'Melios_PageBuilder/js/tailwind/prettier-classlist',
                    ],
                },
                extraKeys: {
                    Tab: false,
                    'Shift-Tab': false
                }
            }));

            resizable(cm);
            textMarks(cm);
            controlPanel(cm);

            cm.setSize(null, 200);
            cm.setValue(input.value);
            cm.on('changes', () => {
                $(input).val(cm.getValue().replaceAll("\n", ' ')).change();
            });

            requestAnimationFrame(() => $('.mls-css-editor').addClass('ready'));
        });
    }

    $(document).on('click', '.mls-tw-input-wrapper .btn-enlarge', e => {
        createEditor(e.currentTarget.previousElementSibling);
    });

    $.async('[name="css_classes"]', input => {
        $(input).parent().addClass('mls-tw-input-wrapper');

        if (input.offsetWidth > input.scrollWidth) {
            return $(input).after(`
                <button class="mls-btn-icon btn-enlarge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-fullscreen-icon lucide-fullscreen"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="10" height="8" x="7" y="8" rx="1"/></svg>
                </button>
            `);
        }

        createEditor(input);
    });
});
