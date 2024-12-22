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

    function isAllParentsVisible(cmp) {
        if (cmp.visible === false || cmp.visible?.() === false) {
            return false;
        }

        if (cmp.containers?.[0]) {
            return isAllParentsVisible(cmp.containers[0]);
        }

        return true;
    }

    return function (target) {
        return target.extend({
            initialize: function () {
                $(document).on('keydown', (e) => {
                    if (!e.altKey || e.code !== 'Digit0') {
                        return;
                    }

                    if (!canUseHotkeys(e, 'select, :radio, :checkbox')) {
                        return;
                    }

                    if (this.pageBuilder.isFullScreen()) {
                        return $('.pagebuilder-stage-wrapper.stage-full-screen .icon-pagebuilder-fullscreen-exit').click();
                    }

                    if (!isAllParentsVisible(this)) {
                        return;
                    }

                    if (this.modal && !this.modal.parent().hasClass('_show')) {
                        return;
                    }

                    this.pageBuilder.stage.afterRenderDeferred.promise.then(() => {
                        var ran = false;
                        $(document.activeElement).blur();
                        $.async({
                            component: this,
                            selector: this.overlaySelector
                        }, el => {
                            if (!ran) {
                                $(el).click();
                                ran = true;
                            }
                        });
                        // this.pageBuilderEditButtonClick(this, e);
                    });

                    openAllParents(this);
                });

                return this._super();
            }
        });
    };
});
