define([
    'jquery',
    'underscore',
    'knockout'
], function ($, _, ko) {
    'use strict';

    function topModal() {
        return $('.modals-wrapper > ._show')
            .sort((a, b) => b.style.zIndex - a.style.zIndex)
            .first()
            .filter((i, el) => el.classList.contains('pagebuilder_modal_form_pagebuilder_modal_form_modal'));
    }

    return {
        getTopModal: topModal,
        updateSource: _.throttle(source => {
            var topSource = ko.dataFor(topModal().find('[name="appearance"]')[0])?.source;

            if (topSource?.name === source?.name) {
                source?.save?.();
            }
        }, 80),
    }
});
