define([
    'Magento_PageBuilder/js/events',
    'Melios_PageBuilder/js/utils/struct',
    'Melios_PageBuilder/js/utils/open-edit'
], function (events, struct, openEdit) {
    'use strict';

    function items(pageBuilder, parent) {
        var all = pageBuilder.spotlight?.spotlight('option', 'items');

        if (!Array.isArray(all)) {
            return [];
        }

        return parent ? all.filter(item => struct.accepts(parent, item.name || item.id)) : all;
    }

    /**
     * Target next to the element ('before', 'after') or at the end inside it ('inside')
     *
     * @return {{parent, index}|null} null when there's no parent or it can't have children
     */
    function target(contentType, where) {
        var inside = where === 'inside',
            parent = inside ? contentType : contentType?.parentContentType,
            children = parent?.getChildren?.()();

        return children ? {
            parent,
            index: inside ? children.length : children.indexOf(contentType) + (where === 'after' ? 1 : 0),
        } : null;
    }

    // Its form opens, unless it opened it itself on drop (AI Composer). Preset: spotlight/presets
    async function create(name, target, preset) {
        var contentType = await struct.create(name, target.parent, target.index, preset);

        if (!contentType) {
            return null;
        }

        events.trigger('melios:add:after', { stageId: contentType.stageId, contentType });

        if (contentType.config.form && !openEdit.isEditing(contentType)) {
            openEdit.open(contentType);
        }

        return contentType;
    }

    /** @return {Object|null} null when nothing can be added there */
    function spotlightContext(pageBuilder, target) {
        var list = items(pageBuilder, target.parent);

        if (!list.length) {
            return null;
        }

        events.trigger('melios:add:open', { stageId: pageBuilder.id, target });

        return {
            items: list,
            onSelect: (id, event, item) => {
                event.preventDefault();
                create(item?.name || id, target, item?.preset);

                return true;
            },
            onClose: () => events.trigger('melios:add:close', { stageId: pageBuilder.id }),
        };
    }

    // @return {Boolean} false when nothing can be added there
    function openSpotlight(pageBuilder, target) {
        var found = spotlightContext(pageBuilder, target);

        if (found) {
            pageBuilder.spotlight.spotlight('open', found);
        }

        return !!found;
    }

    /**
     * Where an element is added without a chosen place (Spotlight's hotkey in Live, a click in the Elements panel):
     * after the edited element, or after its closest parent that accepts it, or at the end of the page.
     * name: that element only, otherwise any of the Spotlight list.
     *
     * @return {{parent, index}|null} null when the page doesn't accept it
     */
    function defaultTarget(pageBuilder, name) {
        var root = pageBuilder.stage.rootContainer,
            contentType = openEdit.currentEl(),
            parent = contentType?.stageId === pageBuilder.id ? contentType.parentContentType : null,
            accepts = container => name ? struct.accepts(container, name) : items(pageBuilder, container).length,
            target;

        // Removed meanwhile
        if (parent && !parent.getChildren()().includes(contentType)) {
            parent = null;
        }

        while (parent && parent !== root && !accepts(parent)) {
            contentType = parent;
            parent = contentType.parentContentType;
        }

        target = parent ?
            { parent, index: parent.getChildren()().indexOf(contentType) + 1 } :
            { parent: root, index: root.getChildren()().length };

        return accepts(target.parent) ? target : null;
    }

    return {
        items,
        target,
        create,
        spotlightContext,
        openSpotlight,
        defaultTarget,
    };
});
