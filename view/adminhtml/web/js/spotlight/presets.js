define([
    'require',
    'underscore',
    'Magento_PageBuilder/js/events'
], function (require, _, events) {
    'use strict';

    var registry = {},
        icons = {},
        fallbacks = {},
        popular = {},
        dragged = null;

    events.on('stage:interactionStop', () => {
        dragged = null;
    });

    function get(name) {
        return _.sortBy(_.values(registry[name]), 'sortOrder');
    }

    function icon(value) {
        if (!/[<\/]/.test(value || '')) {
            return { icon: value || '', image: '' };
        }

        return { icon: '', image: value.startsWith('<') ? value : require.toUrl(value) };
    }

    function item(type, preset, id) {
        return _.extend({
            id,
            name: type.name,
            label: type.label,
            group: type.group || '',
            fallback: fallbacks[type.name] || null,
            popular: popular[id] ?? null,
            note: preset?.label || '',
            preset: preset || null,
        }, icon(preset?.icon || type.icon));
    }

    return {
        /**
         * presets.add('row', [{
         *     code: 'full-width',       // unique within the element, the same code replaces it
         *     label: $t('Full Width'),  // shown after the element label
         *     icon: 'Magento_PageBuilder/css/images/content-type/row/appearance/full-width.svg', // or <svg>, or a class
         *     sortOrder: 20,
         *     default: true,            // shown as the element itself, instead of plain "Row"
         *     data: { appearance: 'full-width' },                    // field values, or a function returning them
         *     children: [{ name: 'column', data: {}, children: [] }], // instead of its default ones, or a function
         * }]);
         */
        add: function (name, presets) {
            registry[name] = registry[name] || {};

            [].concat(presets).forEach(preset => {
                registry[name][preset.code] = preset;
            });

            return this;
        },

        get,

        // Spotlight icons of elements, instead of their panel icons: { text: '<svg ...>' }
        icons: function (map) {
            _.extend(icons, map);

            return this;
        },

        /**
         * The element Spotlight offers as a card when nothing matches the search:
         * presets.fallback('melios-ai-composer', {
         *     label: $t('Compose “%1” with AI'),          // %1: the search
         *     note: $t('Uses your search as the prompt'),
         *     hint: $t('Check the spelling, or let AI Composer build it from your search.'), // under "No results"
         *     preset: query => ({ code: 'prompt', prompt: query }), // inserted with it, comes in its dropAfter event
         * });
         */
        fallback: function (name, options) {
            fallbacks[name] = options;

            return this;
        },

        // Items Spotlight offers when nothing matches the search, by id with their sortOrder: { text: 10, 'row/full-width': 20 }
        popular: function (map) {
            _.extend(popular, map);

            return this;
        },

        /**
         * Spotlight items: each element as its presets, in their order, or as itself without a default one.
         * The element itself keeps its name as id.
         *
         * @param {Object[]} types [{name, label, icon, group}]
         * @return {Object[]} [{id, name, label, group, fallback, popular, note, icon, image, preset}]
         */
        items: function (types) {
            return types.flatMap(type => {
                var presets = get(type.name),
                    own = presets.find(preset => preset.default);

                type = _.extend({}, type, { icon: icons[type.name] || type.icon });

                return (own ? presets : [null].concat(presets)).map(preset => {
                    return item(type, preset, !preset || preset === own ? type.name : type.name + '/' + preset.code);
                });
            });
        },

        // The preset of the element dragged from Spotlight, for its drop to take
        drag: function (name, preset) {
            dragged = preset ? { name, preset } : null;
        },

        take: function (name) {
            var preset = dragged?.name === name ? dragged.preset : null;

            if (preset) {
                dragged = null;
            }

            return preset;
        },
    };
});
