define([
    'jquery',
    'mage/utils/wrapper',
    'tinymce'
], function ($, wrapper, tinyMCE) {
    'use strict';

    var stickyToolbar = (() => {
        var minTop = 50,
            waitTimer,
            placement,
            editor,
            toolbarAnchor,
            toolbar;

        function onSelectionChange(e) {
            var caretRect = editor?.selection.getRng().getBoundingClientRect();

            if (!caretRect.height) {
                caretRect = editor?.selection.getRng().startContainer?.getBoundingClientRect();
            }

            if (caretRect) {
                if (placement === 'bottom' &&
                    caretRect.top >= window.innerHeight - toolbar.offsetHeight - 20
                ) {
                    placement = 'top';
                } else if (placement === 'top' &&
                    caretRect.top <= toolbar.offsetHeight + minTop + 20
                ) {
                    placement = 'bottom';
                }
            }

            updatePosition();
        }

        function start() {
            toolbar = $(`
                .tox-tinymce-inline:not([style*="display: none"]),
                .tox-hugerte-inline:not([style*="display: none"])
            `)[0];

            if (toolbar) {
                toolbar.dataset.mlsFloatingToolbar = true;
                placement = toolbar.offsetTop < 0 ? 'top' : 'bottom';
                toolbarAnchor = $(toolbar).prevAll('.inline-wysiwyg')[0];
                editor = tinymce.get(toolbarAnchor.id);
                editor?.on('SelectionChange', onSelectionChange);

                return onSelectionChange();
            }

            waitTimer = setTimeout(start, 100);
        }

        function stop() {
            clearTimeout(waitTimer);
            editor?.off('SelectionChange', onSelectionChange);
            delete toolbar.dataset.mlsFloatingToolbar;
            toolbar = null;
            editor = null;
        }

        function updatePosition() {
            if (!toolbar) {
                return;
            }

            require(['@floating-ui/dom'], (floatingUI) => {
                var { computePosition, shift, limitShift } = floatingUI;

                computePosition(toolbarAnchor, toolbar, {
                    middleware: [shift({
                        padding: {
                            top: 50,
                        },
                        mainAxis: false,
                        crossAxis: true,
                        limiter: limitShift({
                            offset: ({ rects }) => {
                                return {
                                    crossAxis: rects.reference.height < rects.floating.height
                                        ? rects.floating.height + rects.reference.height
                                        : rects.floating.height * 2
                                };
                            },
                        }),
                    })],
                    placement: placement,
                }).then(({ x, y }) => {
                    Object.assign(toolbar.style, {
                        top: `${y}px`,
                    });
                });
            });
        }

        document.addEventListener('scroll', updatePosition, {
            capture: true,
            passive: true
        });

        return {
            start,
            stop,
        };
    })();

    return function (target) {
        target.prototype.invertInlineEditorToAccommodateOffscreenToolbar = wrapper.wrap(
            target.prototype.invertInlineEditorToAccommodateOffscreenToolbar,
            function (o) {
                var $inlineToolbar = this.getFixedToolbarContainer().find('.tox-tinymce-inline,.tox-hugerte-inline');

                if ($inlineToolbar.attr('data-mls-floating-toolbar')) {
                    return;
                }

                o();
                stickyToolbar.start();
            }
        );
        target.prototype.onBlur = wrapper.wrap(
            target.prototype.onBlur,
            function (o) {
                stickyToolbar.stop();
                o();
            }
        );
        return target;
    };
});
