<?php

namespace Melios\PageBuilder\Model\Tailwind;

use Magento\Framework\Exception\LocalizedException;

class ConfigValidator
{
    private const DISALLOWED_DIRECTIVES = '/@(import|source|plugin|config|reference)\b/i';

    /**
     * Reject config values that make the tailwindcss binary read or execute
     * files outside the generated temp directory.
     *
     * @throws LocalizedException
     */
    public function validate(string $config): void
    {
        if (preg_match(self::DISALLOWED_DIRECTIVES, $config, $matches)) {
            throw new LocalizedException(
                __(
                    'Tailwind config may not use the @%1 directive. '
                    . 'Only theme declarations are supported here.',
                    strtolower($matches[1])
                )
            );
        }
    }
}
