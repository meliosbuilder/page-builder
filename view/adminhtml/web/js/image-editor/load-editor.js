define([
    'jquery',
    'uiRegistry'
], function ($, registry) {
    'use strict';

    var promise;

    /**
     * @returns {Promise} resolves with the meliosImageEditor component
     */
    return function () {
        if (promise) {
            return promise;
        }

        promise = new Promise(resolve => {
            require([
                'Magento_Ui/js/core/app',
                'Magento_Ui/js/modal/modal'
            ], app => {
                var element = $('.melios-image-editor-modal'),
                    config = element.data('config');

                element.modal($.extend(config.modal, {
                    keyEventHandlers: {
                        escapeKey: () => {}
                    }
                }));

                app({ components: config.components });

                registry.get(['meliosImageEditor', 'meliosImageEditorActions'], resolve);
            });
        });

        return promise;
    };
});
