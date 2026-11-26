<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\View\Element\UiComponentInterface;
use Magento\Framework\View\Layout\Generator\Structure;

class UiFormImagePicker
{
    private const CORE_TEMPLATES = [
        'ui/form/element/uploader/image',
        'Magento_PageBuilder/form/element/uploader/image', // video fallback image
    ];
    private const TEMPLATE = 'Melios_PageBuilder/form/element/uploader/image-picker';

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
            if (in_array($child['config']['template'] ?? '', self::CORE_TEMPLATES, true)) {
                $child['config']['template'] = self::TEMPLATE;
            }

            $node['children'][$key] = $this->process($child);
        }

        return $node;
    }
}
