define([
    'jquery',
    'underscore',
    'knockout'
], function ($, _, ko) {
    'use strict';

    var allowUpdateModalSource = true;

    function topModal() {
        return $('.modals-wrapper > ._show')
            .sort((a, b) => b.style.zIndex - a.style.zIndex)
            .first()
            .filter((i, el) => el.classList.contains('pagebuilder_modal_form_pagebuilder_modal_form_modal'));
    }

    return {
        getTopModal: topModal,

        // Update preview on every change inside "Edit" modal
        updateSource: _.throttle(source => {
            var topSource = ko.dataFor(topModal().find('[name="appearance"]')[0])?.source;

            if (allowUpdateModalSource && topSource?.name === source?.name) {
                source?.save?.();
            }
        }, 80),

        updateModalData: _.throttle(data => {
            var modal = topModal(),
                topSource = ko.dataFor(modal.find('[name="appearance"]')[0])?.source;

            if (!topSource) {
                return;
            }

            setTimeout(() => allowUpdateModalSource = true, 100);
            _.each(data, (v, k) => {
                if (typeof v === 'string' && topSource.data[k] !== v) {
                    var el = ko.dataFor(modal.find(`[name="${k}"]`).closest('[data-bind]')[0]);

                    allowUpdateModalSource = false;
                    topSource.set(`data.${k}`, v);

                    if (el.wysiwygId &&
                        tinyMCE.get(el.wysiwygId) &&
                        tinyMCE.get(el.wysiwygId).getContent() !== v
                    ) {
                        tinyMCE.get(el.wysiwygId).setContent(v);
                    }
                }
            });
        }, 80),
    }
});
