define([
    'jquery',
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/drag-drop/registry',
    'Melios_PageBuilder/js/utils/struct',
    'Melios_PageBuilder/js/spotlight/presets'
], function ($, wrapper, registry, struct, presets) {
    'use strict';

    return function (target) {
        target.getSortableOptions = wrapper.wrap(target.getSortableOptions, (getSortableOptions, preview) => {
            var options = getSortableOptions(preview);

            options.receive = wrapper.wrap(options.receive, function (o, event) {
                var config = registry.getDraggedContentTypeConfig(),
                    sortable = $(this),
                    preset,
                    index;

                if (!config ||
                    event.target !== this ||
                    !preview.isContainer() ||
                    sortable.sortable('option', 'disabled') ||
                    sortable.parents('.pagebuilder-content-type-hidden').length ||
                    !(preset = presets.take(config.name))
                ) {
                    return o();
                }

                registry.setDraggedContentTypeConfig(null);

                index = sortable.children('.pagebuilder-content-type-wrapper, .pagebuilder-draggable-content-type')
                    .toArray()
                    .findIndex(el => el.classList.contains('pagebuilder-draggable-content-type'));

                sortable.find('.pagebuilder-draggable-content-type').remove();
                struct.create(config.name, preview.contentType, index, preset);
            });

            return options;
        });

        return target;
    };
});
