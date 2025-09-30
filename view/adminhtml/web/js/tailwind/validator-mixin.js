define([
    'jquery',
    'Magento_Ui/js/lib/validation/utils'
], function ($, utils) {
    'use strict';

    // magento/module-page-builder/view/adminhtml/web/js/form/element/validator-rules-mixin.js
    // original pattern: /^[a-zA-Z\d\-_/:.[\]&@()! ]+$/i
    // `>` was added.
    function validateCssClass(str) {
        return (/^[a-zA-Z\d\-_/:.[\]&@()! >]+$/i).test(str);
    }

    return function (validator) {
        validator.addRule(
            'validate-css-class',
            function (value) {
                if (utils.isEmptyNoTrim(value)) {
                    return true;
                }

                return validateCssClass(value);
            },
            $.mage.__('Please enter a valid CSS class.')
        );

        return validator;
    }
});
