define([
    'jquery'
], function ($) {
    'use strict';

    return function (el, options) {
        var rect = el.getBoundingClientRect(),
            minY = 0 + (options?.rootMargin?.top || 0),
            minX = 0 + (options?.rootMargin?.left || 0),
            maxY = $(window).height() - (options?.rootMargin?.bottom || 0),
            maxX = $(window).width() - (options?.rootMargin?.right || 0);

        switch (options?.sideToCheck) {
            case 'top':
                return rect.top >= minY && rect.top <= maxY;
            case 'right':
                return rect.right >= minX && rect.right <= maxX;
            case 'bottom':
                return rect.bottom >= minY && rect.bottom <= maxY;
            case 'left':
                return rect.left >= minX && rect.left <= maxX;
        }

        return (
            rect.top >= minY &&
            rect.left >= minX &&
            rect.bottom <= maxY &&
            rect.right <= maxX
        );
    }
});
