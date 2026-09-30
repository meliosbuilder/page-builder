define([
    'jquery',
    'knockout',
    'Melios_PageBuilder/js/copy-paste/serializer',
    'Melios_PageBuilder/js/utils/clipboard',
    'Melios_PageBuilder/js/utils/toast',
    'Melios_PageBuilder/js/utils/can-use-hotkeys',
    'Melios_PageBuilder/js/utils/release-pagebuilder-locks',
    'Magento_PageBuilder/js/master-format/validator',
    'Magento_PageBuilder/js/stage-builder',
    'Magento_Ui/js/modal/confirm',
], function ($, ko, serializer, clipboard, toast, canUseHotkeys, releasePagebuilderLocks, isValidHtml, buildStage, confirm) {
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
                    return b.style.zIndex - a.style.zIndex;
                }),
                topModal = modals.get(0),
                isInstantPreviewModal = $('body').hasClass('melios-instant-preview')
                    && modals.first().hasClass('pagebuilder_modal_form_pagebuilder_modal_form_modal');

            if (topModal && !topModal.contains(el[0]) && !isInstantPreviewModal) {
                return [el[0], ''];
            }
        }

        await releasePagebuilderLocks([cmp.pageBuilder]);

        return [el[0], cmp.value?.()];
    }

    function getUploader() {
        var el, preview, input,
            gallery = $('.media-gallery-image-uploader-container:visible').filter((i, container) => {
                var modal = $(container).closest('.modal-slide, .modal-popup');

                return !modal.length || modal.hasClass('_show');
            }).last();

        // Media gallery
        if (gallery.length) {
            input = gallery.find('#image-uploader-form [type="file"]')[0];

            return input ? { input, multiple: true } : undefined;
        }

        // Hovered content type with uploader (Image, Banner, Slide, etc.)
        el = $('.pagebuilder-content-type-active');
        preview = el.length ? ko.dataFor(el[0]) : null;

        if (!preview?.contentType || !preview.config?.additional_data?.uploaderConfig) {
            return;
        }

        input = $('#' + preview.contentType.id).find('input[type="file"]')[0];

        return input ? { input, multiple: false } : undefined;
    }

    function tryPasteImage(e) {
        var files = [...e.originalEvent.clipboardData.files].filter(f => f.type.startsWith('image/')),
            uploader = files.length ? getUploader() : null,
            dt;

        if (!uploader) {
            return false;
        }

        dt = new DataTransfer();
        (uploader.multiple ? files : files.slice(0, 1)).forEach(file => dt.items.add(file));
        uploader.input.files = dt.files;
        uploader.input.dispatchEvent(new Event('change', { bubbles: true }));

        return true;
    }

    $(document).on('copy', async e => {
        if (!canUseHotkeys(e) || window.getSelection().toString().length) {
            return;
        }

        var copyingToast = toast.showLater('Copying...', 150),
            promise = getElementAndTextToCopy(e);

        promise.then(() => copyingToast.hideToast());
        e.preventDefault();

        var text = new ClipboardItem({
            'text/plain': promise.then(([el, text]) => new Blob([text], { type: 'text/plain' }))
        });

        clipboard.writeText(text).then(() => {
            toast.show('Copied!');
        }).catch(e => {
            toast.error(e.message);
        });
    });

    $(document).on('cut', async e => {
        if (!canUseHotkeys(e) || window.getSelection().toString().length) {
            return;
        }

        var cuttingToast = toast.showLater('Cutting...', 150),
            promise = getElementAndTextToCopy(e);

        promise.then(() => cuttingToast.hideToast());
        e.preventDefault();

        var text = new ClipboardItem({
            'text/plain': promise.then(([el, text]) => new Blob([text], { type: 'text/plain' }))
        });
        var el = promise.then(([el]) => el);

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

        if (tryPasteImage(e)) {
            e.preventDefault();
            return;
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
