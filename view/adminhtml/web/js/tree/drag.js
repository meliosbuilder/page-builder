define([
    'jquery',
    'knockout',
    'Melios_PageBuilder/js/utils/struct',
    'Melios_PageBuilder/js/utils/add',
    'Melios_PageBuilder/js/tree/content-types'
], function ($, ko, struct, add, types) {
    'use strict';

    const THRESHOLD = 4,
        EDGE = 32,
        EXPAND_DELAY = 600,
        OWN_PARENT = ['column', 'tab-item'];

    function within(rect, x, y) {
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    function lastDescendant(rows, row) {
        var level = +row.getAttribute('aria-level'),
            index = rows.indexOf(row);

        while (rows[index + 1] && +rows[index + 1].getAttribute('aria-level') > level) {
            index++;
        }

        return rows[index];
    }

    function Drag(panel) {
        this.panel = panel;
        this.tree = panel.tree;
        this.pressed = null;
        this.state = null; // {name, moving, ghost}: moving is the element of a dragged row, null from Elements
        this.target = null;
        this.pointer = null;
        this.returnTab = undefined;
        this.expandTimer = null;
        this.expandId = null;
        this.scrollFrame = null;
        this.releaseClick = null;

        this.tree.el.on('pointerdown', '.mls-tree-row', e => this.onPress(e));
        document.addEventListener('pointermove', e => this.onPointerMove(e));
        document.addEventListener('pointerup', () => this.onRelease(true));
        // No pointerup follows, e.g. a touch that scrolls
        document.addEventListener('pointercancel', () => this.onRelease(false));
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.state?.moving) {
                e.preventDefault();
                e.stopPropagation();
                this.end();
            }
        }, true);

        // jQuery UI draggable of the Elements panel (Magento_PageBuilder/js/panel)
        panel.el
            .on('dragstart', '.pagebuilder-draggable-content-type', e => {
                var config = ko.dataFor(e.currentTarget)?.config;

                if (config) {
                    this.start(config.name, null);
                    this.suppressClick();
                }
            })
            .on('drag', '.pagebuilder-draggable-content-type', e => {
                if (this.state && !this.state.moving) {
                    this.move(e.clientX, e.clientY);
                }
            })
            .on('dragstop', '.pagebuilder-draggable-content-type', () => {
                if (this.state && !this.state.moving) {
                    this.drop();
                }
            });
    }

    Drag.prototype.onPress = function (e) {
        var contentType = this.tree.rowContentType(e.currentTarget);

        if (e.button !== 0 || !contentType || $(e.target).closest('button, .mls-tree-toggle').length) {
            return;
        }

        this.pressed = { x: e.clientX, y: e.clientY, contentType };
    };

    Drag.prototype.onPointerMove = function (e) {
        var pressed = this.pressed;

        if (!(e.buttons & 1)) {
            this.onRelease(false);
            return;
        }

        if (pressed && !this.state && Math.hypot(e.clientX - pressed.x, e.clientY - pressed.y) >= THRESHOLD) {
            this.start(pressed.contentType.config.name, pressed.contentType);
        }

        if (this.state?.moving) {
            this.move(e.clientX, e.clientY);
        }
    };

    Drag.prototype.onRelease = function (drop) {
        this.pressed = null;

        if (!this.state?.moving) {
            return;
        }

        if (drop) {
            this.suppressClick();
            this.drop();
        } else {
            this.end();
        }
    };

    /**
     * The click that ends a drag doesn't open the row's form: blocked until the drag ends (end()).
     * From Elements it comes before the drop (Melios_PageBuilder spotlight stops the drag after the mouseup),
     * and opening another form of the same type meanwhile renders it twice.
     */
    Drag.prototype.suppressClick = function () {
        var el = this.tree.el[0],
            stop = e => {
                e.stopPropagation();
                e.preventDefault();
            };

        this.releaseClick?.();
        el.addEventListener('click', stop, true);
        this.releaseClick = () => el.removeEventListener('click', stop, true);
    };

    Drag.prototype.start = function (name, moving) {
        this.pressed = null;
        this.state = { name, moving, ghost: moving && this.ghost(moving) };

        if (moving) {
            this.markDragged();
            this.tree.hover(null);
        }

        $('body').addClass('mls-tree-dragging');
    };

    Drag.prototype.ghost = function (contentType) {
        return $('<div class="mls-tree-ghost">')
            .append($('<i>').addClass(contentType.config.icon || ''))
            .append($('<span>').text(contentType.config.label))
            .appendTo('body');
    };

    Drag.prototype.markDragged = function () {
        this.tree.row(this.state.moving?.id)?.classList.add('mls-dragged');
    };

    Drag.prototype.move = function (x, y) {
        var layers, collapsed;

        if (!this.state || !Number.isFinite(x) || !Number.isFinite(y)) {
            return;
        }

        this.pointer = { x, y };
        this.state.ghost?.css({ left: x + 12, top: y + 8 });

        if (!this.state.moving && this.panel.tab !== 'layers') {
            layers = this.panel.rail.find('[data-tab="layers"]')[0];

            if (layers && within(layers.getBoundingClientRect(), x, y)) {
                this.showLayers();
            }
        }

        this.target = this.panel.tab === 'layers' ? this.targetAt(x, y) : null;
        collapsed = this.target?.edge === 'inside' && this.target.row.getAttribute('aria-expanded') === 'false';
        this.expandLater(collapsed ? this.target.row.dataset.id : null);
        this.show(this.target);
        this.autoScroll(x, y);
    };

    Drag.prototype.showLayers = function () {
        this.returnTab = this.panel.tab;
        this.panel.setTab('layers');
    };

    Drag.prototype.accepts = function (parent) {
        var moving = this.state.moving;

        if (moving && OWN_PARENT.includes(moving.config.name)) {
            return parent === moving.parentContentType;
        }

        return !!parent && struct.accepts(parent, this.state.name) && !(moving && types.contains(moving, parent));
    };

    /**
     * Rows scrolled under the panel's head aren't targets.
     *
     * @return {{parent, index, row, edge: 'top'|'bottom'|'inside', depth, last}|null}
     */
    Drag.prototype.targetAt = function (x, y) {
        var rows = this.tree.el.children('.mls-tree-row').get(),
            last = rows[rows.length - 1],
            root = this.tree.pageBuilder.stage.rootContainer,
            row,
            target;

        if (!within(this.panel.visibleRect(), x, y)) {
            return null;
        }

        row = rows.find(el => {
            var rect = el.getBoundingClientRect();

            return y >= rect.top && y < rect.bottom;
        });

        if (row) {
            target = this.rowTarget(row, rows, y);
        } else if (!last || y >= last.getBoundingClientRect().bottom) {
            target = { parent: root, index: root.getChildren()().length, row: last, edge: 'bottom', depth: 0 };
        }

        return target && this.accepts(target.parent) ? target : null;
    };

    /**
     * Its top quarter is before the row's element, its bottom quarter after it (into an expanded container:
     * first inside it), the middle inside it when it accepts the element. Rows that accept nothing are split
     * in halves.
     */
    Drag.prototype.rowTarget = function (row, rows, y) {
        var contentType = this.tree.rowContentType(row),
            parent = contentType?.parentContentType,
            index,
            depth,
            rect,
            share,
            before,
            after;

        // Removed, the tree isn't rendered again yet
        if (!parent) {
            return null;
        }

        index = parent.getChildren()().indexOf(contentType);
        depth = +row.getAttribute('aria-level') - 1;
        rect = row.getBoundingClientRect();
        share = (y - rect.top) / rect.height;
        before = { parent, index, row, edge: 'top', depth };
        after = row.getAttribute('aria-expanded') === 'true' ?
            { parent: contentType, index: 0, row, edge: 'bottom', depth: depth + 1 } :
            { parent, index: index + 1, row, edge: 'bottom', depth };

        if (!contentType.getChildren || !this.accepts(contentType)) {
            return share < .5 ? before : after;
        }

        return share < .25 ? before : share > .75 ? after : {
            parent: contentType,
            index: contentType.getChildren()().length,
            row,
            edge: 'inside',
            depth: depth + 1,
            last: lastDescendant(rows, row),
        };
    };

    Drag.prototype.expandLater = function (id) {
        if (id === this.expandId) {
            return;
        }

        clearTimeout(this.expandTimer);
        this.expandId = id;

        if (id) {
            this.expandTimer = setTimeout(() => {
                this.expandId = null;
                this.tree.setCollapsed(id, false);
                this.markDragged();
                this.move(this.pointer.x, this.pointer.y);
            }, EXPAND_DELAY);
        }
    };

    Drag.prototype.show = function (target) {
        var tree = this.tree.el,
            row = target?.edge === 'inside' ? target.last : target?.row,
            y;

        tree.children('.mls-drop-inside').removeClass('mls-drop-inside');
        $(target?.edge === 'inside' ? target.row : null).addClass('mls-drop-inside');
        $('body').toggleClass('mls-tree-no-drop', !target && this.panel.tab === 'layers');

        tree.toggleClass('mls-drop', !!row);

        if (row) {
            y = row.offsetTop + (target.edge === 'top' ? 0 : row.offsetHeight);
            tree[0].style.setProperty('--mls-drop-y', y + 'px');
            tree[0].style.setProperty('--mls-drop-depth', target.depth);
        }
    };

    Drag.prototype.autoScroll = function (x, y) {
        var body = this.panel.body[0],
            visible = this.panel.visibleRect(),
            speed = 0;

        cancelAnimationFrame(this.scrollFrame);

        if (x >= visible.left && x <= visible.right) {
            if (y < visible.top + EDGE) {
                speed = -Math.min(visible.top + EDGE - y, EDGE) / 2;
            } else if (y > visible.bottom - EDGE) {
                speed = Math.min(y - visible.bottom + EDGE, EDGE) / 2;
            }
        }

        if (speed && this.panel.tab === 'layers') {
            this.scrollFrame = requestAnimationFrame(() => {
                body.scrollTop += speed;
                this.move(x, y);
            });
        }
    };

    Drag.prototype.drop = function () {
        var state = this.state,
            target = this.target;

        this.end();

        if (!target) {
            return;
        }

        if (state.moving) {
            struct.move(state.moving, target.parent, target.index).then(moved => {
                if (moved) {
                    this.tree.scrollStageWhenRendered(state.moving);
                }
            });
        } else {
            add.create(state.name, target);
        }
    };

    Drag.prototype.end = function () {
        var returnTab = this.returnTab,
            releaseClick = this.releaseClick;

        if (releaseClick) {
            this.releaseClick = null;
            setTimeout(releaseClick);
        }

        cancelAnimationFrame(this.scrollFrame);
        this.expandLater(null);
        this.state?.ghost?.remove();
        this.state = null;
        this.target = null;
        this.pointer = null;
        this.returnTab = undefined;
        this.tree.el.removeClass('mls-drop')
            .children('.mls-dragged, .mls-drop-inside').removeClass('mls-dragged mls-drop-inside');
        $('body').removeClass('mls-tree-dragging mls-tree-no-drop');

        if (returnTab !== undefined) {
            this.panel.setTab(returnTab);
        }
    };

    return Drag;
});
