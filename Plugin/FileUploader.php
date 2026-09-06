<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\File\Uploader;
use Melios\PageBuilder\Model\SvgSanitizer;

class FileUploader
{
    private $extensions = [
        'avif',
        'svg',
        'svg+xml',
        'webp',
    ];

    public function __construct(
        private SvgSanitizer $svgSanitizer
    ) {
    }

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

    public function beforeSave(Uploader $subject, $destinationFolder, $newFileName = null)
    {
        if (!$this->isSvg($subject->getFileExtension()) &&
            !($newFileName && $this->isSvg(pathinfo($newFileName, PATHINFO_EXTENSION)))
        ) {
            return;
        }

        $subject->addValidateCallback('melios_svg_sanitizer', $this->svgSanitizer, 'sanitizeFile');
    }

    private function isSvg($extension): bool
    {
        return strtolower((string) $extension) === 'svg';
    }
}
