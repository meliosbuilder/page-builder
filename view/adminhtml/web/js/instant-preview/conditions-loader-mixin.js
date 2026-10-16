define([
    'jquery',
    'underscore',
    'uiRegistry',
    'mage/utils/objects',
    'Magento_PageBuilder/js/form/provider/conditions-data-processor',
], function ($, _, registry, objectUtils, conditionsDataProcessor) {
    'use strict';

    function collect(container) {
        var result = {};

        container.querySelectorAll('[name^="parameters["]').forEach(item => {
            switch (item.type) {
                case 'checkbox':
                    result[item.name] = +!!item.checked;
                    break;

                case 'radio':
                    if (item.checked) {
                        result[item.name] = item.value;
                    }
                    break;

                case 'select-multiple':
                    result[item.name.substring(0, item.name.length - 2)] = _.pluck(item.selectedOptions, 'value');
                    break;

                default:
                    result[item.name] = item.value;
            }
        });

        return result;
    }

    function watch(config, element, loader) {
        var source = registry.get(config.formNamespace + '.' + config.formNamespace).source,
            // The tree's conditions as loaded: only edits made after loading are applied
            loaded = null,
            fromTree = pairs => {
                var probe = Object.assign({}, source.data, pairs, { condition_option: 'condition' });

                conditionsDataProcessor(probe, config.attribute);

                return objectUtils.nested(probe, config.attribute) || '';
            },
            reload = () => {
                loaded = null;
                loader(config, element);
            },
            apply = _.debounce(() => {
                var pairs = element.isConnected ? collect(element) : {},
                    conditions;

                if (_.isEmpty(pairs)) {
                    return;
                }

                conditions = fromTree(pairs);

                if (loaded === null || conditions === loaded) {
                    loaded = conditions;
                    return;
                }

                loaded = conditions;
                _.each(pairs, (value, name) => source.set('data.' + name, value));
                source.save();
            }, 400);

        new MutationObserver(apply).observe(element, { childList: true, subtree: true, characterData: true });
        $(element).on('change input', apply);

        source.on('data.' + config.attribute, value => {
            if (loaded !== null && element.isConnected && (value || '') !== loaded) {
                apply.cancel();
                reload();
            }
        });

        reload();
    }

    return function (loader) {
        return function (config, element) {
            watch(config, element, loader);
        };
    };
});
