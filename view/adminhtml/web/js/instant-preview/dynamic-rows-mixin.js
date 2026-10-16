define([
    'Melios_PageBuilder/js/instant-preview/top-modal-utils'
], function (utils) {
    'use strict';

    return function (target) {
        return target.extend({
            _updateCollection: function () {
                var result = this._super();

                // Destroying removes records one by one: the closed form would save its stale rows
                if (this.name.startsWith('pagebuilder_') && !this.mlsDestroying) {
                    utils.updateSource(this.source);
                }

                return result;
            },

            deleteRecord: function () {
                var result = this._super.apply(this, arguments);

                if (this.name.startsWith('pagebuilder_')) {
                    utils.updateSource(this.source);
                }

                return result;
            },

            destroy: function () {
                this.mlsDestroying = true;

                return this._super.apply(this, arguments);
            }
        });
    };
});
