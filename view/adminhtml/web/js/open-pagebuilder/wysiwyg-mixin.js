define([
    'Magento_Ui/js/lib/view/utils/async',
    'Melios_PageBuilder/js/utils/can-use-hotkeys'
], function ($, canUseHotkeys) {
    'use strict';

    function openAllParents(cmp) {
        cmp.opened?.(true);

        if (cmp.containers?.[0]) {
            openAllParents(cmp.containers[0]);
        }
    }

    return function (target) {
        return target.extend({
            initialize: function () {
                $(document).on('keydown', (e) => {
                    if (!e.altKey || e.code !== 'Digit0') {
                        return;
                    }

                    if (!canUseHotkeys(e)) {
                        return;
                    }

                    if (this.pageBuilder.isFullScreen()) {
                        return $('.pagebuilder-stage-wrapper.stage-full-screen .icon-pagebuilder-fullscreen-exit').click();
                    }

                    this.pageBuilder.stage.afterRenderDeferred.promise.then(() => {
                        $(document.activeElement).blur();
                        $.async({
                            component: this,
                            selector: this.overlaySelector
                        }, el => $(el).click());
                        // this.pageBuilderEditButtonClick(this, e);
                    });

                    openAllParents(this);
                });

                return this._super();
            }
        });
    };
});
