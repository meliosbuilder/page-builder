<?php

namespace Melios\PageBuilder\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\View\DesignInterface;
use Magento\Framework\View\Page\Config as PageConfig;

class LayoutLoadBefore implements ObserverInterface
{
    public function __construct(
        private PageConfig $pageConfig,
        private DesignInterface $design
    ) {
    }

    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        if (str_contains($this->design->getDesignTheme()->getCode(), 'm137')) {
            $this->pageConfig->addBodyClass('theme-m137');
        }
    }
}
