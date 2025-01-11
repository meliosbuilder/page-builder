define([
    'jquery',
    'mage/utils/wrapper',
    'jquery/uppy-core'
], function ($, wrapper) {
    'use strict';

    var extensions = [
        'avif',
        'webp',
    ];

    // Use low-level override as we can't nicely add allowed extensions to the media-uploader
    $.inArray = wrapper.wrap($.inArray, function (o, value, array, fromIndex) {
        if (extensions.includes(value) && !array.includes(value)) {
            // see Magento/Backend/view/adminhtml/web/js/media-uploader.js#L78
            if (new Error().stack.includes('onBeforeFileAdded')) {
                array = [...new Set([...array , ...extensions])];
            }
        }
        return o(value, array, fromIndex);
    });

    // Do not compress the image if output is bigger than the input
    Uppy.Compressor.prototype.compress = wrapper.wrap(
        Uppy.Compressor.prototype.compress,
        function (o, uncompressed) {
            return new Promise(async resolve => {
                var compressed = await o(uncompressed),
                    result = compressed;

                if (compressed.size - uncompressed.size > 1024 * 5) {
                    result = uncompressed;
                }

                resolve(result);
            });
        }
    );

    return function (target) {
        // this code does nothing since media uloader uses hardcoded extensions
        // target.prototype._create = wrapper.wrap(
        //     target.prototype._create,
        //     function (o) {
        //         o();

        //         if (typeof this.allowedExtensions !== 'string') {
        //             return;
        //         }

        //         extensions.forEach(extension => {
        //             if (!this.allowedExtensions.includes(extension)) {
        //                 this.allowedExtensions += ' ' + extension;
        //             }
        //         });
        //     }
        // );

        return target;
    };
});
