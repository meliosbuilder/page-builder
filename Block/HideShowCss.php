<?php

namespace Melios\PageBuilder\Block;

use Magento\Framework\View\ConfigInterface as ViewConfig;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;

class HideShowCss extends Template
{
    public function __construct(
        Context $context,
        private ViewConfig $viewConfig,
        array $data = []
    ) {
        parent::__construct($context, $data);
    }

    // Media query per breakpoint name, built out of the view.xml "conditions"
    public function getBreakpointMediaQueries(): array
    {
        $breakpoints = $this->viewConfig->getViewConfig()->getVarValue(
            'Magento_PageBuilder',
            'breakpoints'
        );

        if (!is_array($breakpoints)) {
            return [];
        }

        $result = [];

        foreach ($breakpoints as $name => $breakpoint) {
            // Goes into a css attribute selector, where html escaping would not be decoded
            $name = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$name);
            $conditions = $breakpoint['conditions'] ?? [];

            if (!$name || !$conditions) {
                continue;
            }

            $query = [];

            foreach ($conditions as $feature => $value) {
                $query[] = sprintf('(%s: %s)', $feature, $value);
            }

            $result[$name] = 'screen and ' . implode(' and ', $query);
        }

        return $result;
    }
}
