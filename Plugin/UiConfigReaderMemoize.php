<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\View\DesignInterface;
use Magento\Ui\Config\Reader;

/**
 * Per-request memoization of UI component XML reads.
 *
 * Magento\Ui\Config\Reader re-reads, re-validates and re-converts the whole
 * "extends" chain for every form (pagebuilder_base_form is parsed dozens of
 * times while building PageBuilder config on a cold cache). The result depends
 * only on the reader's arguments and the files collected for the current
 * design theme, so it is safe to reuse within a request.
 */
class UiConfigReaderMemoize
{
    private array $results = [];

    public function __construct(
        private DesignInterface $design
    ) {
    }

    public function aroundRead(Reader $subject, callable $proceed, $scope = null)
    {
        $key = $this->getKey($subject, $scope);
        if ($key === null) {
            return $proceed($scope);
        }

        if (!array_key_exists($key, $this->results)) {
            $this->results[$key] = $proceed($scope);
        }

        return $this->results[$key];
    }

    private function getKey(Reader $subject, $scope): ?string
    {
        // Reader has no public getters; if core internals change, skip memoization.
        [$fileName, $idAttributes] = \Closure::bind(
            fn () => [$this->fileName ?? null, $this->idAttributes ?? null],
            $subject,
            Reader::class
        )();

        if (!is_string($fileName) || !is_array($idAttributes)) {
            return null;
        }

        $theme = $this->design->getDesignTheme();

        return json_encode([
            $theme->getThemePath(),
            $theme->getArea(),
            $scope ?: 'global',
            $fileName,
            $idAttributes,
        ]);
    }
}
