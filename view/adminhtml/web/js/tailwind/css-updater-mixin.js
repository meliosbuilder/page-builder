define([
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/utils/object'
], function (wrapper, object) {
    'use strict';

    return function (fn) {
        return wrapper.wrap(fn, function (o, elementName, config, data, converterResolver, converterPool, previousData) {
            var css = object.get(data, config.css.var);

            if (typeof css === 'string') {
                return css;
            }

            return o(elementName, config, data, converterResolver, converterPool, previousData)
        });
    };
});
