<?php

namespace Melios\PageBuilder\Observer;

use Magento\Framework\Event\Observer;
use Melios\PageBuilder\Model\Tailwind;

class GenerateTailwindStyles implements \Magento\Framework\Event\ObserverInterface
{
    public function __construct(
        private Tailwind $tailwind
    ) {
    }

    public function execute(Observer $observer)
    {
        $request = $observer->getEvent()->getControllerAction()->getRequest();
        if (!$request->isPost()) {
            return;
        }

        $postData = $request->getPostValue();

        foreach ($postData as $key => $value) {
            // "< 33" means that there is no content to process because
            // <style data-mls-tailwind></style> = 33 and
            // <div data-content-type="a"></div> = 33
            if (!$value || !is_string($value) || strlen($value) < 33) {
                continue;
            }

            // remove old tailwind styles
            $start = strpos($value, '<style data-mls-tailwind>');
            if ($start !== false) {
                $end = strpos($value, '</style>', $start);
                if ($end !== false) {
                    $end += strlen('</style>');
                    $value = substr_replace($value, '', $start, $end - $start);
                    $postData[$key] = $value;
                }
            }

            // generate new tailwind styles
            if (str_contains($value, ' data-content-type="')) {
                $twStyles = $this->tailwind->run($value);
                if ($twStyles) {
                    // media is used to prevent stage parser error
                    $postData[$key] = "<style data-mls-tailwind>@media all { {$twStyles} }</style>" . $value;
                }
            }
        }

        $request->setPostValue($postData);
    }
}
