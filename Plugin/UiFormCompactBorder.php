<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\View\Element\UiComponentInterface;
use Magento\Framework\View\Layout\Generator\Structure;

/**
 * Page Builder forms, "Advanced" fieldset:
 *  - Border: width | style | color in one row (existing fields are moved, not redefined)
 *  - Border Radius: range slider
 */
class UiFormCompactBorder
{
    public function afterGenerate(
        Structure $subject,
        $result,
        UiComponentInterface $component
    ) {
        foreach ($result['components'] ?? [] as $name => $form) {
            if (!str_starts_with($name, 'pagebuilder_')) {
                continue;
            }

            $fields = $result['components'][$name]['children'][$name]['children']['advanced']['children'] ?? [];
            if (!isset($fields['border'], $fields['border_width'], $fields['border_color'])) {
                continue;
            }

            $group = [];
            $keys = ['border_width', 'border', 'border_color'];
            $sortOrder = min(array_map(fn ($key) => (int) ($fields[$key]['config']['sortOrder'] ?? 0), $keys));
            foreach ($keys as $i => $key) {
                $group[$key] = $fields[$key];
                $group[$key]['config']['sortOrder'] = $sortOrder + $i;
                unset($fields[$key]);
            }
            $group['border_width']['config']['placeholder'] = '';
            $group['border_color']['config']['additionalClasses'] = ['mls-color-swatch' => true];

            $fields['border_group'] = [
                'type' => 'container',
                'name' => 'border_group',
                'children' => $group,
                'config' => [
                    'component' => 'Magento_Ui/js/form/components/group',
                    'label' => (string) __('Border'),
                    'sortOrder' => $sortOrder,
                    'breakLine' => false,
                ],
            ];

            if (isset($fields['border_radius'])) {
                $config = $fields['border_radius']['config'];
                $config['unit'] = $config['addafter'] ?? 'px';
                unset($config['addafter']);
                unset($config['additionalClasses']['admin__field-small']);
                $fields['border_radius']['config'] = array_merge($config, [
                    'label' => (string) __('Radius'),
                    'placeholder' => '',
                    'component' => 'Melios_PageBuilder/js/form/element/range',
                    'elementTmpl' => 'Melios_PageBuilder/form/element/range',
                    'min' => 0,
                    'max' => 100,
                    'step' => 1,
                ]);
            }

            $result['components'][$name]['children'][$name]['children']['advanced']['children'] = $fields;
        }

        return $result;
    }
}
