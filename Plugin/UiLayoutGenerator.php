<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\Stdlib\ArrayManager;
use Magento\Framework\View\Element\UiComponentInterface;
use Magento\Framework\View\Layout\Generator\Structure;

class UiLayoutGenerator
{
    public function __construct(
        private ArrayManager $arrayManager
    ) {
    }

    public function afterGenerate(
        Structure $subject,
        $result,
        UiComponentInterface $component
    ) {
        $fieldsToUnset = [
            'pagebuilder_image_form' => [
                'general/children/image_attribute_width',
                'general/children/image_attribute_height',
                'general/children/mobile_image_attribute_width',
                'general/children/mobile_image_attribute_height',
            ],
        ];

        foreach ($fieldsToUnset as $component => $paths) {
            if (!isset($result['components'][$component])) {
                continue;
            }

            $prefix = "components/{$component}/children/{$component}/children/";
            foreach ($paths as $path) {
                $result = $this->arrayManager->remove($prefix . $path, $result);
            }
        }

        return $result;
    }
}
