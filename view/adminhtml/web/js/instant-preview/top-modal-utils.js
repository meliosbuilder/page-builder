define([
    'jquery',
    'underscore',
    'knockout',
    'uiRegistry',
    'mageUtils',
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/events'
], function ($, _, ko, registry, utils, Config, events) {
    'use strict';

    var allowUpdateModalSource = true,
        allowUpdateModalSourceTimer,
        restoring = false,
        editedContentType;

    // Tracked here because this module is loaded with page builder, before any form component
    events.on('contentType:editBefore', (data) => editedContentType = data.contentType);

    $(document)
        .on('melios:history:restoreBefore', () => restoring = true)
        .on('melios:history:restoreAfter', () => restoring = false);

    // Like Magento's edit.js open(): a viewport field equal to the desktop value is inherited and shown empty
    function blankInheritedFields(data, contentType) {
        var viewport = Config.getConfig('viewport'),
            defaultViewport = Config.getConfig('defaultViewport');

        if (!viewport || viewport === defaultViewport) {
            return data;
        }

        data = Object.assign({}, data);
        _.each(contentType.getViewportFields(viewport, data), (field, key) => {
            var desktopValue = contentType.dataStores[defaultViewport].get(key);

            if (utils.compare(data[key], desktopValue).equal) {
                // Not undefined for text like edit.js: the field already exists here and validators call value.trim()
                data[key] = typeof desktopValue === 'string' ? '' : undefined;
            }
        });

        return data;
    }

    function topModal() {
        return $('.modals-wrapper > ._show')
            .sort((a, b) => b.style.zIndex - a.style.zIndex)
            .first()
            .filter((i, el) => el.classList.contains('pagebuilder_modal_form_pagebuilder_modal_form_modal'));
    }

    return {
        getTopModal: topModal,

        getEditedContentType: () => editedContentType,

        // Update preview on every change inside "Edit" modal
        updateSource: _.throttle(source => {
            var topSource = ko.dataFor(topModal().find('[name="appearance"]')[0])?.source;

            if (allowUpdateModalSource && topSource?.name === source?.name) {
                source?.save?.();
            }
        }, 80),

        updateModalData: (data, contentType) => {
            var modal = topModal(),
                topSource = ko.dataFor(modal.find('[name="appearance"]')[0])?.source;

            if (!topSource || topSource.id !== contentType.id) {
                return;
            }

            // Only for undo/redo: while typing, a value equal to desktop must stay in the field
            if (restoring) {
                data = blankInheritedFields(data, contentType);
            }

            clearTimeout(allowUpdateModalSourceTimer);
            allowUpdateModalSourceTimer = setTimeout(() => allowUpdateModalSource = true, 100);
            _.each(data, (v, k) => {
                if (!_.isEqual(topSource.data[k], v)) {
                    var el = ko.dataFor(modal.find(`[name="${k}"]`).closest('[data-bind]')[0]);

                    allowUpdateModalSource = false;
                    topSource.set(`data.${k}`, v);

                    // Dynamic rows (e.g. map locations) render records once and don't follow their data
                    registry
                        .filter(cmp => cmp.provider === topSource.name && cmp.index === k && cmp.recordData && cmp.reload)
                        .forEach(cmp => cmp.reload());

                    if (typeof v === 'string' &&
                        el?.wysiwygId &&
                        tinyMCE.get(el.wysiwygId) &&
                        tinyMCE.get(el.wysiwygId).getContent() !== v
                    ) {
                        tinyMCE.get(el.wysiwygId).setContent(v);
                    }
                }
            });
        },
    }
});
