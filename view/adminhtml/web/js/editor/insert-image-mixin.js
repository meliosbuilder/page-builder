define([
    'jquery',
    'mage/utils/wrapper'
], function ($, wrapper) {
    'use strict';

    return function (target) {
        target.insertAtCursor = wrapper.wrap(
            target.insertAtCursor,
            function (o, textarea, content) {
                if (!textarea.nextSibling?.CodeMirror) {
                    return o(textarea, content);
                }

                textarea.nextSibling.CodeMirror.doc.replaceSelection(content);
            }
        );

        return target;
    };
});
