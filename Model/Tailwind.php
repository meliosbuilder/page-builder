<?php

namespace Melios\PageBuilder\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Melios\PageBuilder\Model\Tailwind\ConfigValidator;
use TailwindPHP\tw;

class Tailwind
{
    private bool $important = true;
    private bool $minify = true;

    public function __construct(
        private ScopeConfigInterface $scopeConfig,
        private ConfigValidator $configValidator
    ) {
    }

    public function run($html): string
    {
        $css = tw::generate([
            'content' => $html,
            'css' => $this->input(),
            'minify' => true,
        ]);

        return str_ireplace('</style', '\\3c /style', $css);
    }

    public function input()
    {
        $twConfig = (string) $this->scopeConfig->getValue('melios_builder/tailwind/config');
        $suffix = $this->important ? 'important' : '';

        $this->configValidator->validate($twConfig);

        return <<<CSS
        @import 'tailwindcss/theme.css';
        @scope {
            @import 'tailwindcss/utilities.css' source(none) {$suffix};
        }
        {$twConfig}
        CSS;
    }

    /** @deprecated */
    public function exists()
    {
        return true;
    }

    public function important($flag)
    {
        $this->important = $flag;
        return $this;
    }

    public function minify($flag)
    {
        $this->minify = $flag;
        return $this;
    }
}
