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

        return target;
    };
});
