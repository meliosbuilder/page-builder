define([
    'jquery',
    'knockout'
], function ($, ko) {
    'use strict';

    function requireAsync(deps) {
        return new Promise(resolve => require(deps, (...modules) => resolve(modules)));
    }

    function setInputFiles(input, files) {
        var dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function hasUploader(config) {
        return !!config?.additional_data?.uploaderConfig;
    }

    /**
     * Content type with uploader, that can be placed into single parent type only.
     * Eg: Slide (Slider), Marquee Item (Marquee)
     */
    function isChildOf(config, parentName) {
        return hasUploader(config) &&
            config.allowed_parents?.length === 1 &&
            config.allowed_parents[0] === parentName;
    }

    function getInput(contentType) {
        return $('#' + contentType.id).find('input[type="file"]')[0];
    }

    /**
     * Wait until uploader of the newly created item is rendered
     */
    function waitForInput(contentType, timeout = 5000) {
        var start = Date.now();

        return new Promise(resolve => {
            (function check() {
                var input = getInput(contentType);

                if (input || Date.now() - start > timeout) {
                    return resolve(input);
                }

                setTimeout(check, 50);
            })();
        });
    }

    async function createItem(parent, config) {
        var [createContentType] = await requireAsync(['Magento_PageBuilder/js/content-type-factory']),
            item = await createContentType(config, parent, parent.stageId);

        parent.addChild(item, parent.children().length);

        return item;
    }

    async function uploadItems(parent, itemConfig, start, files) {
        for (var i = 0; i < files.length; i++) {
            var item = parent.children()[start + i] || await createItem(parent, itemConfig),
                input = await waitForInput(item);

            if (input) {
                setInputFiles(input, [files[i]]);
            }
        }
    }

    /**
     * Find the parent, item type and position to start pasting from
     *
     * @returns {{parent: Object, itemConfig: Object, start: Number}|undefined}
     */
    function resolveItemsTarget(preview) {
        var contentType = preview.contentType,
            parent = contentType.parentContentType,
            itemConfig;

        // Hovered item: start from it
        if (parent && isChildOf(contentType.config, parent.config.name)) {
            return {
                parent,
                itemConfig: contentType.config,
                start: parent.children().indexOf(contentType)
            };
        }

        // Hovered parent: start from active item (Slider), or append new items
        itemConfig = Object.values(require('Magento_PageBuilder/js/config').getConfig('content_types'))
            .find(config => isChildOf(config, contentType.config.name));

        if (!itemConfig) {
            return;
        }

        return {
            parent: contentType,
            itemConfig,
            start: preview.activeSlide?.() ?? contentType.children().length
        };
    }

    /**
     * Upload images from clipboard into:
     *  - opened media gallery
     *  - hovered item (Slide, Marquee Item) and all following items. Create new items if needed.
     *  - hovered content type with uploader (Image, Banner, etc.)
     *
     * @param {File[]} files
     * @returns {Boolean} false if there is no target to paste into
     */
    return function (files) {
        var el, preview, target, fileUploadInput;

        // search for opened gallery
        fileUploadInput = $('.media-gallery-image-uploader-container:visible').filter((i, container) => {
            var modal = $(container).closest('.modal-slide, .modal-popup');
            return !modal.length || modal.hasClass('_show');
        }).last().find('#image-uploader-form [type="file"]')[0];

        if (fileUploadInput) {
            setInputFiles(fileUploadInput, files);
            return true;
        }

        // get hovered element
        el = $('.pagebuilder-content-type-active');
        preview = el.length ? ko.dataFor(el[0]) : null;
        if (!preview?.contentType) {
            return false;
        }

        // check if hovered element has children with uploaders (slider, marquee)
        target = resolveItemsTarget(preview);
        if (target) {
            uploadItems(target.parent, target.itemConfig, Math.max(target.start, 0), files);
            return true;
        }

        // check if hovered element has uploader
        fileUploadInput = hasUploader(preview.config) && getInput(preview.contentType);
        if (fileUploadInput) {
            setInputFiles(fileUploadInput, files.slice(0, 1));
            return true;
        }

        return false;
    };
});
