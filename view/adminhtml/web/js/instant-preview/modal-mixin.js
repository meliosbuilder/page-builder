define([
    'jquery',
    'knockout',
    'Melios_PageBuilder/js/instant-preview/top-modal-utils',
    'Melios_PageBuilder/js/utils/storage',
    'jquery-ui-modules/resizable'
], function ($, ko, utils, storage) {
    'use strict';

    // Close modal when pressing "Save"
    // We need our own listener because original is disabled in "startListen" below.
    $(document).on('click', '#save', (e) => {
        if (!$(e.currentTarget).closest('.pagebuilder_modal_form_pagebuilder_modal_form_modal').length) {
            return;
        }

        var button = $(e.currentTarget).closest('.modal-header').find('#close');

        setTimeout(() => button.click(), 20);
    });

    // Update source when nested modal is closed
    $(document).on('modalclosed', () => {
        var el = utils.getTopModal().find('[name="appearance"]')[0];

        if (el) {
            ko.dataFor(el)?.onUpdate?.();
        }
    });

    // restore panel width from the storage
    if (storage.isSet('layout.slideout-width')) {
        $(':root').css('--mls-slideout-width', storage.get('layout.slideout-width'));
    }

    function updateContainerSize(container, width) {
        var size = 'sm';

        width = parseFloat(width);

        if (width > 600) {
            size = 'lg'
        } else if (width > 430) {
            size = 'md';
        }

        container.attr('data-mls-size', size);
    }

    return function (target) {
        return target.extend({
            initToolbarSection: function () {
                this._super();

                var slideout = $(this.get('toolbarSection'))
                    .closest('.pagebuilder_modal_form_pagebuilder_modal_form_modal');

                updateContainerSize(slideout, $(':root').css('--mls-slideout-width'));

                slideout.css('position', slideout.css('position')).resizable({
                    autoHide: true,
                    minWidth: 330,
                    maxWidth: 800,
                    handles: 'w',
                    ghost: true,
                    resize: function (event, ui) {
                        $(':root').css('--mls-slideout-width', ui.size.width + 'px');
                        updateContainerSize(slideout, ui.size.width);
                    },
                    start: function() {
                        // hide body content when making panel smaller
                        $('<div class="melios-overlay">').css({
                            position: 'fixed',
                            inset: 0,
                            background: '#fff',
                            zIndex: 550
                        }).appendTo('body');
                    },
                    stop: function (event, ui) {
                        storage.set('layout.slideout-width', ui.size.width + 'px');
                        ui.element.css({
                            width: '',
                            height: '',
                            left: '',
                        });
                        $('.melios-overlay').remove();
                        $(window).trigger('orientationchange'); // trigger slick slider update
                    }
                });

                $(this.get('toolbarSection')).prepend(`
                    <div class="melios-toolbar page-main-actions">
                        <div class="page-actions floating-header">
                            <button title="Expand" type="button" class="action- scalable expand" data-form-role="expand">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-expand-icon lucide-expand"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M21 16v5h-5"/><path d="M21 8V3h-5"/><path d="M3 16v5h5"/><path d="m3 21 6-6"/><path d="M3 8V3h5"/><path d="M9 9 3 3"/></svg>
                            </button>
                            <button title="Reset" type="button" class="action- scalable reset" data-form-role="reset">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                <span>Reset</span>
                            </button>
                            <button title="Close" type="button" class="action- scalable close" data-form-role="close">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                    </div>
                `);

                $('.melios-toolbar').on('click', 'button', (e) => {
                    switch ($(e.currentTarget).data('form-role')) {
                        case 'reset':
                            var el = $(this.get('toolbarSection'))
                                .closest('.pagebuilder_modal_form_pagebuilder_modal_form_modal')
                                .find('.fieldset-wrapper');

                            ko.dataFor(el[0]).source.trigger?.('data.reset');
                            break;
                        case 'close':
                            this.closeModal();
                            break;
                        case 'expand':
                            $('body').removeClass('melios-instant-preview');
                            $(e.currentTarget)
                                .closest('.modal-inner-wrap')
                                .one('modalclosed', () => {
                                    $('body').addClass('melios-instant-preview');
                                });
                            break;
                    }
                });
            },

            startListen: function () {
                // do not close modal on 'form:' + id + ':saveAfter'
            },

            openModal: function () {
                setTimeout(() => $(window).trigger('orientationchange'), 500); // trigger slick slider update
                return this._super();
            },

            closeModal: function () {
                setTimeout(() => $(window).trigger('orientationchange'), 100); // trigger slick slider update
                return this._super();
            }
        });
    };
});
