define([
    'mage/translate',
    'Melios_PageBuilder/js/utils/toast',
    'Melios_PageBuilder/js/utils/clipboard',
    'Melios_PageBuilder/js/copy-paste/serializer',
    'Melios_PageBuilder/js/utils/struct',
    'Melios_PageBuilder/js/utils/add',
    'Melios_PageBuilder/js/utils/open-edit',
    'Melios_PageBuilder/js/tree/content-types'
], function ($t, toast, clipboard, serializer, struct, add, openEdit, types) {
    'use strict';

    function newColumn() {
        return { config: { name: 'column' }, states: {}, children: [] };
    }

    function Commands(tree) {
        this.tree = tree;
        this.pageBuilder = tree.pageBuilder;
    }

    Commands.prototype.edit = function (contentType) {
        this.tree.reveal(contentType);

        if (!openEdit.isEditing(contentType)) {
            openEdit.open(contentType);
        }
    };

    Commands.prototype.addTarget = function (contentType, where = 'after') {
        var target = add.target(contentType, where);

        return target && add.items(this.pageBuilder, target.parent).length ? target : null;
    };

    Commands.prototype.addAction = function (contentType, where = 'after') {
        var name = contentType.config.name,
            inside = where === 'inside',
            addChild = inside && types.option(contentType, 'add'),
            target;

        if (inside && name === 'column-group') {
            return {
                label: $t('Add column'),
                action: () => struct.addColumn(newColumn(), contentType),
            };
        }

        if (addChild) {
            return { label: addChild.title(), action: () => addChild.action() };
        }

        if (!inside && name === 'column') {
            return this.addSameTypeAction(contentType, where);
        }

        target = this.addTarget(contentType, where);

        return target ? {
            label: {
                before: $t('Add before'),
                after: $t('Add after'),
                inside: $t('Add inside')
            }[where],
            action: () => add.openSpotlight(this.pageBuilder, target),
        } : !inside && this.addSameTypeAction(contentType, where);
    };

    Commands.prototype.addSameTypeAction = function (contentType, where) {
        var name = contentType.config.name,
            target = add.target(contentType, where);

        if (!target || !struct.accepts(target.parent, name)) {
            return null;
        }

        return {
            label: (where === 'before' ? $t('Add %1 before') : $t('Add %1 after'))
                .replace('%1', (contentType.config.label || name).toLowerCase()),
            action: name === 'column' ?
                () => struct.addColumn(newColumn(), contentType, where === 'before') :
                () => add.create(name, target),
        };
    };

    Commands.prototype.toggleHidden = function (contentType) {
        var viewport = this.pageBuilder.viewport(),
            hidden = types.hidden(contentType, viewport),
            viewports;

        if (!types.option(contentType, 'hideShow')) {
            return;
        }

        if (!hidden || hidden === 'all') {
            contentType.preview.onOptionVisibilityToggle();
        }

        viewports = types.hiddenViewports(contentType);

        if (hidden && viewports.includes(viewport)) {
            contentType.dataStore.set('mls_hidden', viewports.filter(name => name !== viewport));
        }
    };

    Commands.prototype.duplicate = function (contentType) {
        if (types.option(contentType, 'duplicate')) {
            contentType.preview.onOptionDuplicate();
        }
    };

    Commands.prototype.remove = function (contentType) {
        if (types.option(contentType, 'remove')) {
            contentType.preview.onOptionRemove();
        }
    };

    Commands.prototype.copy = function (contentType) {
        clipboard.writeText(serializer.serialize(contentType))
            .then(() => toast.show($t('Copied!')))
            .catch(e => toast.error(e.message));
    };

    Commands.prototype.onKey = function (e, contentType) {
        var mod = e.metaKey || e.ctrlKey,
            key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

        if (key === 'Enter' && !mod) {
            this.edit(contentType);
        } else if ((key === 'Delete' || key === 'Backspace') && !mod) {
            this.remove(contentType);
        } else if (key === 'd' && mod && !e.shiftKey) {
            this.duplicate(contentType);
        } else {
            return false;
        }

        return true;
    };

    Commands.prototype.clipboard = function (e, contentType) {
        if (e.type !== 'copy') {
            return false;
        }

        this.copy(contentType);

        return true;
    };

    Commands.prototype.menu = function (contentType) {
        var addBefore = this.addAction(contentType, 'before'),
            addAfter = this.addAction(contentType),
            addInside = contentType.getChildren && this.addAction(contentType, 'inside');

        return [
            { id: 'edit', label: $t('Edit'), action: () => this.edit(contentType) },
            '-',
            {
                id: 'add-before',
                label: addBefore?.label || $t('Add before'),
                disabled: !addBefore,
                action: () => addBefore.action(),
            },
            {
                id: 'add-after',
                label: addAfter?.label || $t('Add after'),
                disabled: !addAfter,
                action: () => addAfter.action(),
            },
            ...contentType.getChildren ? [{
                id: 'add-inside',
                label: addInside?.label || $t('Add inside'),
                disabled: !addInside,
                action: () => addInside.action(),
            }] : [],
            '-',
            {
                id: 'duplicate',
                label: $t('Duplicate'),
                disabled: !types.option(contentType, 'duplicate'),
                action: () => this.duplicate(contentType),
            },
            { id: 'copy', label: $t('Copy'), action: () => this.copy(contentType) },
            {
                id: 'cut',
                label: $t('Cut'),
                pro: true,
                action: () => toast.show($t('Cut is available in Page Builder Pro')),
            },
            {
                id: 'paste',
                label: $t('Paste'),
                pro: true,
                action: () => toast.show($t('Paste is available in Page Builder Pro')),
            },
            '-',
            {
                id: 'hide',
                label: types.hidden(contentType, this.pageBuilder.viewport()) ? $t('Show') : $t('Hide'),
                disabled: !types.option(contentType, 'hideShow'),
                action: () => this.toggleHidden(contentType),
            },
            {
                id: 'delete',
                label: $t('Delete'),
                danger: true,
                disabled: !types.option(contentType, 'remove'),
                action: () => this.remove(contentType),
            },
        ];
    };

    return Commands;
});
