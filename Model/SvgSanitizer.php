<?php

namespace Melios\PageBuilder\Model;

use enshrined\svgSanitize\Sanitizer;
use Magento\Framework\App\ObjectManager;

class SvgSanitizer
{
    private Sanitizer $sanitizer;

    public function __construct()
    {
        $this->sanitizer = new Sanitizer();
    }

    public function sanitize($svg)
    {
        return $this->sanitizer->sanitize($svg);
    }
}
