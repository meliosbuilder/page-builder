define([
    'jquery',
    'Magento_Ui/js/form/components/group'
], function ($, Component) {
    'use strict';

    return Component.extend({
        defaults: {
            breakLine: false,
        },

        initialize: function () {
            this._super();

            console.log('hello');

            return this;
        }
    })
});
