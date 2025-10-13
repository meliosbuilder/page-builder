define([
    'mage/utils/wrapper'
], function (wrapper) {
    'use strict';

    return function (ko) {
        ko.utils.toggleDomNodeCssClass = wrapper.wrap(
            ko.utils.toggleDomNodeCssClass,
            function (o, node, classNames, shouldHaveClass) {
                if (shouldHaveClass &&
                    typeof classNames === 'string' &&
                    classNames.includes(' ')
                ) {
                    console.log(classNames);
                    return node.setAttribute('class', classNames.trim());
                }
                return o(node, classNames, shouldHaveClass);
            }
        );

        return ko;
    };
});
