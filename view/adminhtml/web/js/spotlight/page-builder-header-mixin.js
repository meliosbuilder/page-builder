define([
    'jquery',
    'ko',
    'mage/utils/wrapper',
    'Melios_PageBuilder/js/utils/storage'
], function ($, ko, wrapper, storage) {
    'use strict';

    $(document).on('click', '.spotlight-show', e => {
        ko.dataFor($(e.target).closest('.pagebuilder-stage-wrapper')[0])
            ?.spotlight
            ?.spotlight('open');
    });

    $(document).on('click', '.panel-hide', e => {
        ko.dataFor($(e.target).closest('.pagebuilder-stage-wrapper')[0]).toggleSidebar();
    });

    function addButtons(pagebuilder) {
        var panel = $(pagebuilder.panel.element).parent().find('.pagebuilder-header');

        if (!panel.length || panel.find('.spotlight-buttons').length) {
            return;
        }

        panel.prepend(`
            <span class="spotlight-buttons">
                <span class="panel-hide">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sidebar"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                </span>
                <span class="spotlight-faux-input spotlight-show">
                    Add content
                    <span class="hotkey">/</span>
                </span>
            </span>
        `);
    }

    function getSidebarState() {
        if (storage.isSet('spotlight.sidebar')) {
            return +storage.get('spotlight.sidebar');
        }

        var state = +localStorage.getItem('melios-spotlight-sidebar');

        storage.set('spotlight.sidebar', state);
        localStorage.removeItem('melios-spotlight-sidebar');

        return state;
    }

    function syncSidebarState(pagebuilder) {
        if (!getSidebarState()) {
            pagebuilder.hideSidebar();
        } else {
            pagebuilder.showSidebar();
        }
    }

    return function (target) {
        target.prototype.initListeners = wrapper.wrapSuper(
            target.prototype.initListeners,
            function () {
                this.isSnapshot.subscribe(flag => {
                    if (flag) {
                        return;
                    }

                    setTimeout(() => {
                        addButtons(this);
                        syncSidebarState(this);
                    }, 100);
                });

                return this._super();
            }
        );

        target.prototype.toggleSidebar = function () {
            if (!getSidebarState()) {
                this.showSidebar();
            } else {
                this.hideSidebar();
            }
        };

        target.prototype.hideSidebar = function () {
            $(this.panel.element).parent('.pagebuilder-stage-wrapper').addClass('hidden-sidebar');
            storage.set('spotlight.sidebar', 0);
        };

        target.prototype.showSidebar = function () {
            $(this.panel.element).parent('.pagebuilder-stage-wrapper').removeClass('hidden-sidebar');
            storage.set('spotlight.sidebar', 1);
        };

        return target;
    };
});
