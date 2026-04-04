<?php

namespace Melios\PageBuilder\Block\Adminhtml;

use Magento\Backend\Block\Template;
use Magento\Directory\Helper\Data as DirectoryHelper;
use Magento\Framework\AuthorizationInterface;
use Magento\Framework\Json\Helper\Data as JsonHelper;
use Magento\Framework\Serialize\Serializer\Json;
use Magento\Store\Model\StoreManagerInterface;

class ImageEditor extends Template
{
    public function __construct(
        Template\Context $context,
        private AuthorizationInterface $authorization,
        private StoreManagerInterface $storeManager,
        private Json $json,
        array $data = [],
        ?JsonHelper $jsonHelper = null,
        ?DirectoryHelper $directoryHelper = null
    ) {
        parent::__construct($context, $data, $jsonHelper, $directoryHelper);
    }

    public function getActionsJson(): string
    {
        $actions = [
            [
                'title' => __('Cancel'),
                'handler' => 'closeModal',
                'name' => 'cancel',
                'classes' => 'action-default scalable cancel action-quaternary'
            ]
        ];

        if ($this->authorization->isAllowed('Magento_MediaGalleryUiApi::edit_assets')) {
            $actions[] = [
                'title' => __('Canvas size'),
                'handler' => 'meliosSetCanvasSize',
                'name' => 'set_canvas_size',
                'classes' => 'action-default scalable canvas-size action-quaternary'
            ];
            $actions[] = [
                'title' => __('Image size'),
                'handler' => 'meliosSetImageSize',
                'name' => 'set_image_size',
                'classes' => 'action-default scalable image-size action-quaternary'
            ];
            $actions[] = [
                'title' => __('Save As...'),
                'handler' => 'meliosSaveImageAs',
                'name' => 'save_as',
                'classes' => 'action-default scalable save'
            ];
            $actions[] = [
                'title' => __('Save'),
                'handler' => 'meliosSaveImage',
                'name' => 'save',
                'classes' => 'action-default scalable save action-primary'
            ];
        }

        return $this->json->serialize($actions);
    }

    public function getOnInsertUrl(): string
    {
        return $this->getUrl('media_gallery/image/oninsert');
    }

    public function getStoreId(): int
    {
        return $this->storeManager->getStore()->getId();
    }
}
