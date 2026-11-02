define([], function () {
    'use strict';

    /**
     * Size an image gets when it's selected: half of the file size, vectors keep theirs.
     *
     * @param {String} url
     * @param {Number|String} [oldWidth]
     * @param {Number|String} [oldHeight]
     * @return {Promise<{width: Number, height: Number}|null>} null when the current size is close enough
     *      or the image can't be loaded
     */
    return function (url, oldWidth, oldHeight) {
        return new Promise(resolve => {
            var img = new Image(),
                isVector = url.toLowerCase().endsWith('.svg');

            img.onload = () => {
                var newWidth = img.width,
                    newHeight = img.height,
                    widthFactor = Math.max(oldWidth, newWidth) / Math.min(oldWidth, newWidth);

                if (!isVector) {
                    newWidth /= 2;
                    newHeight /= 2;
                }

                if (oldWidth &&
                    oldHeight &&
                    Math.round(oldWidth / oldHeight) === Math.round(newWidth / newHeight) &&
                    Math.abs(newWidth - oldWidth) / oldWidth <= 0.3 &&
                    widthFactor < 2
                ) {
                    return resolve(null);
                }

                resolve({ width: newWidth, height: newHeight });
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };
});
