define([
    'Magento_Ui/js/lib/view/utils/async',
], function ($) {
    'use strict';

    var popupEl,
        inputEl,
        cm;

    // function getPopup() {
    //     const getEl = () => {
    //         if (!popupEl) {
    //             popupEl = $(`
    //                 <div class="mls-tw-popup">
    //                     <textarea class="mls-tw-textarea" name="mls-tw-textarea"></textarea>
    //                     <div class="actions">
    //                         <button class="action-primary ok">Ok</button>
    //                         <button class="action-secondary cancel">Cancel</button>
    //                     </div>
    //                 </div>
    //             `).appendTo('body');
    //         }
    //         return popupEl;
    //     }

    //     const getCm = () => new Promise(resolve => {
    //         if (cm) {
    //             return resolve(cm);
    //         }

    //         require([
    //             'Melios_PageBuilder/js/lib/codemirror/lib/codemirror',
    //             'Melios_PageBuilder/js/editor/codemirror-config',
    //             'Melios_PageBuilder/js/editor/codemirror-fixes'
    //         ], (CodeMirror, config) => {
    //             const textarea = popupEl.find('textarea');

    //             cm = CodeMirror.fromTextArea(textarea[0], Object.assign(config(), {
    //                 lineNumbers: false,
    //                 lint: false,
    //                 mode: null,
    //                 extraKeys: {
    //                     Tab: false,
    //                     'Shift-Tab': false
    //                 }
    //             }));

    //             resolve(cm);
    //         });
    //     });

    //     const close = () => {
    //         var rect = inputEl[0].getBoundingClientRect();

    //         getEl().css({
    //             top: rect.top,
    //             left: rect.left,
    //             width: rect.width,
    //             height: rect.height,
    //         });

    //         requestAnimationFrame(() => {
    //             getEl().removeClass('opened').one('transitionend', () => {
    //                 cm.setValue('');
    //                 getEl().css({
    //                     top: '',
    //                     left: '',
    //                     width: '',
    //                     height: '',
    //                 })
    //             });
    //         });
    //     }

    //     return {
    //         open: (input) => {
    //             var rect = input[0].getBoundingClientRect();

    //             inputEl = input;

    //             getEl().css({
    //                 top: rect.top,
    //                 left: rect.left,
    //                 width: rect.width,
    //                 height: rect.height,
    //             });

    //             getCm().then(cm => {
    //                 cm.setValue(input.val());
    //                 setTimeout(() => {
    //                     cm.setSelection(
    //                         cm.posFromIndex(input[0].selectionStart),
    //                         cm.posFromIndex(input[0].selectionEnd)
    //                     );
    //                     cm.focus();
    //                 }, 200);
    //             });

    //             requestAnimationFrame(() => {
    //                 getEl().css({
    //                     top: Math.max(0, Math.min(rect.top - 100, window.innerHeight - 300)),
    //                     left: Math.max(0, rect.left - 100),
    //                     width: Math.min(rect.width + 150, window.innerWidth),
    //                     height: Math.min(300, window.innerHeight),
    //                 }).addClass('opened');
    //             });
    //         },

    //         close: () => {
    //             close();
    //         },

    //         opened: () => {
    //             return getEl().hasClass('opened');
    //         },

    //         save: () => {
    //             inputEl.val(
    //                 cm.getValue().replace(/\n+/, ' ').replace(/\s{2,}/, ' ')
    //             ).change();
    //         }
    //     };
    // }

    // $(document)
    //     .on('click', '.mls-tw-input-wrapper .btn-enlarge', e => {
    //         getPopup().open($(e.currentTarget).prev());
    //     })
    //     .on('click', '.mls-tw-popup .ok', () => {
    //         getPopup().save();
    //         getPopup().close();
    //     })
    //     .on('click', '.mls-tw-popup .cancel', () => getPopup().close())
    //     .on('keydown', '.mls-tw-popup', e => {
    //         if (e.key === 'Escape') {
    //             getPopup().close();
    //         }
    //     })
    //     .on('melios:save-before', () => {
    //         if (getPopup().opened()) {
    //             getPopup().save();
    //         }
    //     });

    function createEditor(parentEl) {
        return new Promise(resolve => {
            require([
                'Melios_PageBuilder/js/lib/codemirror/lib/codemirror',
                'Melios_PageBuilder/js/editor/codemirror-config',
                'Melios_PageBuilder/js/editor/codemirror-resizable',
                'Melios_PageBuilder/js/editor/codemirror-control-panel',
                'Melios_PageBuilder/js/editor/codemirror-text-marks',
                'Melios_PageBuilder/js/editor/codemirror-fixes',
                'Melios_PageBuilder/js/tailwind/codemirror-classlist'
            ], (CodeMirror, config, resizable, textMarks, controlPanel) => {
                var cm = CodeMirror(parentEl, Object.assign(config(), {
                    lineNumbers: false,
                    lint: false,
                    mode: 'classlist',
                    extraKeys: {
                        Tab: false,
                        'Shift-Tab': false
                    }
                }));

                cm.setSize(null, 200);

                resizable(cm);
                textMarks(cm);
                controlPanel(cm);
                resolve(cm);
            });
        });
    }

    $.async('[name="css_classes"]', async (input) => {
        var cm = await createEditor(
            $('<div class="mls-css-editor"></div>').insertAfter(input)[0]
        );

        cm.setValue(input.value.replaceAll('  ', "\n"));
        cm.on('changes', () => {
            $(input).val(cm.getValue().replaceAll("\n", '  ')).change();
        });
        // $(input).hide();
    });
});
