define([
    'Melios_PageBuilder/js/instant-preview/top-modal-utils'
], function (utils) {
    'use strict';

    return function (target) {
        return target.extend({
            onUpdate: function () {
                var result = this._super();

                if (this.name.startsWith('pagebuilder_')) {
                    utils.updateSource(this.source);
                }

                return result;
            }
        });
    };
});
