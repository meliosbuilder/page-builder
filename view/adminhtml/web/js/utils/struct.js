define([
    'mage/translate',
    'Magento_Ui/js/modal/alert',
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/content-type-factory',
    'Magento_PageBuilder/js/content-type/column/resize',
    'Magento_PageBuilder/js/drag-drop/move-content-type'
], function ($t, alert, Config, events, contentTypeFactory, resize, moveContentType) {
    'use strict';

    function allows(parentName, name) {
        return !!Config.getContentTypeConfig(name)?.allowed_parents?.includes(parentName);
    }

    function allowsWrapped(parent, name) {
        return parent.config.name === 'root-container' && allows('root-container', 'row') && allows('row', name);
    }

    async function place(name, parent, index) {
        var row;

        if (allows(parent.config.name, name)) {
            return { parent, index };
        }

        if (!allowsWrapped(parent, name)) {
            return null;
        }

        row = await contentTypeFactory(Config.getContentTypeConfig('row'), parent, parent.stageId);
        row.dropped = true;
        parent.addChild(row, index);

        return { parent: row, index: 0 };
    }

    async function build(data, parent, index) {
        var child = await contentTypeFactory(
            Config.getContentTypeConfig(data.config.name),
            parent,
            parent.stageId,
            data.states[Config.getConfig('defaultViewport')],
            data.children?.length || 0,
            data.states
        );

        child.parentContentType = parent;
        parent.addChild(child, index);

        for (var childData of (data.children || [])) {
            await build(childData, child);
        }

        return child;
    }

    return {
        accepts: function (parent, name) {
            return allows(parent.config.name, name) || allowsWrapped(parent, name);
        },

        /** @return {Promise<Object|null>} the new element, null when the parent doesn't accept it */
        create: async function (name, parent, index) {
            var target = await place(name, parent, index),
                child;

            if (!target) {
                return null;
            }

            child = await contentTypeFactory(Config.getContentTypeConfig(name), target.parent, target.parent.stageId);
            child.dropped = true;
            target.parent.addChild(child, target.index);
            events.trigger('contentType:dropAfter', { id: child.id, contentType: child });
            events.trigger(name + ':dropAfter', { id: child.id, contentType: child });

            return child;
        },

        /** @return {Promise<Object|null>} the new element, null when the parent doesn't accept it */
        paste: async function (data, parent, index) {
            var target = await place(data.config.name, parent, index);

            return target ? build(data, target.parent, target.index) : null;
        },

        /** @return {Promise<Boolean>} false when the parent doesn't accept it or nothing moves */
        move: async function (contentType, parent, index) {
            var current = parent.getChildren()().indexOf(contentType),
                target;

            if (!allows(parent.config.name, contentType.config.name)) {
                target = await place(contentType.config.name, parent, index);

                if (!target) {
                    return false;
                }

                moveContentType.moveContentType(contentType, target.index, target.parent);
                return true;
            }

            // Taken out first: a later position in its own parent moves up by one
            if (current !== -1 && index > current) {
                index--;
            }

            if (current === index) {
                return false;
            }

            moveContentType.moveContentType(contentType, index, parent);

            // As after sorting tab titles on the stage: tabs refresh their widget, which keeps the old order
            // otherwise, and update the default active tab. The slider's handler needs the sortable's item
            if (current !== -1 && parent.config.name === 'tabs') {
                events.trigger('childContentType:sortUpdate', {
                    instance: parent,
                    newPosition: index,
                    originalPosition: current,
                });
            }

            return true;
        },

        /** @return {Promise<Object|null>} the new column, null when there's no room */
        addColumn: async function (data, column, before = false) {
            var edge = list => list.at(before ? 0 : -1),
                parent, index, utils, width, smallest, shrinkable, splitTimes, newColumn;

            if (column.config.name === 'column-group') {
                column = edge(column.children());

                // Column lines inside the group, old Magento has columns directly
                if (column?.config.name === 'column-line') {
                    column = edge(column.children());
                }
            }

            if (!column) {
                return null;
            }

            parent = column.parentContentType;
            index = parent.children().indexOf(column) + (before ? 0 : 1);
            utils = parent.preview.getResizeUtils();
            width = utils.getColumnWidth(column);
            smallest = utils.getSmallestColumnWidth();

            if ((shrinkable = utils.findBiggerShrinkableColumn(column))) {
                newColumn = await build(data, parent, index);
                resize.updateColumnWidth(shrinkable, utils.getAcceptedColumnWidth(utils.getColumnWidth(shrinkable) - width));
                resize.updateColumnWidth(newColumn, width);

                return newColumn;
            }

            splitTimes = Math.round(width / smallest);

            if (splitTimes > 1) {
                newColumn = await build(data, parent, index);
                resize.updateColumnWidth(column, utils.getAcceptedColumnWidth((Math.ceil(splitTimes / 2) * smallest).toString()));
                resize.updateColumnWidth(newColumn, utils.getAcceptedColumnWidth((Math.floor(splitTimes / 2) * smallest).toString()));

                return newColumn;
            }

            if ((shrinkable = utils.findShrinkableColumn(column))) {
                newColumn = await build(data, parent, index);
                resize.updateColumnWidth(shrinkable, utils.getAcceptedColumnWidth((utils.getColumnWidth(shrinkable) - smallest).toString()));
                resize.updateColumnWidth(newColumn, smallest);

                return newColumn;
            }

            alert({
                content: $t('There is no free space within the column group to perform this action.'),
                title: $t('Unable to duplicate column')
            });

            return null;
        },
    };
});
