<?php

namespace Melios\PageBuilder\Observer;

use Magento\Backend\Model\Auth\Session;
use Magento\Framework\AuthorizationInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\Message\ManagerInterface;
use Melios\PageBuilder\Model\Tailwind;
use \Exception;

class GenerateTailwindStyles implements \Magento\Framework\Event\ObserverInterface
{
    public function __construct(
        private Tailwind $tailwind,
        private ManagerInterface $messageManager,
        private Session $backendSession,
        private AuthorizationInterface $authorization
    ) {
    }

    public function execute(Observer $observer)
    {
        if (!$this->backendSession->isLoggedIn()) {
            return;
        }

        $controllerAction = $observer->getEvent()->getControllerAction();

        $request = $controllerAction->getRequest();
        if (!$request->isPost()) {
            return;
        }

        // controller_action_predispatch is dispatched before the action runs its
        // own _isAllowed() check, so any logged in user reaches this observer.
        // Only run tailwind for users allowed to reach the posted action.
        if (!$this->authorization->isAllowed($this->adminResource($controllerAction))) {
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
            if (str_contains($value, ' data-content-type="') &&
                !str_contains($value, 'melios-tailwind-off')
            ) {
                try {
                    $twStyles = $this->tailwind->run(
                        html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8')
                    );

                    if ($twStyles) {
                        // media is used to prevent stage parser error
                        $postData[$key] = "<style data-mls-tailwind>@media all { {$twStyles} }</style>" . $value;
                    }
                } catch (Exception $e) {
                    $this->messageManager->addErrorMessage($e->getMessage());
                }
            }
        }

        $request->setPostValue($postData);
    }

    // Every backend action inherits ADMIN_RESOURCE from Magento\Backend\App\AbstractAction
    // and most override it. The fallback covers actions that are not AbstractAction.
    private function adminResource($controllerAction): string
    {
        return defined(get_class($controllerAction) . '::ADMIN_RESOURCE')
            ? $controllerAction::ADMIN_RESOURCE
            : 'Magento_Backend::admin';
    }
}
