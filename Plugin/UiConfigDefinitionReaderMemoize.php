<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\View\DesignInterface;
use Magento\Ui\Config\Reader\Definition;

/**
 * Per-request memoization of UI component definition.xml reads.
 *
 * Magento\Ui\Config\Reader calls the raw (uncached) Definition reader for
 * every form and every "extends" level, merging and validating all
 * definition.xml files each time (100+ times on a cold PageBuilder load).
 */
class UiConfigDefinitionReaderMemoize
{
    private \WeakMap $results;

    public function __construct(
        private DesignInterface $design
    ) {
        $this->results = new \WeakMap();
    }

    public function aroundRead(Definition $subject, callable $proceed, $scope = null)
    {
        $theme = $this->design->getDesignTheme();
        $key = json_encode([$theme->getThemePath(), $theme->getArea(), $scope ?: 'global']);

        $results = $this->results[$subject] ?? [];
        if (!array_key_exists($key, $results)) {
            $results[$key] = $proceed($scope);
            $this->results[$subject] = $results;
        }

        return $results[$key];
    }
}
