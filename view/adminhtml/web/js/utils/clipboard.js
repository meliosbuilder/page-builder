define([
    'jquery'
], function ($) {
    'use strict';

    function unsecuredCopyToClipboard(text) {
        var textArea = $('<textarea>').val(text).appendTo('body'),
            success = true;

        try {
            textArea.get(0).focus({ preventScroll: true });
            textArea.get(0).select();
            success = document.execCommand('copy');
        } catch (e) {
            success = false;
        }

        textArea.remove();

        return success;
    }

    return {
        writeText: function (text) {
            return new Promise(async (resolve, reject) => {
                if (!navigator.clipboard) {
                    if (text instanceof ClipboardItem) {
                        text = await text.getType('text/plain');
                        text = await text.text();
                    }
                    return unsecuredCopyToClipboard(text) ? resolve() : reject({
                        message: 'Unable to copy to clipboard'
                    });
                }

                try {
                    if (text instanceof ClipboardItem) {
                        await navigator.clipboard.write([text]);
                    } else {
                        await navigator.clipboard.writeText(text);
                    }
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        }
    }
});
