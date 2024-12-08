define([
    'Magento_Ui/js/form/element/select',
    'Melios_PageBuilder/js/image/form/inherited-strategy'
], function (Select, strategy) {
    'use strict';

    return Select.extend(strategy);
});
