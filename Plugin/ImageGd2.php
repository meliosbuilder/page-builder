<?php

namespace Melios\PageBuilder\Plugin;

use GdImage;
use Magento\Framework\Image\Adapter\Gd2;

class ImageGd2
{
    private $callbacks = [];

    private $fileType;

    private $imageHandler;

    private $dims;

    private $backgroundColor;

    public function __construct()
    {
        $this->registerCallbacks();
    }

    public function beforeOpen(Gd2 $subject, $filename)
    {
        // Do not remove! This method added to trigger __construct!
    }

    public function afterOpen(Gd2 $subject, $result, $filename)
    {
        $this->fileType = (fn () => $this->_fileType)->call($subject);

        if (!isset($this->callbacks[$this->fileType])) {
            return $result;
        }

        $image = (fn () => $this->_imageHandler)->call($subject);
        $width = imagesx($image);
        $height = imagesy($image);
        $this->imageHandler = imagecreatetruecolor($width, $height);
        imagecopy($this->imageHandler, $image, 0, 0, 0, 0, $width, $height);

        return $result;
    }

    public function beforeResize(Gd2 $subject, $frameWidth = null, $frameHeight = null)
    {
        if (!isset($this->callbacks[$this->fileType])) {
            return;
        }

        $this->dims = (fn () => $this->_adaptResizeValues($frameWidth, $frameHeight))->call($subject);
    }

    public function afterResize(Gd2 $subject, $result, $frameWidth = null, $frameHeight = null)
    {
        if (!isset($this->callbacks[$this->fileType])) {
            return $result;
        }

        $image = imagecreatetruecolor($this->dims['frame']['width'], $this->dims['frame']['height']);
        $this->backgroundColor = (fn () => $this->_backgroundColor)->call($subject);
        list($red, $green, $blue) = $this->backgroundColor ?: [0, 0, 0];
        imagefill($image, 0, 0, imagecolorallocate($image, $red, $green, $blue));

        imagecopyresampled(
            $image,
            $this->imageHandler,
            $this->dims['dst']['x'],
            $this->dims['dst']['y'],
            $this->dims['src']['x'],
            $this->dims['src']['y'],
            $this->dims['dst']['width'],
            $this->dims['dst']['height'],
            imagesx($this->imageHandler),
            imagesy($this->imageHandler)
        );

        $this->imageHandler = $image;

        return $result;
    }

    public function beforeSave(Gd2 $subject, $destination = null, $newName = null)
    {
        if (!isset($this->callbacks[$this->fileType])) {
            return;
        }

        imageinterlace($this->imageHandler, true);
    }

    private function registerCallbacks()
    {
        $existing = (fn () => self::$_callbacks)->bindTo(null, Gd2::class)();

        if (!isset($existing[IMAGETYPE_WEBP])) {
            $this->callbacks[IMAGETYPE_WEBP] = [
                'output' => function (GdImage $image, $file = null, $quality = -1) {
                    imagewebp($this->imageHandler, $file, $quality);
                },
                'create' => 'imagecreatefromwebp',
            ];
        }


        if (defined('IMAGETYPE_AVIF') && !isset($existing[IMAGETYPE_AVIF])) {
            $this->callbacks[IMAGETYPE_AVIF] = [
                'output' => function (GdImage $image, $file = null, $quality = -1, $speed = -1) {
                    imageavif($this->imageHandler, $file, $quality, $speed);
                },
                'create' => 'imagecreatefromavif',
            ];
        }

        if ($this->callbacks) {
            (fn ($callbacks) => self::$_callbacks += $callbacks)
                ->bindTo(null, Gd2::class)($this->callbacks);
        }
    }
}
