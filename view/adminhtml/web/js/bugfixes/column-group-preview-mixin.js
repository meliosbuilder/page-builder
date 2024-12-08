define([
    'jquery',
    'Magento_PageBuilder/js/events'
], function ($, events) {
    'use strict';

    // Fixed incorrectly added 'no-column-line' class when pagebuilder is slowly rendered
    // See web/js/content-type/column-group/preview.js#103
    events.on('column-group:renderAfter', function (data) {
        // wait until column line will be rendered
        setTimeout(() => {
            if (!data.contentType.preview.hasColumnLine(data.contentType)) {
                $(data.element).addClass('no-column-line');
            } else {
                $(data.element).removeClass('no-column-line');
                $(data.element).addClass('with-column-line');
            }
        }, 800);
    });

    return function (target) {
        return target;
    };
});
