define([
    'mage/utils/wrapper'
], function (wrapper) {
    'use strict';

    return function (target) {
        target.prototype.initListeners = wrapper.wrapSuper(
            target.prototype.initListeners,
            function () {
                var loaded = this.snapshot && new Promise(resolve => require([
                    'Melios_PageBuilder/js/tree/panel'
                ], resolve));

                this.isSnapshot.subscribe(flag => {
                    if (flag || !loaded) {
                        return;
                    }

                    setTimeout(() => loaded.then(Panel => {
                        this.leftPanel = this.leftPanel || new Panel(this);
                        this.leftPanel.mount();
                    }), 100);
                });

                return this._super();
            }
        );

        return target;
    };
});
