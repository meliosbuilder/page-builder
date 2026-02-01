define([
    'mage/utils/wrapper'
], function (wrapper) {
    'use strict';

    return function (target) {
        target.prototype.getStyle = wrapper.wrap(
            target.prototype.getStyle,
            function (o, el, props) {
                if (props.includes('alignSelf')) {
                    props.push('order');
                }
                return o(el, props);
            }
        );
        return target;
    };
});
