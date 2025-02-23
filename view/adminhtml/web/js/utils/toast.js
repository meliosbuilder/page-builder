define([
    'underscore',
    'text!Melios_PageBuilder/js/lib/toastify.css',
    'Melios_PageBuilder/js/lib/toastify'
], function (_, css) {
    'use strict';

    var defaults = {
        gravity: 'bottom',
        offset: {
            x: 20,
            y: 10,
        },
        style: {
            background: '#373330',
        },
    };

    document.head.appendChild(document.createElement('style')).innerHTML = css;

    function delayedToast(params, delay) {
        var toast,
            timerId = setTimeout(() => {
                toast = show(params);
            }, delay);

        return {
            hideToast: function () {
                clearTimeout(timerId);
                toast?.hideToast();
            }
        }
    }

    function show(params) {
        params = typeof params === 'object' ? params : {
            text: params,
        };

        var toast = Toastify(_.extend({}, defaults, {
            onClick: function () {
                if (toast) {
                    toast.hideToast();
                }
            },
        }, params)).showToast();

        return toast;
    }

    function showLater(params, delay = 150) {
        return new delayedToast(params, delay);
    }

    return {
        show: show,
        showLater: showLater
    }
});
