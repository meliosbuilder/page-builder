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

    // Eg: Slide in Slider, Marquee Item in Marquee
    function isChildOf(config, parentName) {
        return hasUploader(config) &&
            config.allowed_parents?.length === 1 &&
            config.allowed_parents[0] === parentName;
    }

    function getInput(contentType) {
        return $('#' + contentType.id).find('input[type="file"]')[0];
    }

    // Wait for uploader of newly created item
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

    // Replace image in target item (if any), create new items for the rest
    async function uploadItems(target, files) {
        var index = target.index;

        if (target.parentConfig) {
            target.parent = await createItem(target.parent, target.parentConfig, target.parent.children().length);
        }

        for (var i = 0; i < files.length; i++) {
            var item = i === 0 && target.item || await createItem(target.parent, target.itemConfig, index++),
                input = await waitForInput(item);

            if (i === 0) {
                $('#' + item.id)[0]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            if (input) {
                setInputFiles(input, [files[i]]);
            }
        }
    }

    /**
     * @returns {{parent: Object, itemConfig: Object, item: Object|undefined, index: Number}|undefined}
     */
    function resolveItemsTarget(preview) {
        var contentType = preview.contentType,
            parent = contentType.parentContentType,
            contentTypes, itemConfig, item;

        // Image, Banner, Slide, etc.: replace it, insert the rest after it
        if (parent && hasUploader(contentType.config) && getInput(contentType)) {
            return {
                parent,
                itemConfig: contentType.config,
                item: contentType,
                index: parent.children().indexOf(contentType) + 1
            };
        }

        contentTypes = require('Magento_PageBuilder/js/config').getConfig('content_types');

        // Slider: same as hovering active slide. Marquee: append
        itemConfig = Object.values(contentTypes).find(config => isChildOf(config, contentType.config.name));

        if (itemConfig) {
            item = contentType.children()[preview.activeSlide?.()];

            return {
                parent: contentType,
                itemConfig,
                item,
                index: item ? contentType.children().indexOf(item) + 1 : contentType.children().length
            };
        }

        // Column, Row, Tab Item: append images
        itemConfig = contentTypes.image;

        if (itemConfig.allowed_parents.includes(contentType.config.name)) {
            return {
                parent: contentType,
                itemConfig,
                index: contentType.children().length
            };
        }

        // Text, Buttons, etc.: insert images after it
        for (item = contentType; item.parentContentType; item = item.parentContentType) {
            parent = item.parentContentType;

            if (itemConfig.allowed_parents.includes(parent.config.name)) {
                return {
                    parent,
                    itemConfig,
                    index: parent.children().indexOf(item) + 1
                };
            }
        }
    }

    // Empty stage or no hovered element: append images wrapped into new row
    function resolveStageTarget() {
        var el = $('.pagebuilder-wysiwyg-overlay._hover').add(
                $('.pagebuilder-stage-wrapper.stage-full-screen').parent()
            ),
            root = el.length ? ko.dataFor(el[0])?.pageBuilder?.stage?.rootContainer : null,
            contentTypes;

        if (!root) {
            return;
        }

        contentTypes = require('Magento_PageBuilder/js/config').getConfig('content_types');

        return {
            parent: root,
            parentConfig: contentTypes.row,
            itemConfig: contentTypes.image,
            index: 0
        };
    }

    /**
     * Upload images into opened media gallery, hovered element, or the end of the stage
     *
     * @param {File[]} files
     * @returns {Boolean} false if there is no target
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
        target = preview?.contentType ? resolveItemsTarget(preview) : resolveStageTarget();
        if (target) {
            uploadItems(target, files);
            return true;
        }

        return false;
    };
});
