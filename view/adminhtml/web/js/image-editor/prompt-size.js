define([
    'jquery',
    'mage/translate',
    'Magento_Ui/js/modal/modal',
], function ($, $t, modal) {
    'use strict';

    var $el, $width, $height, $lock, ratio;

    function init() {
        const content = `
            <input type="number" id="melios_editor_width" class="admin__control-text"/>
            <label for="melios_editor_lock_ratio">
                <input type="checkbox" id="melios_editor_lock_ratio" checked/>
                <svg class="aspect-checked" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg>
                <svg class="aspect-unchecked" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" /></svg>
            </label>
            <input type="number" id="melios_editor_height" class="admin__control-text"/>
        `;

        $el = $('<div class="melios-editor-size"></div>').html(content);
        $width = $('#melios_editor_width', $el);
        $height = $('#melios_editor_height', $el);
        $lock = $('#melios_editor_lock_ratio', $el);

        $el.on('input', '#melios_editor_width', e => {
            var val = +e.currentTarget.value;
            $width.val(val);
            if ($lock.prop('checked')) {
                $height.val(Math.round(val / ratio));
            }
        });
        $el.on('input', '#melios_editor_height', e => {
            var val = +e.currentTarget.value;
            $height.val(val);
            if ($lock.prop('checked')) {
                $width.val(Math.round(val * ratio));
            }
        });
        $el.on('input', '#melios_editor_lock_ratio', e => {
            if (e.currentTarget.checked) {
                ratio = (+$width.val() || 1) / (+$height.val() || 1);
            }
        });
    }

    return function (settings) {
        ratio = settings.defaults.width / settings.defaults.height;

        if (!$el) {
            init();
        }

        $lock.prop('checked', true);
        $width.val(settings.defaults.width);
        $height.val(settings.defaults.height);

        modal({
            autoOpen: true,
            focus: '#melios_editor_width',
            title: settings.title,
            buttons: [{
                text: $t('Cancel'),
                class: 'action-quaternary',
                click: function () {
                    settings.reject();
                    this.closeModal();
                }
            }, {
                text: $t('Ok'),
                class: 'primary',
                click: function () {
                    settings.resolve({
                        width: $width.val(),
                        height: $height.val(),
                    });
                    this.closeModal();
                }
            }]
        }, $el);
    }
});
