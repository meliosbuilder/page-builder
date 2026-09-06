<?php

namespace Melios\PageBuilder\Model;

use enshrined\svgSanitize\Sanitizer;
use Magento\Framework\Validation\ValidationException;
use Magento\Framework\Filesystem\Driver\File as FileDriver;

class SvgSanitizer
{
    private Sanitizer $sanitizer;

    public function __construct(
        private FileDriver $fileDriver
    ) {
        $this->sanitizer = new Sanitizer();
    }

    public function sanitize($svg)
    {
        return $this->sanitizer->sanitize($svg);
    }

    public function sanitizeFile($path)
    {
        $dirtySvg = $this->fileDriver->fileGetContents($path);
        $cleanSvg = $this->sanitize($dirtySvg);

        if ($cleanSvg === false) {
            throw new ValidationException(
                __('The SVG file is not a valid XML document and could not be sanitized.')
            );
        }

        if ($cleanSvg !== $dirtySvg) {
            $this->fileDriver->filePutContents($path, $cleanSvg);
        }
    }
}
