define([
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/content-type/preview-collection',
    'Magento_PageBuilder/js/content-type/column/resize'
], function (wrapper, PreviewCollection, resize) {
    'use strict';

    /**
     * Duplicating one of equal columns that fill the line keeps them equal: two halves become three thirds.
     * Core shrinks the biggest column or splits the duplicated one instead.
     * Unequal columns, lines with free space and counts the grid can't divide (5 on a 12 grid) keep core logic.
     */
    return function (target) {
        target.prototype.clone = wrapper.wrap(target.prototype.clone, function (original, contentType, autoAppend, direct) {
            var line = this.contentType.parentContentType,
                columns = line.children(),
                utils,
                count,
                width;

            if (contentType.config.name !== 'column' || !columns.length) {
                return original(contentType, autoAppend, direct);
            }

            utils = line.preview.getResizeUtils();
            count = columns.length + 1;
            width = utils.getColumnWidth(columns[0]);

            if (utils.getColumnsWidth() < 100
                || (utils.getInitialGridSize() || utils.getGridSize()) % count
                || columns.some((column) => utils.getColumnWidth(column) !== width)
            ) {
                return original(contentType, autoAppend, direct);
            }

            width = utils.getAcceptedColumnWidth((100 / count).toString());

            return PreviewCollection.prototype.clone.call(this, contentType, autoAppend, direct).then((duplicate) => {
                line.children().forEach((column) => resize.updateColumnWidth(column, width));

                return duplicate;
            });
        });

        return target;
    };
});
