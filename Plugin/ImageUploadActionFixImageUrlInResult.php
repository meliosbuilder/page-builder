<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\App\RequestInterface;
use Magento\Framework\Controller\ResultInterface;
use Magento\PageBuilder\Controller\Adminhtml\ContentType\Image\Upload as UploadAction;

class ImageUploadActionFixImageUrlInResult
{
    public function __construct(
        private RequestInterface $request
    ) {
    }

    public function afterExecute(
        UploadAction $subject,
        ResultInterface $result
    ) {
        $target = $this->request->getParam('target_folder');
        if ($target && !str_contains($target, '..')) {
            $json = (fn () => $this->json)->call($result);
            $json = json_decode($json, true);

            // Fix URL if image was uploaded to target_folder.
            // We need to do that, because Magento assumes that image is saved
            // to '/wysiwyg/' folder only.
            if (!empty($json['url']) &&
                !empty($json['path']) &&
                str_ends_with($json['url'], '/wysiwyg/' . $json['file']) &&
                str_ends_with($json['path'], $target)
            ) {
                $json['url'] = str_replace(
                    'wysiwyg/' . $json['file'],
                    $target . '/' . $json['file'],
                    $json['url']
                );
                $result->setData($json);
            }
        }

        return $result;
    }
}
