define([
    'mage/translate',
    'Magento_PageBuilder/js/config',
    'Magento_PageBuilder/js/content-type/column-group/grid-size'
], function ($t, Config, gridSize) {
    'use strict';

    function columns(parts, grid) {
        return {
            data: () => ({ grid_size: grid || gridSize.getDefaultGridSize() }),
            children: () => {
                var size = grid || gridSize.getDefaultGridSize(),
                    total = parts.reduce((sum, part) => sum + part, 0),
                    left = size,
                    list = parts.map((part, i) => {
                        var units = i < parts.length - 1 ? Math.max(1, Math.round(part / total * size)) : left;

                        left -= units;

                        return { name: 'column', data: { width: parseFloat((units * 100 / size).toFixed(8)) + '%' } };
                    });

                // Old Magento has columns right in the group
                return Config.getContentTypeConfig('column-line') ? [{ name: 'column-line', children: list }] : list;
            },
        };
    }

    function tabs(count) {
        return Array.from({ length: count }, (tab, i) => {
            return { name: 'tab-item', data: { tab_name: $t('Tab') + ' ' + (i + 1) } };
        });
    }

    return function (presets) {
        presets.add('row', [
            {
                code: 'contained',
                label: $t('Contained'),
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><path d="M9.75 0V30" stroke="#a39a92" stroke-width="1.5" stroke-dasharray="3 2"/><path d="M34.25 0V30" stroke="#a39a92" stroke-width="1.5" stroke-dasharray="3 2"/><rect x="10.5" y="8" width="23" height="14" fill="#3d3530"/></svg>',
                sortOrder: 10,
                default: true,
                data: { appearance: 'contained' },
            },
            {
                code: 'full-width',
                label: $t('Full Width'),
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><path d="M9.75 0V30" stroke="#a39a92" stroke-width="1.5" stroke-dasharray="3 2"/><path d="M34.25 0V30" stroke="#a39a92" stroke-width="1.5" stroke-dasharray="3 2"/><rect y="8" width="44" height="14" fill="#3d3530"/><path d="M9.75 8V22" stroke="#fff" stroke-opacity=".75" stroke-width="1.5" stroke-dasharray="3 2"/><path d="M34.25 8V22" stroke="#fff" stroke-opacity=".75" stroke-width="1.5" stroke-dasharray="3 2"/></svg>',
                sortOrder: 20,
                data: { appearance: 'full-width' },
            },
            {
                code: 'full-bleed',
                label: $t('Full Bleed'),
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><path d="M2.25 0V30" stroke="#a39a92" stroke-width="1.5" stroke-dasharray="3 2"/><path d="M41.75 0V30" stroke="#a39a92" stroke-width="1.5" stroke-dasharray="3 2"/><rect y="8" width="44" height="14" fill="#3d3530"/><path d="M2.25 8V22" stroke="#fff" stroke-opacity=".75" stroke-width="1.5" stroke-dasharray="3 2"/><path d="M41.75 8V22" stroke="#fff" stroke-opacity=".75" stroke-width="1.5" stroke-dasharray="3 2"/></svg>',
                sortOrder: 30,
                data: { appearance: 'full-bleed' },
            },
        ]);

        presets.add('column-group', [
            {
                code: '1-1',
                label: '50/50',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><rect x=".75" y=".75" width="42.5" height="28.5" rx="3" stroke="#a39a92" stroke-width="1.5"/><rect x="4.5" y="4.5" width="16" height="21" rx="1" fill="#3d3530"/><rect x="23.5" y="4.5" width="16" height="21" rx="1" fill="#3d3530"/></svg>',
                sortOrder: 19,
                default: true,
            },
            {
                code: '1-2',
                label: '33/67',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><rect x=".75" y=".75" width="42.5" height="28.5" rx="3" stroke="#a39a92" stroke-width="1.5"/><rect x="4.5" y="4.5" width="10.67" height="21" rx="1" fill="#3d3530"/><rect x="18.17" y="4.5" width="21.33" height="21" rx="1" fill="#3d3530"/></svg>',
                sortOrder: 20,
                ...columns([1, 2]),
            },
            {
                code: '2-1',
                label: '67/33',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><rect x=".75" y=".75" width="42.5" height="28.5" rx="3" stroke="#a39a92" stroke-width="1.5"/><rect x="4.5" y="4.5" width="21.33" height="21" rx="1" fill="#3d3530"/><rect x="28.83" y="4.5" width="10.67" height="21" rx="1" fill="#3d3530"/></svg>',
                sortOrder: 21,
                ...columns([2, 1]),
            },
            {
                code: '1-1-1',
                label: $t('3 columns'),
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><rect x=".75" y=".75" width="42.5" height="28.5" rx="3" stroke="#a39a92" stroke-width="1.5"/><rect x="4.5" y="4.5" width="9.67" height="21" rx="1" fill="#3d3530"/><rect x="17.17" y="4.5" width="9.67" height="21" rx="1" fill="#3d3530"/><rect x="29.83" y="4.5" width="9.67" height="21" rx="1" fill="#3d3530"/></svg>',
                sortOrder: 30,
                ...columns([1, 1, 1]),
            },
            {
                code: '1-2-1',
                label: '25/50/25',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><rect x=".75" y=".75" width="42.5" height="28.5" rx="3" stroke="#a39a92" stroke-width="1.5"/><rect x="4.5" y="4.5" width="7.25" height="21" rx="1" fill="#3d3530"/><rect x="14.75" y="4.5" width="14.5" height="21" rx="1" fill="#3d3530"/><rect x="32.25" y="4.5" width="7.25" height="21" rx="1" fill="#3d3530"/></svg>',
                sortOrder: 35,
                ...columns([1, 2, 1]),
            },
            {
                code: '1-1-1-1',
                label: $t('4 columns'),
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><rect x=".75" y=".75" width="42.5" height="28.5" rx="3" stroke="#a39a92" stroke-width="1.5"/><rect x="4.5" y="4.5" width="7.25" height="21" rx="1" fill="#3d3530"/><rect x="13.75" y="4.5" width="7.25" height="21" rx="1" fill="#3d3530"/><rect x="23" y="4.5" width="7.25" height="21" rx="1" fill="#3d3530"/><rect x="32.25" y="4.5" width="7.25" height="21" rx="1" fill="#3d3530"/></svg>',
                sortOrder: 40,
                ...columns([1, 1, 1, 1]),
            },
        ]);

        presets.add('tabs', [
            {
                code: '2',
                label: $t('2 tabs'),
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><path d="M0 8V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" fill="#3d3530"/><path d="M14 8V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" fill="#d3ccc5"/><rect y="8" width="44" height="2" fill="#3d3530"/><path d="M.75 9v18a2.25 2.25 0 0 0 2.25 2.25h38a2.25 2.25 0 0 0 2.25-2.25V9" stroke="#3d3530" stroke-width="1.5"/><rect x="6.5" y="14" width="21.7" height="2" fill="#a39a92"/><rect x="6.5" y="19" width="14" height="2" fill="#a39a92"/></svg>',
                sortOrder: 10,
                default: true,
                children: tabs(2),
            },
            {
                code: '3',
                label: $t('3 tabs'),
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><path d="M0 8V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" fill="#3d3530"/><path d="M14 8V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" fill="#d3ccc5"/><path d="M28 8V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" fill="#d3ccc5"/><rect y="8" width="44" height="2" fill="#3d3530"/><path d="M.75 9v18a2.25 2.25 0 0 0 2.25 2.25h38a2.25 2.25 0 0 0 2.25-2.25V9" stroke="#3d3530" stroke-width="1.5"/><rect x="6.5" y="14" width="21.7" height="2" fill="#a39a92"/><rect x="6.5" y="19" width="14" height="2" fill="#a39a92"/></svg>',
                sortOrder: 20,
                children: tabs(3),
            },
        ]);

        presets.add('buttons', [
            {
                code: 'stacked',
                label: $t('Stacked'),
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><rect x="6" y="2.5" width="32" height="11" rx="5.5" fill="#3d3530"/><rect x="6" y="16.5" width="32" height="11" rx="5.5" fill="#3d3530"/></svg>',
                sortOrder: 10,
                data: { appearance: 'stacked' },
            },
            {
                code: 'inline',
                label: $t('Inline'),
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><rect y="9.5" width="20" height="11" rx="5.5" fill="#3d3530"/><rect x="24" y="9.5" width="20" height="11" rx="5.5" fill="#3d3530"/></svg>',
                sortOrder: 20,
                default: true,
                data: { appearance: 'inline' },
            },
        ]);

        presets.popular({
            text: 10,
            heading: 20,
            image: 30,
            banner: 40,
            buttons: 50,
        });

        presets.icons({
            'products': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><rect x="3" y="6" width="12" height="14" rx="1" fill="#3d3530"/><rect x="3" y="22" width="12" height="2" fill="#a39a92"/><rect x="3" y="26" width="8" height="2" fill="#a39a92"/><rect x="18" y="6" width="12" height="14" rx="1" fill="#3d3530"/><rect x="18" y="22" width="12" height="2" fill="#a39a92"/><rect x="18" y="26" width="8" height="2" fill="#a39a92"/><rect x="33" y="6" width="12" height="14" rx="1" fill="#3d3530"/><rect x="33" y="22" width="12" height="2" fill="#a39a92"/><rect x="33" y="26" width="8" height="2" fill="#a39a92"/></svg>',
            'melios-widget': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30" fill="none"><rect x="7.5" y="1.5" width="12" height="12" rx="3" fill="#3d3530"/><rect x="22.5" y="1.5" width="12" height="12" rx="3" fill="#3d3530"/><rect x="7.5" y="16.5" width="12" height="12" rx="3" fill="#3d3530"/><rect x="23.5" y="17.5" width="10" height="10" rx="2" stroke="#3d3530" stroke-width="2"/></svg>',
        });

        return presets;
    };
});
