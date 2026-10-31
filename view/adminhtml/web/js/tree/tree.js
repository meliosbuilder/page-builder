define([
    'jquery',
    'mage/translate',
    'Magento_PageBuilder/js/events',
    'Melios_PageBuilder/js/utils/open-edit',
    'Melios_PageBuilder/js/tree/content-types',
    'Melios_PageBuilder/js/tree/commands',
    'Melios_PageBuilder/js/tree/menu',
    'Melios_PageBuilder/js/tree/stage-scroll'
], function ($, $t, events, openEdit, types, Commands, menu, scrollIntoStage) {
    'use strict';

    // Distance from the line between two rows where the pointer shows the inserter
    const INSERT_GAP = 4;

    function Tree(pageBuilder, panel) {
        var edited = openEdit.currentEl();

        this.pageBuilder = pageBuilder;
        this.panel = panel;
        this.commands = new Commands(this);
        this.el = null;
        this.selected = edited?.stageId === pageBuilder.id ? edited.id : null;
        this.hovered = null;
        this.focused = null;
        this.collapsed = new Set();
        this.search = null;
        this.inserter = null;
        this.insertAt = null;
        this.query = '';
        this.signature = null;
        this.renderTimer = null;

        events.on('stage:updateAfter', data => {
            if (data.stageId === pageBuilder.id) {
                this.schedule();
            }
        });
        events.on(`stage:${pageBuilder.id}:viewportChangeAfter`, () => this.schedule());

        events.on('contentType:editBefore', data => {
            if (data.contentType.stageId === pageBuilder.id) {
                this.select(data.contentType);
            }
        });
        $(document).on('modalclosed', '.pagebuilder_modal_form_pagebuilder_modal_form_modal', () => {
            this.selected = null;
            this.updateStates();
        });

        events.on('melios:add:after', data => {
            if (data.stageId === pageBuilder.id) {
                this.scrollStageWhenRendered(data.contentType);
            }
        });
    }

    Tree.prototype.mount = function (container) {
        this.mountSearch(container);
        this.el = $('<div class="mls-tree" role="tree">')
            .attr('aria-label', $t('Layers'))
            .appendTo(container)
            .on('click', '.mls-tree-eye', e => {
                var contentType = this.rowContentType(e.currentTarget);

                e.stopPropagation();

                if (contentType) {
                    this.commands.toggleHidden(contentType);
                }
            })
            .on('click', '.mls-tree-more', e => {
                var button = e.currentTarget,
                    rect = button.getBoundingClientRect();

                e.stopPropagation();

                if (menu.isOpenFor(button)) {
                    menu.close();
                } else {
                    this.openMenu(button.closest('.mls-tree-row'), { x: rect.left, y: rect.bottom + 2 }, button);
                }
            })
            .on('click', '.mls-tree-row', e => this.onClick(e))
            .on('contextmenu', '.mls-tree-row', e => {
                e.preventDefault();
                this.openMenu(e.currentTarget, { x: e.clientX, y: e.clientY });
            })
            .on('keydown', e => this.onKey(e))
            .on('focusin', '.mls-tree-row', e => {
                this.focused = e.currentTarget.dataset.id;
                this.updateStates();
            })
            .on('focusout', e => {
                if (!this.el[0].contains(e.relatedTarget) && !$(e.relatedTarget).closest('.mls-tree-menu').length) {
                    this.hover(this.el[0].querySelector(':scope > .mls-tree-row:hover')?.dataset.id);
                }
            })
            .on('mouseover', '.mls-tree-row', e => this.hover(e.currentTarget.dataset.id))
            .on('mousemove', e => this.onMouseMove(e))
            .on('mouseleave', () => {
                this.showInserter(null);

                if (!this.el.children('.mls-menu-open').length) {
                    this.hover(null);
                }
            });

        this.inserter = $('<button type="button" class="mls-tree-insert" tabindex="-1">')
            .attr({ title: $t('Add'), 'aria-label': $t('Add') })
            .on('click', e => {
                var action = this.insertAt?.action;

                e.stopPropagation();
                this.showInserter(null);
                action?.();
            })[0];

        ['copy', 'cut', 'paste'].forEach(type => document.addEventListener(type, e => this.onClipboard(e), true));
    };

    Tree.prototype.mountSearch = function (container) {
        var id = `mls-tree-search-${this.pageBuilder.id}`,
            input,
            clear;

        this.search = $(`
            <div class="search-content-types mls-tree-search">
                <label></label>
                <a href="" class="close"></a>
                <input type="text" autocomplete="off">
            </div>
        `).appendTo(container);
        input = this.search.find('input').attr({
            id,
            placeholder: $t('Find items'),
            'aria-label': $t('Find items'),
        });
        clear = this.search.find('.close').attr('title', $t('Clear search')).hide();
        this.search.find('label').attr('for', id);

        input
            .on('input', () => this.setQuery(input.val()))
            .on('keydown', e => {
                if (e.key === 'Escape' && input.val()) {
                    this.setQuery('');
                } else if (e.key === 'ArrowDown') {
                    this.focusRow(this.el.children('.mls-tree-row')[0]);
                } else {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
            });
        clear.on('click', e => {
            e.preventDefault();
            this.setQuery('');
            input.trigger('focus');
        });
    };

    Tree.prototype.setQuery = function (value) {
        var input = this.search.find('input');

        if (input.val() !== value) {
            input.val(value);
        }

        this.search.find('.close').toggle(!!value);
        this.query = value.trim().toLowerCase();
        this.render();
    };

    Tree.prototype.schedule = function () {
        clearTimeout(this.renderTimer);
        this.renderTimer = setTimeout(() => this.render(), 50);
    };

    Tree.prototype.rows = function (all) {
        var rows = [],
            query = this.query,
            viewport = this.pageBuilder.viewport(),
            collect = (container, depth, parentDimmed) => {
                container.getChildren()().forEach(contentType => {
                    var hidden, row, start;

                    if (!contentType.config.form) {
                        if (contentType.getChildren) {
                            collect(contentType, depth, parentDimmed);
                        }
                        return;
                    }

                    hidden = types.hidden(contentType, viewport);
                    row = {
                        id: contentType.id,
                        depth,
                        label: contentType.config.label,
                        preview: types.preview(contentType),
                        empty: types.empty(contentType),
                        icon: contentType.config.icon || '',
                        hidden,
                        dimmed: !!hidden || parentDimmed,
                        parent: false,
                        collapsed: !query && this.collapsed.has(contentType.id),
                        canHide: !!contentType.preview.getOptions?.()?.getOption('hideShow'),
                    };
                    rows.push(row);

                    if (contentType.getChildren) {
                        start = rows.length;
                        collect(contentType, depth + 1, row.dimmed);
                        row.parent = rows.length > start;

                        if (row.collapsed && !all) {
                            rows.length = start;
                        }
                    }

                    if (query && !row.parent && ![
                        row.label.toLowerCase(),
                        types.searchText(contentType),
                        row.empty ? $t('Empty').toLowerCase() : '',
                    ].join(' ').includes(query)) {
                        rows.pop();
                    }
                });
            };

        collect(this.pageBuilder.stage.rootContainer, 0, false);

        return rows;
    };

    Tree.prototype.render = function () {
        var rows, signature, focusedIndex, empty;

        clearTimeout(this.renderTimer);

        if (!this.el || this.panel.tab !== 'layers' || !this.pageBuilder.stage) {
            return;
        }

        rows = this.rows();
        signature = JSON.stringify({ searched: !!this.query, rows });

        if (signature !== this.signature) {
            this.signature = signature;
            focusedIndex = this.el.children('.mls-tree-row').index(document.activeElement);
            this.el.toggleClass('mls-searched', !!this.query);

            this.showInserter(null);

            if (rows.length) {
                this.el[0].replaceChildren(...rows.map(row => this.renderRow(row)), this.inserter);
            } else {
                empty = document.createElement('div');
                empty.className = 'mls-tree-empty';
                empty.textContent = this.query ? $t('No matching elements') : $t('No elements yet');
                this.el[0].replaceChildren(empty);
            }

            if (focusedIndex !== -1) {
                this.focusRow(this.row(this.focused) ||
                    this.el.children('.mls-tree-row')[Math.min(focusedIndex, rows.length - 1)]);
            }
        }

        this.updateStates();
    };

    Tree.prototype.renderRow = function (row) {
        var el = document.createElement('div'),
            toggle = document.createElement('span'),
            typeIcon = document.createElement('i'),
            label = document.createElement('span'),
            preview,
            empty;

        el.className = 'mls-tree-row';
        el.classList.toggle('mls-dimmed', row.dimmed);
        el.dataset.id = row.id;
        el.title = row.preview ? `${row.label}: ${row.preview}` : row.label;
        el.tabIndex = -1;
        el.setAttribute('role', 'treeitem');
        el.setAttribute('aria-level', row.depth + 1);
        el.style.setProperty('--mls-depth', row.depth);

        toggle.className = 'mls-tree-toggle';

        if (row.parent) {
            el.setAttribute('aria-expanded', !row.collapsed);
        }

        typeIcon.className = row.icon;
        label.className = 'mls-tree-label';
        label.textContent = row.label;

        if (row.preview) {
            preview = document.createElement('span');
            preview.className = 'mls-tree-preview';
            preview.textContent = row.preview;
            label.append(' ', preview);
        }

        if (row.empty) {
            empty = document.createElement('span');
            empty.className = 'mls-tree-preview mls-blank';
            empty.textContent = $t('Empty');
            label.append(' ', empty);
            el.title += ` (${empty.textContent})`;
        }

        el.append(toggle, typeIcon, label, this.renderActions(row));

        return el;
    };

    Tree.prototype.renderActions = function (row) {
        var actions = document.createElement('span'),
            eye = document.createElement(row.canHide ? 'button' : 'span'),
            more = document.createElement('button');

        actions.className = 'mls-tree-actions';

        if (row.canHide || row.hidden) {
            eye.className = 'mls-tree-eye';
            eye.classList.toggle('mls-on', !!row.hidden);
            eye.title = row.hidden ? this.hiddenTitle(row.hidden) : $t('Hide');
            eye.setAttribute('aria-label', eye.title);

            if (row.canHide) {
                eye.type = 'button';
                eye.tabIndex = -1;
            }

            actions.append(eye);
        }

        more.type = 'button';
        more.className = 'mls-tree-more';
        more.tabIndex = -1;
        more.title = $t('More actions');
        more.setAttribute('aria-label', more.title);
        more.setAttribute('aria-haspopup', 'menu');
        actions.append(more);

        return actions;
    };

    Tree.prototype.hiddenTitle = function (hidden) {
        var viewport = this.pageBuilder.viewports?.[hidden];

        return hidden === 'all' ? $t('Hidden') : $t('Hidden on %1').replace('%1', viewport?.label || hidden);
    };

    Tree.prototype.updateStates = function () {
        var rows = this.el?.children('.mls-tree-row'),
            stop = rows && (this.row(this.focused) || this.row(this.selected) || rows[0]);

        rows?.each((i, row) => {
            var selected = row.dataset.id === this.selected;

            row.classList.toggle('mls-selected', selected);
            row.setAttribute('aria-selected', selected);
            row.classList.toggle('mls-hovered', row.dataset.id === this.hovered);
            row.tabIndex = row === stop ? 0 : -1;
        });
    };

    Tree.prototype.row = function (id) {
        return id ? this.el.children(`[data-id="${CSS.escape(id)}"]`)[0] || null : null;
    };

    Tree.prototype.rowContentType = function (node) {
        var row = node.closest('.mls-tree-row');

        return row ? types.find(this.pageBuilder.stage.rootContainer, row.dataset.id) : null;
    };

    Tree.prototype.focusRow = function (row) {
        if (!row) {
            return;
        }

        row.focus({ preventScroll: true });
        this.scrollToRow(row);
        this.hover(row.dataset.id);
    };

    Tree.prototype.setCollapsed = function (id, flag) {
        if (flag) {
            this.collapsed.add(id);
        } else {
            this.collapsed.delete(id);
        }

        this.render();
    };

    Tree.prototype.setCollapsedAtDepth = function (row, flag) {
        var depth = +row.getAttribute('aria-level') - 1;

        this.rows(true).forEach(r => {
            if (!r.parent || r.depth !== depth) {
                return;
            }

            if (flag) {
                this.collapsed.add(r.id);
            } else {
                this.collapsed.delete(r.id);
            }
        });

        this.render();
    };

    Tree.prototype.onClick = function (e) {
        var row = e.currentTarget,
            contentType = this.rowContentType(row);

        if (!contentType) {
            return;
        }

        if ($(e.target).closest('.mls-tree-toggle').length && row.hasAttribute('aria-expanded')) {
            if (this.query) {
                return;
            }

            if (e.metaKey || e.ctrlKey) {
                this.setCollapsedAtDepth(row, !this.collapsed.has(row.dataset.id));
            } else {
                this.setCollapsed(row.dataset.id, !this.collapsed.has(row.dataset.id));
            }
            return;
        }

        this.commands.edit(contentType);
    };

    Tree.prototype.onMouseMove = function (e) {
        if (e.target !== this.inserter) {
            this.showInserter(this.query || e.buttons ? null : this.gapAt(e.clientY));
        }
    };

    /**
     * The line between two rows adds before the lower one, the line under the last row after the last
     * top level element.
     *
     * @return {{row, edge: 'top'|'bottom', contentType, where: 'before'|'after', depth}|null}
     */
    Tree.prototype.gapAt = function (y) {
        var rows = this.el.children('.mls-tree-row').get(),
            last = rows[rows.length - 1],
            row,
            top;

        row = rows.find(el => Math.abs(y - el.getBoundingClientRect().top) <= INSERT_GAP);

        if (row) {
            return {
                row,
                edge: 'top',
                contentType: this.rowContentType(row),
                where: 'before',
                depth: +row.getAttribute('aria-level') - 1,
            };
        }

        if (last && Math.abs(y - last.getBoundingClientRect().bottom) <= INSERT_GAP) {
            top = rows.filter(el => el.getAttribute('aria-level') === '1').pop();

            return top ? { row: last, edge: 'bottom', contentType: this.rowContentType(top), where: 'after', depth: 0 } :
                null;
        }

        return null;
    };

    Tree.prototype.showInserter = function (gap) {
        var key = gap?.contentType && `${gap.contentType.id}:${gap.where}`,
            action;

        if (key !== this.insertAt?.key) {
            action = key && this.commands.addAction(gap.contentType, gap.where);
            this.insertAt = action ? { key, action: action.action } : null;

            if (action) {
                this.inserter.style.setProperty('--mls-insert-y',
                    gap.row.offsetTop + (gap.edge === 'top' ? 0 : gap.row.offsetHeight) + 'px');
                this.inserter.style.setProperty('--mls-depth', gap.depth);
            }
        }

        this.inserter?.classList.toggle('mls-on', !!this.insertAt);
    };

    Tree.prototype.openMenu = function (row, at, button) {
        var contentType = this.rowContentType(row);

        if (!contentType) {
            return;
        }

        row.classList.add('mls-menu-open');
        menu.open(this.commands.menu(contentType), at, () => {
            row.classList.remove('mls-menu-open');

            if (row.isConnected) {
                row.focus({ preventScroll: true });
            }
        }, button);
    };

    Tree.prototype.onKey = function (e) {
        var row = e.target.closest?.('.mls-tree-row'),
            rows = this.el.children('.mls-tree-row'),
            index = rows.index(row),
            contentType = row && this.rowContentType(row),
            expanded = row?.getAttribute('aria-expanded'),
            key = e.key,
            level,
            rect;

        if (!contentType || e.target !== row) {
            return;
        }

        if (key === 'ArrowUp' && index === 0) {
            this.search.find('input').trigger('focus');
        } else if (key === 'ArrowDown' || key === 'ArrowUp') {
            this.focusRow(rows[index + (key === 'ArrowDown' ? 1 : -1)]);
        } else if (key === 'Home' || key === 'End') {
            this.focusRow(key === 'Home' ? rows[0] : rows[rows.length - 1]);
        } else if (key === 'ArrowRight') {
            if (expanded === 'false') {
                this.setCollapsed(row.dataset.id, false);
            } else if (expanded === 'true') {
                this.focusRow(rows[index + 1]);
            }
        } else if (key === 'ArrowLeft') {
            if (expanded === 'true' && !this.query) {
                this.setCollapsed(row.dataset.id, true);
            } else {
                level = +row.getAttribute('aria-level');
                this.focusRow(rows.slice(0, index).get().reverse()
                    .find(previous => +previous.getAttribute('aria-level') < level));
            }
        } else if (key === 'ContextMenu' || (key === 'F10' && e.shiftKey)) {
            rect = row.getBoundingClientRect();
            this.openMenu(row, { x: rect.left + 24, y: rect.bottom });
        } else if (!this.commands.onKey(e, contentType)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
    };

    Tree.prototype.onClipboard = function (e) {
        var row = this.el[0].contains(document.activeElement) && document.activeElement.closest('.mls-tree-row'),
            contentType = row && this.rowContentType(row);

        if (contentType && this.commands.clipboard(e, contentType)) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    };

    function outlined(contentType) {
        var element = contentType && types.stageElement(contentType);

        if (element && !element.classList.contains('pagebuilder-content-type')) {
            return element.querySelector(':scope > .pagebuilder-content-type') || element;
        }

        return element;
    }

    Tree.prototype.hover = function (id) {
        var root = this.pageBuilder.stage.rootContainer,
            previous,
            contentType;

        id = id || null;

        if (id === this.hovered) {
            return;
        }

        previous = this.hovered && types.find(root, this.hovered);
        contentType = id && types.find(root, id);
        $(outlined(previous)).removeClass('mls-tree-hover');
        $(outlined(contentType)).addClass('mls-tree-hover');
        this.hovered = id;
        events.trigger('melios:tree:hover', { stageId: this.pageBuilder.id, id });
        this.updateStates();
    };

    Tree.prototype.reveal = function (contentType) {
        this.scrollStageWhenRendered(contentType);
        events.trigger('melios:tree:reveal', { stageId: this.pageBuilder.id, contentType });
    };

    function showInParents(contentType) {
        var child = contentType,
            parent = child.parentContentType,
            tabs = [],
            index,
            preview;

        while (parent) {
            index = parent.getChildren?.()().indexOf(child);
            preview = parent.preview;

            if (child.config.name === 'slide' && preview.navigateToSlide && preview.activeSlide() !== index) {
                preview.navigateToSlide(index);
            } else if (child.config.name === 'tab-item' && preview.setActiveTab && preview.activeTab() !== index) {
                preview.setActiveTab(index);
                tabs.push(parent.id);
            }

            child = parent;
            parent = child.parentContentType;
        }

        return tabs;
    }

    Tree.prototype.scrollStage = function (contentType) {
        var tabs = showInParents(contentType),
            scroll = () => {
                var el = types.stageElement(contentType);

                if (el) {
                    scrollIntoStage(el);
                }
            };

        this.cancelStageScroll();

        if (!tabs.length) {
            scroll();
            return;
        }

        events.on('contentType:redrawAfter', data => {
            tabs = tabs.filter(id => id !== data.id);

            if (!tabs.length) {
                this.cancelStageScroll();
                scroll();
            }
        }, this.revealKey());
    };

    Tree.prototype.scrollStageWhenRendered = function (contentType) {
        if (types.stageElement(contentType)?.isConnected) {
            this.scrollStage(contentType);
            return;
        }

        this.cancelStageScroll();
        events.on('contentType:renderAfter', data => {
            if (data.id === contentType.id) {
                this.scrollStage(contentType);
            }
        }, this.revealKey());
    };

    Tree.prototype.cancelStageScroll = function () {
        events.off(this.revealKey());
    };

    Tree.prototype.revealKey = function () {
        return `melios-tree:${this.pageBuilder.id}:reveal`;
    };

    Tree.prototype.select = function (contentType) {
        var parent = contentType.parentContentType;

        this.selected = contentType.id;

        while (parent) {
            this.collapsed.delete(parent.id);
            parent = parent.parentContentType;
        }

        this.render();
        this.scrollToSelected();
    };

    Tree.prototype.scrollToSelected = function () {
        this.scrollToRow(this.el?.children('.mls-selected')[0]);
    };

    Tree.prototype.scrollToRow = function (row) {
        var rect, visible;

        if (!row || this.panel.tab !== 'layers') {
            return;
        }

        rect = row.getBoundingClientRect();
        visible = this.panel.visibleRect();

        if (rect.top < visible.top) {
            this.panel.body[0].scrollTop -= visible.top - rect.top;
        } else if (rect.bottom > visible.bottom) {
            this.panel.body[0].scrollTop += rect.bottom - visible.bottom;
        }
    };

    return Tree;
});
