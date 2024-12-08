define([
    'jquery'
], function ($) {
    'use strict';

    return function (event) {
        if (event.target.isContentEditable ||
            ($(event.target).is('input, select, textarea') && $(event.target).css('clip') === 'auto')
        ) {
            return false;
        }
        return true;
    }
});
