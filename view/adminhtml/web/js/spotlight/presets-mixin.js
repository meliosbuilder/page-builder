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

        presets.add('heading', [
            {
                code: 'h1',
                label: 'H1',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30"><path transform="translate(7)" fill="#3d3530" d="M9.13 23L0.59 23Q0.36 23 0.24 22.73Q0.12 22.45 0.12 22.30L0.12 22.30Q0.12 21.85 0.57 21.80L0.57 21.80Q1.23 21.74 1.83 21.56Q2.43 21.37 2.43 20.92L2.43 20.92L2.43 6.13Q2.43 5.54 2.12 5.27Q1.80 5.01 1.36 4.92Q0.92 4.83 0.49 4.80L0.49 4.80Q0.21 4.78 0.10 4.69Q0 4.60 0 4.30L0 4.30Q0 4.15 0.12 3.87Q0.23 3.60 0.46 3.60L0.46 3.60L9.01 3.60Q9.24 3.60 9.36 3.87Q9.47 4.15 9.47 4.30L9.47 4.30Q9.47 4.75 9.02 4.80L9.02 4.80Q8.33 4.86 7.68 5.04Q7.04 5.23 7.04 5.68L7.04 5.68L7.04 11.87L15.76 11.87L15.76 6.13Q15.76 5.54 15.42 5.28Q15.07 5.02 14.59 4.93Q14.11 4.84 13.69 4.80L13.69 4.80Q13.40 4.78 13.30 4.69Q13.19 4.60 13.19 4.30L13.19 4.30Q13.19 4.15 13.31 3.87Q13.43 3.60 13.66 3.60L13.66 3.60L22.34 3.60Q22.57 3.60 22.69 3.87Q22.80 4.15 22.80 4.30L22.80 4.30Q22.80 4.75 22.35 4.80L22.35 4.80Q21.66 4.86 21.01 5.04Q20.37 5.23 20.37 5.68L20.37 5.68L20.37 20.47Q20.37 21.06 20.71 21.32Q21.05 21.58 21.54 21.66Q22.03 21.74 22.44 21.80L22.44 21.80Q22.72 21.82 22.83 21.91Q22.93 21.99 22.93 22.30L22.93 22.30Q22.93 22.45 22.81 22.73Q22.70 23 22.46 23L22.46 23L13.78 23Q13.55 23 13.43 22.73Q13.32 22.45 13.32 22.30L13.32 22.30Q13.32 21.85 13.77 21.80L13.77 21.80Q14.42 21.74 15.09 21.56Q15.76 21.37 15.76 20.92L15.76 20.92L15.76 13.54L7.04 13.54L7.04 20.47Q7.04 21.06 7.38 21.33Q7.72 21.59 8.21 21.67Q8.70 21.76 9.11 21.80L9.11 21.80Q9.39 21.82 9.50 21.91Q9.60 21.99 9.60 22.30L9.60 22.30Q9.60 22.45 9.48 22.73Q9.37 23 9.13 23L9.13 23ZM29.70 23L25.22 23Q25.11 23 25.06 22.90Q25.00 22.81 25.00 22.74L25.00 22.74Q25.00 22.64 25.05 22.56Q25.09 22.47 25.21 22.46L25.21 22.46Q25.42 22.44 25.71 22.40Q26.00 22.36 26.23 22.28Q26.45 22.19 26.45 22.05L26.45 22.05L26.46 16.85Q26.19 17.06 25.87 17.20Q25.56 17.33 25.34 17.33L25.34 17.33Q25.13 17.33 25.06 17.16Q24.99 17.00 24.99 16.93L24.99 16.93Q24.99 16.78 25.04 16.61Q25.09 16.45 25.22 16.44L25.22 16.44Q25.37 16.43 25.66 16.33Q25.94 16.23 26.27 16.08Q26.60 15.94 26.87 15.77Q27.15 15.60 27.27 15.45L27.27 15.45L28.53 15.45L28.53 21.84Q28.53 22.07 28.68 22.20Q28.84 22.33 29.10 22.39Q29.36 22.45 29.68 22.46L29.68 22.46Q29.82 22.47 29.86 22.53Q29.91 22.59 29.91 22.74L29.91 22.74Q29.91 22.81 29.86 22.90Q29.80 23 29.70 23L29.70 23Z"/></svg>',
                sortOrder: 10,
                data: { heading_type: 'h1' },
            },
            {
                code: 'h2',
                label: 'H2',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30"><path transform="translate(8)" fill="#3d3530" d="M7.50 23L0.48 23Q0.29 23 0.20 22.78Q0.10 22.55 0.10 22.43L0.10 22.43Q0.10 22.06 0.47 22.01L0.47 22.01Q1.01 21.97 1.50 21.82Q2.00 21.66 2.00 21.29L2.00 21.29L2.00 9.14Q2.00 8.66 1.74 8.44Q1.48 8.22 1.12 8.15Q0.75 8.07 0.40 8.05L0.40 8.05Q0.17 8.03 0.08 7.96Q0 7.88 0 7.64L0 7.64Q0 7.51 0.10 7.29Q0.19 7.06 0.38 7.06L0.38 7.06L7.40 7.06Q7.59 7.06 7.69 7.29Q7.78 7.51 7.78 7.64L7.78 7.64Q7.78 8.01 7.41 8.05L7.41 8.05Q6.84 8.10 6.31 8.25Q5.78 8.40 5.78 8.77L5.78 8.77L5.78 13.86L12.95 13.86L12.95 9.14Q12.95 8.66 12.66 8.45Q12.38 8.23 11.98 8.16Q11.59 8.09 11.24 8.05L11.24 8.05Q11.01 8.03 10.92 7.96Q10.84 7.88 10.84 7.64L10.84 7.64Q10.84 7.51 10.93 7.29Q11.03 7.06 11.22 7.06L11.22 7.06L18.35 7.06Q18.54 7.06 18.64 7.29Q18.73 7.51 18.73 7.64L18.73 7.64Q18.73 8.01 18.36 8.05L18.36 8.05Q17.79 8.10 17.26 8.25Q16.73 8.40 16.73 8.77L16.73 8.77L16.73 20.92Q16.73 21.41 17.01 21.62Q17.29 21.83 17.69 21.90Q18.09 21.97 18.43 22.01L18.43 22.01Q18.67 22.03 18.75 22.10Q18.83 22.17 18.83 22.43L18.83 22.43Q18.83 22.55 18.74 22.78Q18.64 23 18.45 23L18.45 23L11.32 23Q11.13 23 11.03 22.78Q10.94 22.55 10.94 22.43L10.94 22.43Q10.94 22.06 11.31 22.01L11.31 22.01Q11.85 21.97 12.40 21.82Q12.95 21.66 12.95 21.29L12.95 21.29L12.95 15.23L5.78 15.23L5.78 20.92Q5.78 21.41 6.06 21.62Q6.35 21.84 6.74 21.91Q7.14 21.98 7.48 22.01L7.48 22.01Q7.72 22.03 7.80 22.10Q7.88 22.17 7.88 22.43L7.88 22.43Q7.88 22.55 7.79 22.78Q7.69 23 7.50 23L7.50 23ZM27.27 23L20.59 23L20.59 22.80Q20.59 22.71 20.63 22.60Q20.67 22.50 20.74 22.44L20.74 22.44Q21.42 21.90 22.15 21.37Q22.88 20.84 23.50 20.28Q24.12 19.71 24.50 19.06Q24.89 18.40 24.89 17.60L24.89 17.60Q24.89 17.28 24.78 16.90Q24.67 16.51 24.40 16.24Q24.13 15.96 23.64 15.96L23.64 15.96Q23.29 15.96 23.08 16.07Q22.88 16.18 22.77 16.34Q22.67 16.50 22.62 16.64L22.62 16.64L22.19 17.78Q22.13 17.99 22.02 18.18Q21.90 18.37 21.57 18.37L21.57 18.37Q21.33 18.37 21.10 18.28Q20.87 18.19 20.71 17.99Q20.56 17.80 20.56 17.50Q20.56 17.20 20.74 16.83L20.74 16.83Q20.93 16.45 21.37 16.11Q21.81 15.78 22.45 15.56Q23.08 15.35 23.85 15.35L23.85 15.35Q25.50 15.35 26.30 15.93Q27.10 16.51 27.10 17.60L27.10 17.60Q27.10 18.25 26.73 18.80Q26.37 19.36 25.77 19.82Q25.17 20.29 24.46 20.68Q23.75 21.08 23.07 21.42L23.07 21.42L27.33 21.42L27.27 23Z"/></svg>',
                sortOrder: 20,
                data: { heading_type: 'h2' },
            },
            {
                code: 'h3',
                label: 'H3',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 30"><path transform="translate(10)" fill="#3d3530" d="M5.87 23L0.38 23Q0.23 23 0.15 22.82Q0.08 22.65 0.08 22.55L0.08 22.55Q0.08 22.26 0.37 22.23L0.37 22.23Q0.79 22.19 1.18 22.07Q1.56 21.95 1.56 21.66L1.56 21.66L1.56 12.15Q1.56 11.78 1.36 11.60Q1.16 11.43 0.87 11.38Q0.59 11.32 0.32 11.30L0.32 11.30Q0.13 11.28 0.07 11.23Q0 11.17 0 10.98L0 10.98Q0 10.88 0.07 10.70Q0.15 10.53 0.30 10.53L0.30 10.53L5.79 10.53Q5.94 10.53 6.02 10.70Q6.09 10.88 6.09 10.98L6.09 10.98Q6.09 11.27 5.80 11.30L5.80 11.30Q5.35 11.34 4.94 11.46Q4.53 11.57 4.53 11.86L4.53 11.86L4.53 15.85L10.13 15.85L10.13 12.15Q10.13 11.78 9.91 11.61Q9.69 11.44 9.38 11.39Q9.07 11.33 8.80 11.30L8.80 11.30Q8.61 11.28 8.55 11.23Q8.48 11.17 8.48 10.98L8.48 10.98Q8.48 10.88 8.56 10.70Q8.63 10.53 8.78 10.53L8.78 10.53L14.36 10.53Q14.51 10.53 14.59 10.70Q14.66 10.88 14.66 10.98L14.66 10.98Q14.66 11.27 14.37 11.30L14.37 11.30Q13.92 11.34 13.51 11.46Q13.10 11.57 13.10 11.86L13.10 11.86L13.10 21.37Q13.10 21.75 13.32 21.92Q13.54 22.09 13.85 22.14Q14.16 22.19 14.42 22.23L14.42 22.23Q14.61 22.24 14.67 22.30Q14.74 22.35 14.74 22.55L14.74 22.55Q14.74 22.65 14.66 22.82Q14.59 23 14.44 23L14.44 23L8.86 23Q8.71 23 8.64 22.82Q8.56 22.65 8.56 22.55L8.56 22.55Q8.56 22.26 8.85 22.23L8.85 22.23Q9.27 22.19 9.70 22.07Q10.13 21.95 10.13 21.66L10.13 21.66L10.13 16.92L4.53 16.92L4.53 21.37Q4.53 21.75 4.75 21.92Q4.97 22.09 5.28 22.15Q5.59 22.20 5.85 22.23L5.85 22.23Q6.04 22.24 6.10 22.30Q6.17 22.35 6.17 22.55L6.17 22.55Q6.17 22.65 6.10 22.82Q6.02 23 5.87 23L5.87 23ZM19.02 25.49L19.02 25.49Q18.42 25.49 17.87 25.35Q17.32 25.22 16.89 24.96Q16.46 24.71 16.21 24.34Q15.96 23.97 15.96 23.50L15.96 23.50Q15.96 23.09 16.14 22.82Q16.32 22.54 16.56 22.40Q16.80 22.26 16.98 22.26L16.98 22.26Q17.40 22.26 17.59 22.40Q17.78 22.55 17.82 22.71L17.82 22.71L17.42 24.25L17.57 24.41Q17.72 24.57 18.06 24.73Q18.39 24.89 18.96 24.89L18.96 24.89Q19.89 24.89 20.35 24.28Q20.82 23.67 20.82 22.71L20.82 22.71Q20.82 22.07 20.67 21.65Q20.52 21.22 20.25 20.97Q19.98 20.72 19.61 20.61Q19.25 20.51 18.82 20.51L18.82 20.51L18.23 20.51Q18.15 20.51 18.11 20.44Q18.07 20.38 18.07 20.15L18.07 20.15Q18.07 19.93 18.11 19.86Q18.15 19.79 18.23 19.79L18.23 19.79L18.69 19.79Q19.03 19.79 19.35 19.67Q19.68 19.55 19.94 19.31Q20.21 19.06 20.37 18.68Q20.52 18.30 20.52 17.79L20.52 17.79Q20.52 17.55 20.46 17.24Q20.40 16.93 20.25 16.64Q20.09 16.35 19.81 16.16Q19.53 15.97 19.10 15.97L19.10 15.97Q18.88 15.97 18.69 16.03Q18.49 16.09 18.33 16.23Q18.18 16.38 18.05 16.64L18.05 16.64Q17.95 16.93 17.88 17.23Q17.80 17.52 17.73 17.71L17.73 17.71Q17.64 17.97 17.45 18.09Q17.27 18.21 17.06 18.21L17.06 18.21Q16.84 18.21 16.63 18.09Q16.42 17.98 16.28 17.78Q16.14 17.57 16.14 17.31L16.14 17.31Q16.14 16.87 16.41 16.52Q16.67 16.16 17.13 15.90Q17.59 15.64 18.18 15.49Q18.76 15.35 19.39 15.35L19.39 15.35Q20.92 15.35 21.78 15.99Q22.63 16.63 22.63 17.67L22.63 17.67Q22.63 18.16 22.46 18.57Q22.30 18.99 21.99 19.31Q21.69 19.62 21.27 19.83Q20.86 20.04 20.38 20.11L20.38 20.11Q21.20 20.11 21.83 20.41Q22.45 20.71 22.80 21.25Q23.15 21.79 23.15 22.54L23.15 22.54Q23.15 23.34 22.68 24.01Q22.22 24.68 21.30 25.09Q20.38 25.49 19.02 25.49Z"/></svg>',
                sortOrder: 30,
                data: { heading_type: 'h3' },
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
