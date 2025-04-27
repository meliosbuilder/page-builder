<?php

namespace Melios\PageBuilder\Plugin;

use Magento\PageBuilder\Model\ConfigInterface;

class PageBuilderConfig
{
    /**
     * This code makes Magento to send "*_mobile_form" render request when editing
     * pagebuilder component in mobile view.
     */
    public function afterGetContentTypes(ConfigInterface $subject, array $result)
    {
        foreach ($result as &$contentType) {
            if (!isset($contentType['breakpoints']) && isset($contentType['form'])) {
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
