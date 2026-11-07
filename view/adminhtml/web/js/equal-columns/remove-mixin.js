define([
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/content-type/column/resize'
], function (wrapper, events, resize) {
    'use strict';

    // Removed children by their parent, in order: core defers spreadWidth after each removal and doesn't pass the child
    var removed = new WeakMap();

    events.on('contentType:removeAfter', (args) => {
        var parent = args.parentContentType;

        if (parent && parent.preview && parent.preview.spreadWidth) {
            removed.set(parent, (removed.get(parent) || []).concat(args.contentType));
        }
    });

    /**
     * Removing one of equal columns that filled the line keeps the rest equal: three thirds become two halves.
     * Core gives the free space to a neighbour instead.
     * Unequal columns, lines with free space and counts the grid can't divide (5 on a 12 grid) keep core logic.
     * Applied to the column line and to the column group (old Magento keeps columns right in the group).
     */
    return function (target) {
        target.prototype.spreadWidth = wrapper.wrap(target.prototype.spreadWidth, function (original, removedIndex) {
            var column = (removed.get(this.contentType) || []).shift(),
                columns = this.contentType.children(),
                utils = this.resizeUtils,
                width;

            if (!column || column.config.name !== 'column' || !columns.length) {
                return original(removedIndex);
            }

            width = utils.getColumnWidth(column);

            if (utils.getAcceptedColumnWidth((utils.getColumnsWidth() + width).toString()) !== 100
                || (utils.getInitialGridSize() || utils.getGridSize()) % columns.length
                || columns.some((child) => utils.getColumnWidth(child) !== width)
            ) {
                return original(removedIndex);
            }

            width = utils.getAcceptedColumnWidth((100 / columns.length).toString());
            columns.forEach((child) => resize.updateColumnWidth(child, width));
        });

        return target;
    };
});
