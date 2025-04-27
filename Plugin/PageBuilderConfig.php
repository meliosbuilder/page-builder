<?php

namespace Melios\PageBuilder\Plugin;

use Magento\PageBuilder\Model\ConfigInterface;

class PageBuilderConfig
{
    /**
     * This code makes Magento to send "render/*_mobile_form" request when editing
     * pagebuilder component in mobile view even if there is no *_mobile_form.xml file
     */
    public function afterGetContentTypes(ConfigInterface $subject, array $result)
    {
        foreach ($result as &$contentType) {
            if (!isset($contentType['breakpoints']) &&
                isset($contentType['form']) &&
                str_starts_with($contentType['form'], 'pagebuilder_') &&
                str_ends_with($contentType['form'], '_form')
            ) {
                $contentType['breakpoints'] = [
                    'mobile' => [
                        'form' => str_replace('_form', '_mobile_form', $contentType['form']),
                    ],
                ];
            }
        }
        return $result;
    }
}
