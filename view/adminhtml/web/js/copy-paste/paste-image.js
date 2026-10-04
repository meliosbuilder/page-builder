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

    async function createItem(parent, config, index) {
        var [createContentType] = await requireAsync(['Magento_PageBuilder/js/content-type-factory']),
            item = await createContentType(config, parent, parent.stageId);

        parent.addChild(item, index);

        return item;
    }

    /**
     * Upload first image into the target item (if any), and create new items for the rest
     */
    async function uploadItems(target, files) {
        var index = target.index;

        for (var i = 0; i < files.length; i++) {
            var item = i === 0 && target.item || await createItem(target.parent, target.itemConfig, index++),
                input = await waitForInput(item);

            if (input) {
                setInputFiles(input, [files[i]]);
            }
        }
    }

    /**
     * Find the parent, item type, item to replace and position to insert new items at
     *
     * @returns {{parent: Object, itemConfig: Object, item: Object|undefined, index: Number}|undefined}
     */
    function resolveItemsTarget(preview) {
        var contentType = preview.contentType,
            parent = contentType.parentContentType,
            itemConfig, item;

        // Hovered content type with uploader (Image, Banner, Slide, etc.): replace it and insert new items after it
        if (parent && hasUploader(contentType.config) && getInput(contentType)) {
            return {
                parent,
                itemConfig: contentType.config,
                item: contentType,
                index: parent.children().indexOf(contentType) + 1
            };
        }

        // Hovered parent: same as hovered active item (Slider), or append new items
        itemConfig = Object.values(require('Magento_PageBuilder/js/config').getConfig('content_types'))
            .find(config => isChildOf(config, contentType.config.name));

        if (!itemConfig) {
            return;
        }

        item = contentType.children()[preview.activeSlide?.()];

        return {
            parent: contentType,
            itemConfig,
            item,
            index: item ? contentType.children().indexOf(item) + 1 : contentType.children().length
        };
    }

    /**
     * Upload images from clipboard into:
     *  - opened media gallery
     *  - hovered content type with uploader (Image, Banner, Slide, etc.). Create new items after it for the rest of images.
     *  - hovered parent of items (Slider, Marquee). Same as hovering active item, or append new items.
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

        target = resolveItemsTarget(preview);
        if (target) {
            uploadItems(target, files);
            return true;
        }

        return false;
    };
});
