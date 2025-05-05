define([
    'Magento_Ui/js/form/element/single-checkbox',
    'Melios_PageBuilder/js/image/form/inherited-strategy'
], function (Checkbox, strategy) {
    'use strict';

    return Checkbox.extend(strategy);
});
