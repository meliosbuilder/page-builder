define([
    'mage/utils/wrapper'
], function (wrapper) {
    'use strict';

    return function (target) {
        target.getContainersFor = wrapper.wrap(target.getContainersFor, (o, contentType) => {
            var containers = o(contentType);

            if (containers.includes('row') && !containers.includes('root-container')) {
                containers.push('root-container');
            }

            return containers;
        });

        target.getAllowedContainersClasses = wrapper.wrap(
            target.getAllowedContainersClasses,
            (o, contentType, stageId) => {
                var classes = o(contentType, stageId);

                if (target.getContainersFor(contentType).includes('root-container')) {
                    classes += `, #${stageId} .content-type-container.root-container-container`
                }

                return classes;
            }
        );

        return target;
    };
});
