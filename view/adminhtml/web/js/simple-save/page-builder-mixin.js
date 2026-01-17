define([
    'jquery',
    'knockout',
    'uiRegistry',
    'mage/translate',
    'mage/utils/wrapper',
    'Melios_PageBuilder/js/utils/toast',
    'Melios_PageBuilder/js/utils/release-pagebuilder-locks'
], function ($, ko, uiRegistry, $t, wrapper, toast, releasePagebuilderLocks) {
    'use strict';

    function notifyWithBanner(text) {
        toast.show({
            duration: 10000,
            destination: 'https://meliosbuilder.com/pricing',
            newWindow: true,
            node: $(`
                <div style="padding: 3px 0">
                    <p style="margin:0 0 5px">${text}</p>
                    <p style="margin:0">
                        Upgrade to Melios Builder Pro to unlock Quick Save!
                    </p>
                </div>
            `)[0],
        });
    }

    function getChildElements(parent) {
        var elements = parent.elems ? parent.elems() : [];

        elements.forEach(function (element) {
            elements = elements.concat(getChildElements(element));
        });

        return elements;
    }

    $(document).on('click', '.mls-save', async () => {
        var eventData = {
            cancel: false,
            pagebuilder: $('.pagebuilder-stage-wrapper.stage-full-screen')[0],
        };

        if (!(eventData.field = ko.dataFor(eventData.pagebuilder.parentElement))) {
            return;
        }

        eventData.form = uiRegistry.get(eventData.field.name.split('.', 2).join('.'));
        if (!eventData.form?.source) {
            return;
        }

        $(document).trigger('melios:save!', eventData);
        if (eventData.cancel) {
            return;
        }

        var button = $('#save-button, #save').filter((i, el) => {
            return !$(el).closest('.pagebuilder_modal_form_pagebuilder_modal_form_modal').length
                && !$(el).closest('.modal-slide')[0]?.className.includes('pagebuilder_');
        });

        if (!button.length ||
            eventData.form.ajaxSave ||
            $(eventData.pagebuilder).closest('.modals-wrapper').length
        ) {
            return notifyWithBanner('Unable to save using simple save.');
        }

        eventData.form.validate();
        if (eventData.form.source.get('params.invalid')) {
            var errors = getChildElements(eventData.form)
                .filter(el => el.error?.call?.())
                .filter(el => el.error() !== true)
                .map(el => [el.label || '', el.error()].filter(i => i).join(': '));

            if (errors.length) {
                return toast.error({
                    text: errors.join("\n")
                });
            }
        }

        $('body').trigger('processStart');
        notifyWithBanner('Using simple save with page reload.');

        $('[contenteditable=true]:focus').blur();
        // Wait at least 500ms. See applyBindingsDebounce in magento/module-page-builder/view/adminhtml/web/js/stage.js
        await new Promise(resolve => setTimeout(resolve, 2000));
        await releasePagebuilderLocks(
            eventData.form.source.get('pageBuilderInstances') ||
            eventData.form.get('pageBuilderInstances')
        );

        button.last().click();
    });

    $(document).on('click', '.mls-more', (e) => {
        e.stopPropagation();
        $(e.currentTarget)
            .closest('.pagebuilder-header')
            .find('.template-buttons')
            .toggleClass('shown');
    });
    $(document).on('click', () => {
        $('.pagebuilder-header .template-buttons').removeClass('shown');
    });

    function updateTopPanel(pagebuilder) {
        var panel = $(pagebuilder.panel.element).parent().find('.pagebuilder-header');

        if (!panel.length || panel.find('.mls-actions').length) {
            return;
        }

        panel.append(`
            <div class="mls-actions">
                <button class="mls-save" type="button">${$t('Save')}</button>
                <button class="mls-more mls-btn-icon" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-icon lucide-grip"><circle cx="12" cy="5" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="19" cy="19" r="1"/><circle cx="5" cy="19" r="1"/></svg>
                </button>
            </div>
        `);
        panel.find('.mls-actions').append(panel.find('.icon-pagebuilder-fullscreen-exit'));
    }

    return function (target) {
        target.prototype.initListeners = wrapper.wrapSuper(
            target.prototype.initListeners,
            function () {
                this.isSnapshot.subscribe(flag => {
                    if (!flag) {
                        setTimeout(() => updateTopPanel(this), 100);
                    }
                });

                return this._super();
            }
        );

        return target;
    };
});
