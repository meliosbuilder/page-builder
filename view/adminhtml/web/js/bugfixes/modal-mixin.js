define([
    'jquery',
    'mage/utils/wrapper'
], function ($, wrapper) {
    'use strict';

    return function (Modal) {
        Modal.prototype.keyEventSwitcher = wrapper.wrap(
            Modal.prototype.keyEventSwitcher,
            function (o, e) {
                if (e.code === 'Escape' && $('.pagebuilder-stage-wrapper.stage-full-screen').length) {
                    return;
                }
                o(e);
            }
        );
    };
});
