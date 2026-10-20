define([
    'jquery',
    'tinymce'
], function ($, tinyMCE) {
    'use strict';

    return function (target) {
        return target.extend({
            initialize: function () {
                this._super();

                if (this.name.startsWith('pagebuilder_')) {
                    this.initElementBackground();
                }

                return this;
            },

            // Use element's background in the editor so white text stays readable
            initElementBackground: function () {
                var apply = () => {
                    var iframe = tinyMCE.get(this.wysiwygId)?.iframeElement,
                        data = this.source?.get('data') || {},
                        image = data.background_image?.[0]?.url,
                        // Same rule as banner's overlay-background-color converter
                        overlay = data.show_overlay === 'always' && data.overlay_color;

                    if (!iframe) {
                        return;
                    }

                    // Values are plain css, layer lists repeat for overlay too
                    Object.assign(iframe.style, {
                        backgroundColor: data.background_color || '',
                        backgroundImage: [
                            overlay && `linear-gradient(${overlay}, ${overlay})`,
                            image && `url("${image}")`
                        ].filter(Boolean).join(', '),
                        backgroundPosition: data.background_position || '',
                        backgroundSize: data.background_size || '',
                        backgroundRepeat: data.background_repeat || '',
                        backgroundAttachment: data.background_attachment || ''
                    });
                };

                this.onAddEditor = e => {
                    if (e.editor.id === this.wysiwygId) {
                        e.editor.on('init', apply);
                    }
                };
                tinyMCE.on('AddEditor', this.onAddEditor);

                [
                    'background_color',
                    'background_image',
                    'background_position',
                    'background_size',
                    'background_repeat',
                    'background_attachment',
                    'overlay_color',
                    'show_overlay'
                ].forEach(key => this.source?.on(`data.${key}`, apply, this.name));

                // Colorpicker preview writes to source.data directly, see page-builder-mixin
                $(document).on(`move.spectrum.${this.uid} hide.spectrum.${this.uid}`, () => setTimeout(apply));

                // Editor could be already created when form is rendered again
                if (tinyMCE.get(this.wysiwygId)?.initialized) {
                    apply();
                }
            },

            destroy: function () {
                if (this.onAddEditor) {
                    tinyMCE.off('AddEditor', this.onAddEditor);
                    $(document).off(`.${this.uid}`);
                }
                this._super();
            },

            // Fixed not working "reset"
            reset: function () {
                this._super();
                if (tinyMCE.get(this.wysiwygId) && this.value() !== tinyMCE.get(this.wysiwygId).getContent()) {
                    tinyMCE.get(this.wysiwygId).execCommand('mceSetContent', false, this.value());
                }
            }
        });
    };
});
