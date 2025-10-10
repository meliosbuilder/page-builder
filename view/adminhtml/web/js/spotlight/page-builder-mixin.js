define([
    'jquery',
    'ko',
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/drag-drop/matrix',
    'Melios_PageBuilder/js/spotlight/spotlight',
    'Melios_PageBuilder/js/utils/can-use-hotkeys',
    'Melios_PageBuilder/js/utils/is-in-viewport'
], function ($, ko, wrapper, events, matrix, spotlight, canUseHotkeys, isInViewport) {
    'use strict';

    var mouseCoords = {
            x: 0,
            y: 0,
        },
        recentlyDropped = [],
        currentDraggable;

    events.on('contentType:dropAfter', (event) => {
        recentlyDropped.push(event.contentType);
    });

    $(document).mousemove(function (e) {
        mouseCoords.x = e.clientX;
        mouseCoords.y = e.clientY;

        if (!$('.melios-intent-insert').length) {
            return;
        }

        currentDraggable.helper.css('opacity', 1);
        currentDraggable._mouseDrag(e);
    });

    $(document).mouseup(function (e) {
        if (!$('.melios-intent-insert').length || e.which === 3) {
            return;
        }

        $('.melios-intent-insert').removeClass('melios-intent-insert');

        // var draggableName = ko.dataFor(currentDraggable.element[0])?.config.name,
        //     dropTargetName = ko.dataFor(e.target)?.config.name;

        setTimeout(() => {
            // if (draggableName === 'column-group' && dropTargetName === 'column') {
            //     $('.content-type-container.ui-sortable').each(function () {
            //         if ($(this).data('ui-sortable')) {
            //             $(this).sortable('disable');
            //             setTimeout(() => $(this).sortable('enable'), 50);
            //         }
            //     });
            // }
            currentDraggable._mouseUp(e);
            currentDraggable._mouseStop(e);
            deactivateFocusTrap();
        }, 1);
    });

    $(document).keydown(function (e) {
        if (!$('.melios-intent-insert').length ||
            !['Escape', 'Enter', 'Tab'].includes(e.key)
        ) {
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();

            var focusables = $('.mls-focusable'),
                index = focusables.index(document.activeElement);

            index += e.shiftKey ? -1 : 1;

            if (index >= focusables.length) {
                index = 0;
            } else if (index < 0) {
                index = focusables.length - 1;
            }

            focusables.get(index)?.focus();

            return currentDraggable.helper.css('opacity', 0);
        }

        // cancel dragging
        if (e.code === 'Escape') {
            $('.melios-intent-insert').removeClass('melios-intent-insert');

            deactivateFocusTrap();

            $('.content-type-container.ui-sortable').each(function () {
                if ($(this).data('ui-sortable')) {
                    $(this).sortable('disable');
                    setTimeout(() => $(this).sortable('enable'), 50);
                }
            });
            currentDraggable._mouseStop(jQuery.Event('mousedown'));

            return;
        }

        // drop element into active sortable-placeholder
        if (e.key === 'Enter') {
            setTimeout(() => {
                $('.melios-intent-insert').removeClass('melios-intent-insert');
                deactivateFocusTrap();
                currentDraggable._mouseStop(jQuery.Event('mousedown'));
            }, 200);
        }
    });

    $(document).on('focus', '.mls-focusable', _.debounce(e => {
        if (!$('.melios-intent-insert').length || !$(e.target).is(':focus-visible')) {
            return;
        }

        var focused = $(e.target),
            isFirst = focused.is(':first-child'),
            rect = e.target.getBoundingClientRect(),
            position = {
                left: rect.left + window.scrollX + focused.width() / 2,
                top: rect.top + window.scrollY + 1 + focused.height() / 4,
            };

        if (!isFirst) {
            position.top -= 2;
        }

        // hacky code to activate sortable placeholder
        currentDraggable._mouseDrag(jQuery.Event('mousemove', {
            pageX: position.left,
            pageY: position.top
        }));
        setTimeout(() => {
            currentDraggable._mouseDrag(jQuery.Event('mousemove', {
                pageX: position.left++,
                pageY: position.top++,
            }));
        }, 10);
        setTimeout(() => {
            currentDraggable._mouseDrag(jQuery.Event('mousemove', {
                pageX: position.left--,
                pageY: position.top--,
            }));
        }, 20);

        // sometimes it fails, trying to fix here..
        setTimeout(() => {
            if (!focused.next('.pagebuilder-sortable-placeholder').length &&
                !focused.prev('.pagebuilder-sortable-placeholder').length &&
                !focused.children('.pagebuilder-sortable-placeholder').length &&
                !focused.find('.drop-placeholder').length
            ) {
                currentDraggable._mouseDrag(jQuery.Event('mousemove', {
                    pageX: 0,
                    pageY: position.top + (isFirst ? 10 : -10)
                }));
                setTimeout(() => {
                    currentDraggable._mouseDrag(jQuery.Event('mousemove', {
                        pageX: position.left,
                        pageY: position.top,
                    }));
                }, 10);
            }
        }, 30);
    }, 20));

    function activateFocusTrap(elements) {
        var focused = false,
            rootMargin = {
                top: Math.ceil($('.pagebuilder-header').outerHeight()),
            };

        $('[tabindex], button, input, select, textarea, a, audio, video, summary, details, [contenteditable]').each((i, el) => {
            $(el)
                .attr('data-mls-tabindex', $(el).attr('tabindex'))
                .attr('tabindex', -1);
        });

        $(elements).addClass('mls-focusable').attr('tabindex', 1);

        for (var i = recentlyDropped.length - 1; i >= 0; i--) {
            var scope = $('#' + recentlyDropped[i].id),
                target;

            if (!scope.length || !scope[0].isConnected) {
                continue;
            }

            // try to focus inside dropped element
            target = $('.mls-focusable', scope);
            if (target.length && isInViewport(target[0], { rootMargin })) {
                focused = true;
                target.first().focus();
                break;
            }

            // try to focus after dropped element
            target = $('.mls-focusable', scope.parent());
            if (target.length && isInViewport(target.last()[0], { rootMargin })) {
                focused = true;
                target.last().focus();
                break;
            }
        }

        if (!focused) {
            var rects = $(elements)
                .filter((i, el) => isInViewport(el, { rootMargin }))
                .get()
                .map(el => ({
                    el,
                    rect: el.getBoundingClientRect()
                }));

            focused = rects.reduce((nearest, { el, rect }) => {
                var dx = mouseCoords.x < rect.left ? rect.left - mouseCoords.x :
                           mouseCoords.x > rect.right ? mouseCoords.x - rect.right : 0,
                    dist = Math.hypot(dx, mouseCoords.y - rect.y);

                return !nearest || dist < nearest.dist ? { el, dist } : nearest;
            }, null);

            if (focused) {
                $(focused.el).focus();
            }
        }

        if (!focused) {
            $(elements)
                .filter((i, el) => isInViewport(el, { rootMargin }))
                .each((i, el) => {
                    $(el).focus();
                    focused = true;
                    return false;
                });
        }

        if (!focused) {
            $(elements).first().focus();
        }
    }

    function deactivateFocusTrap() {
        $('.mls-focusable')
            .removeClass('mls-focusable')
            .removeAttr('tabindex');

        $('[data-mls-tabindex]').each((i, el) => {
            var oldIndex = $(el).attr('data-mls-tabindex');

            if (oldIndex !== undefined) {
                $(el).attr('tabindex', oldIndex);
            } else {
                $(el).removeAttr('tabindex', oldIndex);
            }

            $(el).removeAttr('data-mls-tabindex');
        });
    }

    return function (target) {
        target.prototype.initListeners = wrapper.wrapSuper(
            target.prototype.initListeners,
            function () {
                this.createSpotlight();

                this.isFullScreen.subscribe(flag => {
                    if (!flag) {
                        this.spotlight?.spotlight('close');
                    }
                });

                $(document).on('keydown', (e) => {
                    if (e.code === 'Slash' &&
                        this.isFullScreen() &&
                        document.activeElement &&
                        $(document.activeElement).hasClass('search-global-input')
                    ) {
                        $(document.activeElement).blur();
                    }
                });

                return this._super();
            }
        );

        target.prototype.createSpotlight = function () {
            this.spotlight = $('<div>')
                .hide()
                .addClass('pb-' + this.id)
                .appendTo('body')
                .spotlight({
                    items: Object.values(this.config.content_types)
                        .filter(item => item.is_system && this.config.menu_sections[item.menu_section])
                        .sort((a, b) => {
                            return this.config.menu_sections[a.menu_section].sortOrder -
                                this.config.menu_sections[b.menu_section].sortOrder;
                        })
                        .map(item => {
                            return {
                                id: item.name,
                                label: item.label,
                                icon: item.icon,
                            };
                        }),
                    onSelect: (id, event) => {
                        var config = Object.values(this.config.content_types).filter(item => item.name === id)[0];

                        event.preventDefault();

                        if (!config) {
                            return false;
                        }

                        // hide jumping drop indicator
                        $('body').addClass('mls-hide-sortable-placeholder');
                        setTimeout(() => {
                            $('body').removeClass('mls-hide-sortable-placeholder');
                        }, 300);

                        // add timeout to run our logic after mouseup listeners
                        setTimeout(() => {
                            $('.content-type-container.ui-sortable', '.stage-full-screen').each(function () {
                                if ($(this).data('ui-sortable')) {
                                    $(this).sortable('option', 'tolerance', 'intersect');
                                }
                            });

                            var handles = $('.pagebuilder-draggable-content-type.ui-draggable.ui-draggable-handle', '.stage-full-screen'),
                                firstVisibleHandle = handles.filter(':visible').first(),
                                width = firstVisibleHandle.width() || 150,
                                height = firstVisibleHandle.height() || 40,
                                el = handles
                                    .filter((i, el) => config.name === ko.dataFor(el)?.config.name)
                                    .first()
                                    .css({
                                        minWidth: width,
                                        minHeight: height,
                                    });

                            var offset = el.offset();
                            var draggable = el.data('uiDraggable');
                            draggable._mouseStart(jQuery.Event('mousedown', {
                                pageX: offset.left + width / 2,
                                pageY: offset.top + height / 2,
                            }));
                            draggable._mouseDrag(jQuery.Event('mousemove', {
                                pageX: mouseCoords.x + $('html').scrollLeft(),
                                pageY: mouseCoords.y + $('html').scrollTop(),
                            }));
                            currentDraggable = draggable;

                            if (event.key) {
                                currentDraggable.helper.css('opacity', 0);
                            }

                            $('.pagebuilder-stage-wrapper.stage-full-screen .pagebuilder-root-container')
                                .addClass('melios-intent-insert');

                            setTimeout(() => {
                                activateFocusTrap(
                                    $('.pagebuilder-drop-indicator', '.stage-full-screen .pagebuilder-root-container')
                                        .add(
                                            $(
                                                '.ui-sortable:not(:has(>.pagebuilder-drop-indicator))',
                                                '.stage-full-screen .pagebuilder-root-container'
                                            )
                                                .filter((i, el) => {
                                                    if (config.name === 'column-group' &&
                                                        el.closest('.pagebuilder-column-group')
                                                    ) {
                                                        return false;
                                                    }

                                                    return matrix
                                                        .getContainersFor(config.name)
                                                        .includes(ko.dataFor(el)?.config.name);
                                                })
                                        )
                                        .filter((i, el) => $(el).css('visibility') !== 'hidden')
                                        .filter(':visible')
                                        .filter((i, el) => {
                                            var details = $(el).parents('details');

                                            return !details.length || details.get().every(d => d.open);
                                        })
                                );
                            }, 100);
                        }, 20);

                        return true;
                    },
                    canOpen: (e) => {
                        if (!this.isFullScreen() || !canUseHotkeys(e) || $('.ui-draggable-dragging').length) {
                            return false;
                        }

                        var topmostModal = $('.modals-wrapper > ._show').sort((a, b) => {
                            return b.style.zIndex - a.style.zIndex;;
                        }).get(0);

                        if (topmostModal && !$(topmostModal).has('#' + this.id).length) {
                            return false
                        }

                        var data = {
                            canOpen: true
                        };

                        $(document).trigger('melios:spotlight:beforeOpen', data);

                        return data.canOpen;
                    }
                });
        };

        return target;
    };
});
