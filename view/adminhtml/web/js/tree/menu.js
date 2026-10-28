define([
    'jquery'
], function ($) {
    'use strict';

    var menu = null,
        opener = null,
        onClose = null;

    function items() {
        return menu.find('[role="menuitem"]:not(:disabled)');
    }

    function move(step) {
        var all = items(),
            index = all.index(document.activeElement);

        all.eq((index + step + all.length) % all.length).trigger('focus');
    }

    function close() {
        var closed = onClose;

        if (!menu) {
            return;
        }

        menu.remove();
        opener?.setAttribute('aria-expanded', 'false');
        menu = null;
        opener = null;
        onClose = null;
        $(document).add(window).off('.mlsTreeMenu');
        closed?.();
    }

    function open(entries, at, closed, button) {
        var rect;

        close();
        menu = $('<div class="mls-tree-menu" role="menu">').append(entries.map(entry => {
            if (entry === '-') {
                return $('<div class="mls-tree-menu-separator" role="separator">');
            }

            return $('<button type="button" role="menuitem">')
                .toggleClass('mls-danger', !!entry.danger)
                .prop('disabled', !!entry.disabled)
                .append($('<span>').text(entry.label))
                .append(entry.pro ? $('<span class="mls-tree-menu-pro">').text('PRO') : [])
                .on('click', () => {
                    close();
                    entry.action();
                });
        })).appendTo('body');

        onClose = closed;
        opener = button || null;
        opener?.setAttribute('aria-expanded', 'true');

        rect = menu[0].getBoundingClientRect();
        menu.css({
            left: at.x + rect.width > window.innerWidth ? Math.max(4, at.x - rect.width) : at.x,
            top: at.y + rect.height > window.innerHeight ? Math.max(4, at.y - rect.height) : at.y,
        });

        menu.on('keydown', e => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                move(e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Escape' || e.key === 'Tab') {
                close();
            } else {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
        });

        $(document).on('mousedown.mlsTreeMenu', e => {
            if (!menu[0].contains(e.target) && !opener?.contains(e.target)) {
                close();
            }
        });
        $(window).on('blur.mlsTreeMenu resize.mlsTreeMenu', close);

        items().first().trigger('focus');
    }

    return {
        open,
        close,
        isOpenFor: button => !!menu && opener === button,
    };
});
