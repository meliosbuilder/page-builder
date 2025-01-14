define([
    'Magento_Ui/js/lib/view/utils/async'
], function ($) {
    'use strict';

    var revealObserver = new IntersectionObserver(entries => {
        var nodes = entries
            .filter(entry => entry.isIntersecting)
            .map(entry => entry.target);

        nodes.forEach(el => {
            el.classList.add('mls-load');
            revealObserver.unobserve(el);
        });
    });

    $.async('[data-mls-loading="lazy"], [data-mls-sm-loading="lazy"]', el => {
        revealObserver.observe(el)
    });
});
