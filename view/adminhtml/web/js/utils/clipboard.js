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
                    return unsecuredCopyToClipboard(text) ? resolve() : reject({
                        message: 'Unable to copy to clipboard'
                    });
                }

                try {
                    await navigator.permissions.query({ name: 'clipboard-write' }).catch(() => {
                        // Fix for Safari and Firefox
                    });
                    await navigator.clipboard.writeText(text);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        }
    }
});
