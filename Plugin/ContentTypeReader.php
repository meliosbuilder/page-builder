<?php

namespace Melios\PageBuilder\Plugin;

use Magento\PageBuilder\Model\Config\ContentType\Reader;

class ContentTypeReader
{
    /**
     * Inject extra attributes into content types:
     *  - background-image loading attributes for elements having a 'background_images' attribute
     *  - per-breakpoint visibility attribute for elements having a 'display' style
     */
    public function afterRead(Reader $subject, $result)
    {
        $loadingAttributes = $this->getBackgroundLoadingAttributes();
        $visibilityAttributes = $this->getBreakpointVisibilityAttributes();

        foreach ($result['types'] ?? [] as $typeKey => $type) {
            foreach ($type['appearances'] ?? [] as $appearanceKey => $appearance) {
                foreach ($appearance['elements'] as $elementKey => $element) {
                    $extraAttributes = [];

                    foreach ($element['attributes'] ?? [] as $attribute) {
                        if (isset($attribute['var']) && $attribute['var'] === 'background_images') {
                            $extraAttributes = array_merge($extraAttributes, $loadingAttributes);
                            break;
                        }
                    }

                    foreach ($element['style'] ?? [] as $style) {
                        if (isset($style['var']) && $style['var'] === 'display') {
                            $extraAttributes = array_merge($extraAttributes, $visibilityAttributes);
                            break;
                        }
                    }

                    if (!$extraAttributes) {
                        continue;
                    }

                    $result['types'][$typeKey]
                        ['appearances'][$appearanceKey]
                        ['elements'][$elementKey]['attributes']
                        = array_merge(
                            $result['types'][$typeKey]['appearances'][$appearanceKey]
                            ['elements'][$elementKey]['attributes'] ?? [],
                            $extraAttributes
                        );
                }
            }
        }

        return $result;
    }

    private function getBackgroundLoadingAttributes()
    {
        return $this->withDefaults([[
            'var' => 'loading_mode',
            'persistence_mode' => 'read',
            'reader' => 'Melios_PageBuilder/js/image-background/content-type/loading-mode-reader',
        ], [
            'var' => 'loading_mode',
            'name' => 'data-mls-loading',
            'converter' => 'Melios_PageBuilder/js/image/content-type/loading-converter',
            'persistence_mode' => 'write',
        ], [
            'var' => 'loading_mode',
            'name' => 'data-mls-preload',
            'converter' => 'Melios_PageBuilder/js/image/content-type/preload-converter',
            'persistence_mode' => 'write',
        ], [
            'var' => 'use_mobile_loading_mode',
            'name' => 'data-mls-use-sm-loading',
        ], [
            'var' => 'mobile_loading_mode',
            'persistence_mode' => 'read',
            'reader' => 'Melios_PageBuilder/js/image-background/content-type/loading-mode-reader-sm',
        ], [
            'var' => 'mobile_loading_mode',
            'name' => 'data-mls-sm-loading',
            'converter' => 'Melios_PageBuilder/js/image/content-type/loading-converter',
            'persistence_mode' => 'write',
        ], [
            'var' => 'mobile_loading_mode',
            'name' => 'data-mls-sm-preload',
            'converter' => 'Melios_PageBuilder/js/image/content-type/preload-converter',
            'persistence_mode' => 'write',
        ]]);
    }

    private function getBreakpointVisibilityAttributes()
    {
        return $this->withDefaults([[
            'var' => 'mls_hidden',
            'name' => 'data-mls-hidden',
            'converter' => 'Melios_PageBuilder/js/hide-show/converter',
        ]]);
    }

    private function withDefaults(array $attributes)
    {
        foreach ($attributes as $key => $values) {
            $attributes[$key] = array_merge([
                'name' => '',
                'converter' => '',
                'preview_converter' => '',
                'persistence_mode' => 'readwrite',
                'reader' => 'Magento_PageBuilder/js/property/attribute-reader',
            ], $values);
        }

        return $attributes;
    }
}
