define([
    'jquery',
    'knockout',
    'Melios_PageBuilder/js/copy-paste/serializer',
    'Melios_PageBuilder/js/utils/toast',
    'Melios_PageBuilder/js/utils/can-use-hotkeys',
    'Melios_PageBuilder/js/utils/release-pagebuilder-locks',
    'Magento_PageBuilder/js/master-format/validator',
    'Magento_PageBuilder/js/stage-builder',
    'Magento_Ui/js/modal/confirm',
], function ($, ko, serializer, toast, canUseHotkeys, releasePagebuilderLocks, isValidHtml, buildStage, confirm) {
    'use strict';

    async function getElementAndTextToCopy(e) {
        var cmp, el = $('.pagebuilder-content-type-active');

        if (el.length) {
            var contentType = ko.dataFor(el[0])?.contentType;

            return [
                el[0],
                contentType ? serializer.serialize(contentType) : ''
            ];
        }

        el = $('.pagebuilder-wysiwyg-overlay._hover').add(
            $('.pagebuilder-stage-wrapper.stage-full-screen').parent()
        );
        cmp = ko.dataFor(el[0]);

        if (!cmp?.pageBuilder) {
            return [el[0], ''];
        }

        // Do not copy contents if some modal is opened
        if (cmp.pageBuilder.isFullScreen()) {
            var modals = $('.modals-wrapper > ._show').sort((a, b) => {
                    return b.style.zIndex - a.style.zIndex;;
                }),
                topModal = modals.get(0);

            if (topModal && !topModal.contains(el[0])) {
                return [el[0], ''];
            }
        }

        await releasePagebuilderLocks([cmp.pageBuilder]);

        return [el[0], cmp.value?.()];
    }

    $(document).on('copy', async e => {
        if (!canUseHotkeys(e) || window.getSelection().toString().length) {
            return;
        }

        var copyingToast = toast.showLater('Copying...', 150),
            [el, text] = await getElementAndTextToCopy(e);

        copyingToast.hideToast();

        if (!text) {
            return;
        }

        e.preventDefault();
        await navigator.permissions.query({ name: 'clipboard-write' });
        await navigator.clipboard.writeText(text);
        toast.show('Copied!');
    });

    $(document).on('cut', async e => {
        if (!canUseHotkeys(e) || window.getSelection().toString().length) {
            return;
        }

        var cuttingToast = toast.showLater('Cutting...', 150),
            [el, text] = await getElementAndTextToCopy(e);

        cuttingToast.hideToast();

        if (!text) {
            return;
        }

        e.preventDefault();

        if (!require.defined('Melios_PageBuilderPro/js/copy-paste/copy-paste')) {
            toast.show('Melios Page Builder Pro version is required for cut operations.');
        }

        $(document).trigger('melios:cut', { el, text });
    });

    $(document).on('paste', e => {
        if (!canUseHotkeys(e)) {
            return;
        }

        var text = e.originalEvent.clipboardData.getData('text'),
            data = serializer.unserialize(text);

        if (data) {
            // Prevent inserting serialized data into inputs or contenteditable areas
            // because it's not useful and will confuse non-technical users
            e.preventDefault();

            if (!require.defined('Melios_PageBuilderPro/js/copy-paste/copy-paste')) {
                toast.show('Melios Page Builder Pro version is required to paste copied section.');
            }

            return $(document).trigger('melios:paste', { json: data });
        }

        if ($('.pagebuilder-content-type-active').length) {
            return;
        }

        var el = $('.pagebuilder-wysiwyg-overlay._hover').add(
                $('.pagebuilder-stage-wrapper.stage-full-screen').parent()
            ),
            component = ko.dataFor(el[0]);

        if (!component?.pageBuilder || !isValidHtml(text)) {
            return;
        }

        e.preventDefault();

        function setContent() {
            component.pageBuilder.stage.rootContainer.children([]);
            buildStage(component.pageBuilder.stage, text);
        }

        if (!component.pageBuilder.stage.rootContainer.children().length) {
            setContent();
        } else {
            confirm({
                content: 'Replace entire Page Builder content with clipboard content?',
                actions: {
                    confirm: setContent
                }
            });
        }
    });
});
