define([
    'jquery',
    'mage/utils/wrapper'
], function ($, wrapper) {
    'use strict';

    var stickyToolbar = (() => {
        var minTop = 50,
            waitTimer,
            placement,
            toolbarAnchor,
            toolbar;

        function start() {
            toolbar = $(`
                .tox-tinymce-inline:not([style*="display: none"]),
                .tox-hugerte-inline:not([style*="display: none"])
            `)[0];

            if (toolbar) {
                toolbar.dataset.mlsFloatingToolbar = true;
                placement = toolbar.offsetTop < 0 ? 'top' : 'bottom';
                toolbarAnchor = $(toolbar).prevAll('.inline-wysiwyg')[0];
                return updatePosition();
            }

            waitTimer = setTimeout(start, 100);
        }

        function stop() {
            clearTimeout(waitTimer);
            delete toolbar.dataset.mlsFloatingToolbar;
            toolbar = null;
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
