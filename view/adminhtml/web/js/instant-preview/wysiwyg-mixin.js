define([
    'tinymce',
    'Magento_PageBuilder/js/events',
    'Melios_PageBuilder/js/instant-preview/top-modal-utils'
], function (tinyMCE, events, topModalUtils) {
    'use strict';

    var props = ['backgroundImage', 'backgroundPosition', 'backgroundSize', 'backgroundRepeat', 'backgroundAttachment'];

    // Computed color is always "rgb(...)" or "rgba(...)"
    function getAlpha(color) {
        var match = color.match(/rgba\(.*,\s*([\d.]+)\)/);

        return match ? parseFloat(match[1]) : 1;
    }

    function colorLayer(color) {
        return [`linear-gradient(${color}, ${color})`, '0 0', 'auto', 'repeat', 'scroll'];
    }

    function getBackground(element, root) {
        var layers = [],
            color = '';

        for (let el = element; el; el = el.parentElement) {
            let style = getComputedStyle(el),
                alpha = getAlpha(style.backgroundColor);

            // Banner overlay shown on hover only. Show it, since mouse is over the form.
            if (!alpha && el.dataset.overlayColor &&
                el.closest('[data-show-overlay]')?.dataset.showOverlay === 'hover'
            ) {
                layers.push(colorLayer(el.dataset.overlayColor));
            }

            if (root.contains(el) && style.backgroundImage !== 'none') {
                layers.push(props.map(prop => style[prop]));
            }

            if (alpha >= 1) {
                color = style.backgroundColor;
                break;
            }

            if (alpha > 0) {
                layers.push(colorLayer(style.backgroundColor));
            }
        }

        return props.reduce((result, prop, i) => {
            result[prop] = layers.map(layer => layer[i]).join(', ');

            return result;
        }, { backgroundColor: color });
    }

    return function (target) {
        return target.extend({
            initialize: function () {
                this._super();

                if (this.name.startsWith('pagebuilder_')) {
                    this.initElementBackground();
                }

                return this;
            },

            initElementBackground: function () {
                var contentType,
                    frame,
                    apply = () => {
                        var editor = tinyMCE.get(this.wysiwygId),
                            wrapper = contentType?.preview?.wrapperElement;

                        cancelAnimationFrame(frame);

                        if (!editor?.iframeElement || !wrapper || contentType.id !== this.source?.id) {
                            return;
                        }

                        // Start from the element where text is rendered, so banner overlay is included
                        Object.assign(
                            editor.iframeElement.style,
                            getBackground(
                                wrapper.querySelector('.inline-wysiwyg') || wrapper,
                                wrapper
                            )
                        );
                        editor.getBody().style.backgroundColor = 'transparent';
                    },
                    applyLater = () => {
                        cancelAnimationFrame(frame);
                        frame = requestAnimationFrame(apply);
                    },
                    bind = () => {
                        contentType?.dataStore.events.off('state', applyLater);
                        contentType = topModalUtils.getEditedContentType();
                        contentType?.dataStore.events.on('state', applyLater);
                        applyLater();
                    },
                    onAddEditor = e => {
                        if (e.editor.id === this.wysiwygId) {
                            e.editor.on('init', apply);
                        }
                    },
                    // Computed style is in the middle of transition when read right after change (banner overlay)
                    onTransitionEnd = e => {
                        if (e.propertyName.startsWith('background') &&
                            contentType?.preview?.wrapperElement?.contains(e.target)
                        ) {
                            applyLater();
                        }
                    };

                tinyMCE.on('AddEditor', onAddEditor);
                document.addEventListener('transitionend', onTransitionEnd);
                events.on('contentType:editBefore', () => setTimeout(bind), this.uid);

                this.unbindElementBackground = () => {
                    cancelAnimationFrame(frame);
                    tinyMCE.off('AddEditor', onAddEditor);
                    document.removeEventListener('transitionend', onTransitionEnd);
                    events.off(this.uid);
                    contentType?.dataStore.events.off('state', applyLater);
                };

                bind();
            },

            destroy: function () {
                this.unbindElementBackground?.();
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
