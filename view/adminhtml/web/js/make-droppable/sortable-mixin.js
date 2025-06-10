define([
    'jquery',
    'knockout',
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/drag-drop/registry',
    'Magento_PageBuilder/js/drag-drop/move-content-type',
    'Magento_PageBuilder/js/content-type-factory'
], function ($, ko, wrapper, events, config, registry, moveContentType, contentTypeFactory) {
    'use strict';

    return function (target) {
        target.getSortableOptions = wrapper.wrap(target.getSortableOptions, (getSortableOptions, preview) => {
            var options = getSortableOptions(preview);

            options.receive = wrapper.wrap(options.receive, async (o, ...args) => {
                var draggedNewContentConfig = registry.getDraggedContentTypeConfig(),
                    draggedExistingContent = draggedNewContentConfig ? false : ko.dataFor(args[1].item[0]),
                    parents = (draggedNewContentConfig || draggedExistingContent.config).allowed_parents,
                    event = args[0];

                if (parents.includes(preview.config.name) || !parents.includes('row')) {
                    return o(...args);
                }

                // Insert RowContentType, then drop draggable into newly inserted row
                var index = $(event.target).children('.pagebuilder-content-type-wrapper, .pagebuilder-draggable-content-type').toArray().findIndex(el => {
                    return $(el).hasClass('pagebuilder-draggable-content-type');
                });

                if (index === -1) {
                    index = $(event.target).children('.pagebuilder-content-type-wrapper, .pagebuilder-draggable-content-type').toArray().findIndex(el => {
                        return $(el).hasClass('pagebuilder-sorting-original');
                    });
                }

                var row = await contentTypeFactory(
                    config.getConfig('content_types').row,
                    preview.contentType,
                    preview.contentType.stageId
                );

                row.dropped = true;
                preview.contentType.addChild(row, index);

                if (draggedNewContentConfig) {
                    registry.setDraggedContentTypeConfig(draggedNewContentConfig);

                    event.target = $('.content-type-container', row.preview.element)
                        .sortable()
                        .get(0);

                    getSortableOptions(row.preview).receive.apply(event.target, args);
                } else if (draggedExistingContent) {
                    moveContentType.moveContentType(draggedExistingContent, 0, row);
                }
            });

            return options;
        });

        return target;
    };
});
