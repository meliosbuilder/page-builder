define([
    'jquery',
    'mage/utils/wrapper',
    'mage/adminhtml/browser',
    'mage/adminhtml/wysiwyg/widget',
], function ($, wrapper) {
    'use strict';

    var insertContentMixin = function (o, textarea, content) {
        if (!textarea.nextSibling?.CodeMirror) {
            return o(textarea, content);
        }

        textarea.nextSibling.CodeMirror.doc.replaceSelection(content);
    }

    // Fix for "Insert Variable" and "Insert Widget" buttons
    if (typeof updateElementAtCursor !== undefined) {
        updateElementAtCursor = wrapper.wrap(updateElementAtCursor, insertContentMixin);
    }

    // Fix for "Insert Image" button
    $(document.body).on('mediabrowsercreate', function (event) {
        var browser = $(event.target).data('mageMediabrowser') || $(event.target).data('mediabrowser');

        if (browser) {
            browser.insertAtCursor = wrapper.wrap(browser.insertAtCursor, insertContentMixin);
        }
    });
});
