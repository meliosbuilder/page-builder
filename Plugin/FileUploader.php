<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\File\Uploader;

class FileUploader
{
    private $extensions = [
        'avif',
        'webp',
    ];

    public function beforeSetAllowedExtensions(Uploader $subject, $extensions)
    {
        if (!$extensions) {
            return;
        }

        $extensions = array_unique(array_merge($extensions, $this->extensions));

        return [$extensions];
    }

    public function beforeCheckMimeType(Uploader $subject, $validTypes)
    {
        if (!$validTypes) {
            return;
        }

        $mimeTypes = [];
        foreach ($this->extensions as $extension) {
            $mimeTypes[] = 'image/' . $extension;
        }

        $validTypes = array_unique(array_merge($validTypes, $mimeTypes));

        return [$validTypes];
    }
}
