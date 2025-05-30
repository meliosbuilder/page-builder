define([
    'jquery',
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/events',
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/drag-drop/registry'
], function ($, wrapper, events, config, registry) {
    'use strict';

    return function (target) {
        target.getSortableOptions = wrapper.wrap(target.getSortableOptions, (getSortableOptions, preview) => {
            var options = getSortableOptions(preview);

            options.receive = wrapper.wrap(options.receive, (o, ...args) => {
                var contentConfig = registry.getDraggedContentTypeConfig(),
                    parents = contentConfig.allowed_parents,
                    event = args[0];

                // Insert RowContentType, then drop draggable into newly inserted row
                if (!parents.includes(preview.config.name) && parents.includes('row')) {
                    // this will drop currently dragged element
                    events.on('contentType:dropAfter', data => {
                        events.off('meliosWrapDroppable');
                        registry.setDraggedContentTypeConfig(contentConfig);

                        event.target = $(data.contentType.preview.element)
                            .find('.content-type-container')
                            .sortable()
                            .get(0);

                        getSortableOptions(data.contentType.preview)
                            .receive.bind(event.target)(...args);
                    }, 'meliosWrapDroppable');

                    // drop row instead of draggable element
                    registry.setDraggedContentTypeConfig(config.getConfig('content_types').row);
                }

                return o(...args);
            });

            return options;
        });

        return target;
    };
});
