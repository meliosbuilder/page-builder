define([
    'jquery',
    'ko',
    'mage/utils/wrapper'
], function ($, ko, wrapper) {
    'use strict';

    $(document).on('click', '.spotlight-show', e => {
        ko.dataFor($(e.target).closest('.pagebuilder-stage-wrapper')[0])
            ?.spotlight
            ?.spotlight('open');
    });

    function addButtons(pagebuilder) {
        var panel = $(pagebuilder.panel.element).parent().find('.pagebuilder-header');

        if (!panel.length || panel.find('.spotlight-buttons').length) {
            return;
        }

        panel.prepend(`
            <span class="spotlight-buttons">
                <span class="spotlight-faux-input spotlight-show">
                    Add content
                    <span class="hotkey">/</span>
                </span>
            </span>
        `);
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
                    }, 100);
                });

                return this._super();
            }
        );

        return target;
    };
});
