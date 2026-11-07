define([
    'underscore',
    'mage/translate',
    'Magento_Ui/js/modal/alert',
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/content-type-factory',
    'Magento_PageBuilder/js/content-type/column/resize',
    'Magento_PageBuilder/js/drag-drop/move-content-type'
], function (_, $t, alert, Config, events, contentTypeFactory, resize, moveContentType) {
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

    // padding: 30 is all the sides, { top: 15 } only that one
    function box(value) {
        return Object.fromEntries(['top', 'right', 'bottom', 'left'].map(side => {
            return [side, String((_.isObject(value) ? value[side] : value) ?? '')];
        }));
    }

    function shorthands(data) {
        var { margin, padding, ...rest } = data;

        if (margin !== undefined || padding !== undefined) {
            rest.margins_and_padding = { margin: box(margin), padding: box(padding) };
        }

        return rest;
    }

    // Preset field values by viewport: data, and dataMobile (data + the viewport name) for the others. Either a function
    function states(element) {
        var main = Config.getConfig('defaultViewport'),
            result = { [main]: shorthands(_.result(element, 'data') || {}) };

        _.each(Config.getConfig('viewports'), (viewport, name) => {
            var data = name !== main && _.result(element, 'data' + name[0].toUpperCase() + name.slice(1));

            if (data) {
                result[name] = shorthands(data);
            }
        });

        return result;
    }

    // Preset elements are {name, data, dataMobile, children}, copied ones {config: {name}, states, children}
    function tree(element) {
        return element.config ? element : {
            config: { name: element.name },
            states: states(element),
            children: (element.children || []).map(tree),
        };
    }

    function copy(data) {
        return JSON.parse(JSON.stringify(data));
    }

    return {
        /** @param {Boolean} [wrapped] Also into a new row added for it */
        accepts: function (parent, name, wrapped = true) {
            return allows(parent.config.name, name) || wrapped && allowsWrapped(parent, name);
        },

        /**
         * @param {Object} [preset] Spotlight preset (spotlight/presets): its data, and its children instead of the default ones.
         *                          Passed on in dropAfter events
         * @return {Promise<Object|null>} the new element, null when the parent doesn't accept it
         */
        create: async function (name, parent, index, preset) {
            var target = await place(name, parent, index),
                children = _.result(preset, 'children'),
                data,
                child;

            if (!target) {
                return null;
            }

            // Built as pasted: its own dropAfter would add the default children (column group: a column line)
            if (children) {
                child = await build(copy(tree({ ...preset, name, children })), target.parent, target.index);
                child.dropped = true;
                events.trigger('contentType:dropAfter', { id: child.id, contentType: child, preset });

                return child;
            }

            data = copy(states(preset));
            child = await contentTypeFactory(
                Config.getContentTypeConfig(name),
                target.parent,
                target.parent.stageId,
                data[Config.getConfig('defaultViewport')],
                0,
                data
            );
            child.dropped = true;
            target.parent.addChild(child, target.index);
            events.trigger('contentType:dropAfter', { id: child.id, contentType: child, preset });
            events.trigger(name + ':dropAfter', { id: child.id, contentType: child, preset });

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
                parent, index, utils, width, smallest, columns, count, shrinkable, splitTimes, newColumn;

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
            columns = parent.children();
            count = columns.length + 1;

            // Equal columns that fill the line stay equal: two halves become three thirds (as equal-columns/duplicate-mixin).
            // Not counts the grid can't divide (5 on a 12 grid)
            if (utils.getColumnsWidth() === 100
                && !((utils.getInitialGridSize() || utils.getGridSize()) % count)
                && columns.every(child => utils.getColumnWidth(child) === width)
            ) {
                newColumn = await build(data, parent, index);
                width = utils.getAcceptedColumnWidth((100 / count).toString());

                if (newColumn) {
                    parent.children().forEach(child => resize.updateColumnWidth(child, width));
                }

                return newColumn;
            }

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
