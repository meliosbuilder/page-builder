<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\App\RequestInterface;
use Magento\Framework\File\Uploader;

class FileUploaderAllowSubdirAndOverwrite
{
    public function __construct(
        private RequestInterface $request
    ) {
    }

    public function beforeSetAllowRenameFiles(Uploader $subject, $flag)
    {
        if (!$flag) {
            return [$flag];
        }

        if ($this->request->getParam('melios_allow_overwrite')) {
            return false;
        }

        return [$flag];
    }

    public function beforeSave(Uploader $subject, $dir)
    {
        if (!str_ends_with($dir, '/media/wysiwyg')) {
            return [$dir];
        }

        $target = $this->request->getParam('target_folder');
        if ($target && !str_contains($target, '..')) {
            // $dir ends with '/wysiwyg' - remove it from the $target
            if (str_starts_with($target, 'wysiwyg')) {
                $target = substr($target, strlen('wysiwyg'));
            }
            return [$dir . '/' . trim($target, '/')];
        }

        return [$dir];
    }
}
