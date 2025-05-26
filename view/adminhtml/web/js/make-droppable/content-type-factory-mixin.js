define([
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/events'
], function (wrapper, config, events) {
    'use strict';

    return function (target) {
        return wrapper.wrap(target, function (o, ...args) {
            var parentName = args[1]?.config.name;

            // Wrap droppable into RowContentType if parent is not allowed
            if (parentName &&
                !args[0].allowed_parents.includes(parentName) &&
                args[0].allowed_parents.includes('row')
            ) {
                var undroppableContentConfig = args[0];

                args[0] = config.getConfig('content_types').row;

                return o(...args).then(newParentContentType => {
                    setTimeout(() => {
                        args[0] = undroppableContentConfig;
                        args[1] = newParentContentType;
                        o(...args).then(newContent => {
                            newParentContentType.addChild(newContent, 0);

                            events.trigger('contentType:dropAfter', {
                                id: newContent.id,
                                contentType: newContent
                            });

                            events.trigger(undroppableContentConfig.name + ':dropAfter', {
                                id: newContent.id,
                                contentType: newContent
                            });
                        });
                    });

                    return newParentContentType;
                });
            }

            return o(...args);
        });
    };
});
