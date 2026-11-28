<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\View\Element\UiComponentInterface;
use Magento\Framework\View\Layout\Generator\Structure;

/**
 * Page Builder forms: visual selects with text options (Top | Center | Bottom, Appearance)
 * and short plain selects (Never | On Hover | Always) render as pills, plus a dropdown
 * that replaces them in a narrow panel when the options' text is too long to fit
 * (counted in the template).
 */
class UiFormVisualSelect
{
    private const CORE_TEMPLATE = 'Magento_PageBuilder/form/element/visual-select';
    private const CORE_COMPONENT = 'Magento_PageBuilder/js/form/element/visual-select';
    private const TEMPLATE = 'Melios_PageBuilder/form/element/visual-select';

    public function afterGenerate(
        Structure $subject,
        $result,
        UiComponentInterface $component
    ) {
        foreach ($result['components'] ?? [] as $name => $form) {
            if (!str_starts_with($name, 'pagebuilder_') || !isset($form['children'][$name])) {
                continue;
            }

            $result['components'][$name]['children'][$name] = $this->process($form['children'][$name]);
        }

        return $result;
    }

    private function process(array $node): array
    {
        foreach ($node['children'] ?? [] as $key => $child) {
            if ($this->isShortSelect($child['config'] ?? [])) {
                // Core visual select keeps the '' option (Default) as a pill,
                // plain select turns it into a caption
                $child['config']['component'] = self::CORE_COMPONENT;
                $child['config']['elementTmpl'] = self::CORE_TEMPLATE;
                foreach ($child['config']['options'] as &$option) {
                    $option['title'] ??= (string) $option['label'];
                }
                unset($option);
            }

            if ($this->isTextSelect($child['config'] ?? [])) {
                $child['config']['elementTmpl'] = self::TEMPLATE;
                // Options defined inline in xml have no size (core source model defaults to 'small')
                foreach ($child['config']['options'] as &$option) {
                    $option['size'] ??= 'small';
                }
                unset($option);
                // Row label like other fields: instant preview only, the classic form has the fieldset title
                if ($key === 'appearance' && empty($child['config']['label'])) {
                    $child['config']['label'] = (string) __('Appearance');
                }
            }

            $node['children'][$key] = $this->process($child);
        }

        return $node;
    }

    private function isTextSelect(array $config): bool
    {
        if (($config['elementTmpl'] ?? '') !== self::CORE_TEMPLATE || empty($config['options'])) {
            return false;
        }

        foreach ($config['options'] as $option) {
            if ((string) ($option['title'] ?? '') === '') {
                return false;
            }
        }

        return true;
    }

    private function isShortSelect(array $config): bool
    {
        if (($config['component'] ?? '') !== 'Magento_Ui/js/form/element/select'
            || ($config['elementTmpl'] ?? 'ui/form/element/select') !== 'ui/form/element/select'
            || !empty($config['caption'])
            || !empty($config['customEntry'])
            || empty($config['options'])
            || count($config['options']) > 6
        ) {
            return false;
        }

        $width = 0;
        foreach ($config['options'] as $option) {
            $label = trim((string) ($option['label'] ?? ''));
            if ($label === ''
                || !is_scalar($option['value'] ?? null) // optgroup
                || str_starts_with($label, '-')
                || stripos($label, 'please select') !== false
            ) {
                return false;
            }
            $width += mb_strlen($label) + 4;
        }

        return $width <= 48;
    }
}
