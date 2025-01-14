<?php

namespace Melios\PageBuilder\Plugin;

use Magento\PageBuilder\Model\Config\ContentType\Reader;

class ContentTypeReader
{
    /**
     * Add background-image loading attributes to all content_types having 'background_images'
     */
    public function afterRead(Reader $subject, $result)
    {
        $loadingAttributes = $this->getBackgroundLoadingAttributes();

        foreach ($result['types'] ?? [] as $typeKey => $type) {
            foreach ($type['appearances'] ?? [] as $appearanceKey => $appearance) {
                foreach ($appearance['elements'] as $elementKey => $element) {
                    $canAddLoading = false;

                    foreach ($element['attributes'] as $attribute) {
                        if (isset($attribute['var']) && $attribute['var'] === 'background_images') {
                            $canAddLoading = true;
                            break;
                        }
                    }

                    if ($canAddLoading) {
                        $result['types'][$typeKey]
                            ['appearances'][$appearanceKey]
                            ['elements'][$elementKey]['attributes']
                            = array_merge(
                                $result['types'][$typeKey]['appearances'][$appearanceKey]
                                ['elements'][$elementKey]['attributes'],
                                $loadingAttributes
                            );
                    }
                }
            }
        }

        return $result;
    }

    private function getBackgroundLoadingAttributes()
    {
        $attributes = [[
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
        ]];

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
