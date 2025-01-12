define([
    'Magento_Ui/js/lib/view/utils/async'
], function ($) {
    'use strict';

    function onReveal(element, callback, options = {}) {
        var revealObserver = new IntersectionObserver(entries => {
            var nodes = entries
                .filter(entry => entry.isIntersecting)
                .map(entry => entry.target);

            if (nodes.length) {
                callback($(nodes));
                nodes.forEach(el => revealObserver.unobserve(el));
            }
        }, options);

        $(element).each((i, el) => revealObserver.observe(el));

        return revealObserver;
    };

    $.async('[data-mls-loading="lazy"], [data-mls-sm-loading="lazy"]', el => {
        onReveal(el, revealed => revealed.addClass('mls-load'));
    });
});
