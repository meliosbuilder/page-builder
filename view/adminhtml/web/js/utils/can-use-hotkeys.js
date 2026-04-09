define([
    'jquery'
], function ($) {
    'use strict';

    return function (event, allowedInputs) {
        if (event.target.isContentEditable &&
            document.activeElement === event.target ||
            document.activeElement?.isContentEditable
        ) {
            return false;
        }

        var modal = $(event.target).closest('[data-role="modal"]');
        if (modal.length && !modal.hasClass('_show')) {
            return true;
        }

        if ($(event.target).is('input, select, textarea') && $(event.target).css('clip') === 'auto') {
            if (!allowedInputs || allowedInputs && !$(event.target).is(allowedInputs)) {
                if (document.activeElement === event.target) {
                    return false
                }
            }
        }

        return true;
    }
});
