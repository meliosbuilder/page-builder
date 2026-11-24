<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\View\Element\UiComponentInterface;
use Magento\Framework\View\Layout\Generator\Structure;

/**
 * Page Builder forms: visual selects with text options (Top | Center | Bottom, Appearance)
 * render as pills, plus a dropdown that replaces them in a narrow panel
 * when the options' text is too long to fit.
 */
class UiFormVisualSelect
{
    private const CORE_TEMPLATE = 'Magento_PageBuilder/form/element/visual-select';
    private const TEMPLATE = 'Melios_PageBuilder/form/element/visual-select';
    // Narrow panel fits about this many characters of pills (text + padding)
    private const MAX_PILLS_CHARS = 36;
    // Pill padding and gap, in characters
    private const OPTION_EXTRA_CHARS = 4;

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
            if ($this->isTextSelect($child['config'] ?? [])) {
                $child['config']['elementTmpl'] = self::TEMPLATE;
                if ($this->estimateWidth($child['config']['options']) > self::MAX_PILLS_CHARS) {
                    $child['config']['additionalClasses'] = $this->addClass(
                        $child['config']['additionalClasses'] ?? [],
                        'mls-visual-select-many'
                    );
                }
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
            if (!in_array($option['size'] ?? '', ['small', 'large'], true)
                || (string) ($option['title'] ?? '') === ''
            ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Width of the pills in characters. Titles are already translated, so it works for any locale.
     */
    private function estimateWidth(array $options): int
    {
        $width = 0;
        foreach ($options as $option) {
            $width += mb_strlen((string) $option['title']) + self::OPTION_EXTRA_CHARS;
        }

        return $width;
    }

    private function addClass($classes, string $class)
    {
        if (is_string($classes)) {
            return trim($classes . ' ' . $class);
        }

        $classes[$class] = true;

        return $classes;
    }
}
