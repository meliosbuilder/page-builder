<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Filesystem;
use Magento\MediaGalleryApi\Api\Data\AssetInterface;
use Magento\MediaGallerySynchronizationApi\Model\CreateAssetFromFileInterface;

class CreateAssetFromFileFixImageDimensions
{
    public function __construct(
        private Filesystem $filesystem
    ) {
    }

    public function afterExecute(
        CreateAssetFromFileInterface $subject,
        AssetInterface $asset,
        string $path
    ) {
        if ($asset->getContentType() === 'image/svg' && !$asset->getWidth()) {
            $absolutePath = $this->getMediaDirectory()->getAbsolutePath($path);
            $driver = $this->getMediaDirectory()->getDriver();
            [$width, $height] = $this->getSvgDimensions($driver->fileGetContents($absolutePath));
            (fn () => $this->width = $width)->call($asset);
            (fn () => $this->height = $height)->call($asset);
        }
        return $asset;
    }

    private function getSvgDimensions($svg): array
    {
        preg_match('/<svg\b[^>]*>/i', $svg, $matches);
        $svgTag = $matches[0] ?? '';
        if (!$svgTag) {
            return [0, 0];
        }

        $result = [
            'width' => 0,
            'height' => 0,
        ];
        $regexes = [
            'width' => '/\bwidth=["\']([^"\']+)["\']/i',
            'height' => '/\bheight=["\']([^"\']+)["\']/i',
            'viewBox' => '/\bviewBox=["\']([^"\']+)["\']/i',
        ];

        foreach (['width', 'height'] as $key) {
            preg_match($regexes[$key], $svgTag, $matches);
            $value = $matches[1] ?? '';
            if (str_contains($value, '%')) {
                $value = '';
            }
            $result[$key] = $value;
        }

        if (!$result['width'] || !$result['height']) {
            preg_match($regexes['viewBox'], $svgTag, $matches);
            if (!empty($matches[1])) {
                $viewBox = preg_split('/[\s,]+/', trim($matches[1]));
                $result['width'] = $result['width'] ?: ($viewBox[2] ?? 0);
                $result['height'] = $result['height'] ?: ($viewBox[3] ?? 0);
            }
        }

        foreach ($result as $key => $value) {
            $result[$key] = (int) $value;
        }

        return array_values($result);
    }

    private function getMediaDirectory(): Filesystem\Directory\WriteInterface
    {
        return $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA);
    }
}
