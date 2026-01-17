define([
    'jquery'
], function ($) {
    'use strict';

    var state = {};

    return {
        enter(modalEl) {
            modalEl.closest('.modal-slide').css({
                left: 0,
                right: 0,
                width: 'auto',
            });

            state.scrollTop = modalEl.closest('.modal-inner-wrap')
                .css('overflow', 'hidden')
                .prop('scrollTop');

            modalEl.closest('.modal-inner-wrap').prop('scrollTop', 0);
        },

        exit(modalEl) {
            modalEl.closest('.modal-slide').css({
                left: '',
                right: '',
                width: '',
            });

            modalEl.closest('.modal-inner-wrap')
                .css('overflow', '')
                .prop('scrollTop', state.scrollTop || 0);
        }
    }
});
