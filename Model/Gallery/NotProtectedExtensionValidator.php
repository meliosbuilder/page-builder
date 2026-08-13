<?php

namespace Melios\PageBuilder\Model\Gallery;

use Magento\MediaStorage\Model\File\Validator\NotProtectedExtension;

class NotProtectedExtensionValidator extends NotProtectedExtension
{
    public function getProtectedFileExtensions($store = null)
    {
        $result = parent::getProtectedFileExtensions($store);

        unset($result['svg']);

        return $result;
    }
}
