define([
    'jquery',
    'underscore',
    'jquery-ui-modules/resizable'
], function ($, _) {
    'use strict';

    return function (cm) {
        $(cm.getWrapperElement()).resizable({
            handles: 's',
            resize: _.debounce(() => cm.refresh(), 100),
            zIndex: 900
        });
    };
});
