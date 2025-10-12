define([
    'Magento_Ui/js/lib/view/utils/async',
], function ($) {
    'use strict';

    var popupEl,
        inputEl,
        cm;

    function getPopup() {
        const getEl = () => {
            if (!popupEl) {
                popupEl = $(`
                    <div class="mls-tw-popup">
                        <textarea class="mls-tw-textarea" name="mls-tw-textarea"></textarea>
                        <div class="actions">
                            <button class="action-primary ok">Ok</button>
                            <button class="action-secondary cancel">Cancel</button>
                        </div>
                    </div>
                `).appendTo('body');
            }
            return popupEl;
        }

        const getCm = () => new Promise(resolve => {
            if (cm) {
                return resolve(cm);
            }

            require([
                'Melios_PageBuilder/js/lib/codemirror/lib/codemirror',
                'Melios_PageBuilder/js/editor/codemirror-config',
                'Melios_PageBuilder/js/editor/codemirror-fixes'
            ], (CodeMirror, config) => {
                const textarea = popupEl.find('textarea');

                cm = CodeMirror.fromTextArea(textarea[0], Object.assign(config(), {
                    lineNumbers: false,
                    lint: false,
                    mode: null,
                    extraKeys: {
                        Tab: false,
                        'Shift-Tab': false
                    }
                }));

                resolve(cm);
            });
        });

        const close = () => {
            var rect = inputEl[0].getBoundingClientRect();

            getEl().css({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });

            requestAnimationFrame(() => {
                getEl().removeClass('opened').one('transitionend', () => {
                    cm.setValue('');
                    getEl().css({
                        top: '',
                        left: '',
                        width: '',
                        height: '',
                    })
                });
            });
        }

        return {
            open: (input) => {
                var rect = input[0].getBoundingClientRect();

                inputEl = input;

                getEl().css({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                });

                getCm().then(cm => {
                    cm.setValue(input.val());
                    setTimeout(() => {
                        cm.setSelection(
                            cm.posFromIndex(input[0].selectionStart),
                            cm.posFromIndex(input[0].selectionEnd)
                        );
                        cm.focus();
                    }, 200);
                });

                requestAnimationFrame(() => {
                    getEl().css({
                        top: Math.max(0, Math.min(rect.top - 100, window.innerHeight - 300)),
                        left: Math.max(0, rect.left - 100),
                        width: Math.min(rect.width + 150, window.innerWidth),
                        height: Math.min(300, window.innerHeight),
                    }).addClass('opened');
                });
            },

            close: () => {
                close();
            },

            opened: () => {
                return getEl().hasClass('opened');
            },

            save: () => {
                inputEl.val(
                    cm.getValue().replace(/\n+/, ' ').replace(/\s{2,}/, ' ')
                ).change();
            }
        };
    }

    $(document)
        .on('click', '.mls-tw-input-wrapper .btn-enlarge', e => {
            getPopup().open($(e.currentTarget).prev());
        })
        .on('click', '.mls-tw-popup .ok', () => {
            getPopup().save();
            getPopup().close();
        })
        .on('click', '.mls-tw-popup .cancel', () => getPopup().close())
        .on('keydown', '.mls-tw-popup', e => {
            if (e.key === 'Escape') {
                getPopup().close();
            }
        })
        .on('melios:save-before', () => {
            if (getPopup().opened()) {
                getPopup().save();
            }
        });

    $.async('[name="css_classes"]', input => {
        $(input)
            .after(`
                <button class="mls-btn-icon btn-enlarge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-fullscreen-icon lucide-fullscreen"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="10" height="8" x="7" y="8" rx="1"/></svg>
                </button>
            `)
            .parent()
            .addClass('mls-tw-input-wrapper');
    });
});
