define([
    'tinymce',
    'mage/utils/wrapper'
], (tinyMCE, wrapper) => {
    'use strict';

    function addSvgSupport(settings) {
        var svgElements = [
            'svg,defs,pattern,desc,metadata,g,mask,path',
            'line,marker,rect,circle,ellipse,polygon,polyline',
            'linearGradient,radialGradient,stop,image,view,text',
            'textPath,title,tspan,glyph,symbol,switch,use',
        ].join(',')

        settings.extended_valid_elements = settings.extended_valid_elements || '';
        if (settings.extended_valid_elements.length) {
            settings.extended_valid_elements += ',';
        }
        settings.extended_valid_elements += svgElements.split(',').map(el => el + '[*]').join(',');
    }

    return function (target) {
        target.getSettings = wrapper.wrap(target.getSettings, function(o) {
            var settings = o();

            settings.menubar = true;
            settings.promotion = false;

            if (settings.toolbar && !settings.toolbar.includes(' code')) {
                settings.toolbar += ' | code';
            }

            addSvgSupport(settings);

            // allow empty spans
            if (!settings.extended_valid_elements.split(',').includes('span[*]')) {
                settings.extended_valid_elements += ',span[*]';
            }

            // allow divs as direct children of dl
            settings.valid_children = settings.valid_children || '';
            if (settings.valid_children.length) {
                settings.valid_children += ',';
            }
            settings.valid_children += '+dl[div],+div[dt|dd]';

            return settings;
        });

        /**
         * Magento bugfix:
         * The admin can load jQuery twice (mage/requirejs/mixins.js loads `deps` again in its own context),
         * and Knockout may register the textarea's value binding on the other copy. A jQuery trigger reaches
         * only handlers of its own copy, so the edited text never got to the form. A native event reaches all.
         */
        if (typeof target.updateTextArea !== 'function' || typeof target.getTextArea !== 'function') {
            return target;
        }

        target.updateTextArea = wrapper.wrap(target.updateTextArea, function (o) {
            var own = Object.prototype.hasOwnProperty.call(this, 'getTextArea'),
                getTextArea = this.getTextArea;

            this.getTextArea = function () {
                var textarea = getTextArea.apply(this, arguments),
                    trigger = textarea.trigger;

                // Only the adapter's own trigger('change'), anything else stays a jQuery trigger
                textarea.trigger = function (type) {
                    if (type !== 'change' || arguments.length > 1) {
                        return trigger.apply(this, arguments);
                    }

                    this.each((i, el) => el.dispatchEvent(new Event(type, { bubbles: true })));

                    return this;
                };

                return textarea;
            };

            try {
                return o();
            } finally {
                if (own) {
                    this.getTextArea = getTextArea;
                } else {
                    delete this.getTextArea;
                }
            }
        });

        return target;
    };
});
