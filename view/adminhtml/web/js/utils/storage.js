define([
    'jquery',
    'jquery/jquery-storageapi'
], function ($) {
    'use strict';

    return $.initNamespaceStorage('melios').localStorage;
});
