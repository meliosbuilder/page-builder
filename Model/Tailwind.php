<?php

namespace Melios\PageBuilder\Model;

use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Filesystem\Driver\File;

class Tailwind
{
    private $input;

    public function __construct(
        private DirectoryList $directoryList,
        private File $fileDriver
    ) {
    }

    public function run($html): string
    {
        $twBinary = $this->binaryPath();
        if (!$this->fileDriver->isExists($twBinary)) {
            return '';
        }

        $tmpDir = dirname($twBinary) . '/' . bin2hex(random_bytes(4));
        $inputPath = $tmpDir . '/input.css';
        $outputPath = $tmpDir . '/output.css';

        $this->fileDriver->createDirectory($tmpDir);
        $this->fileDriver->filePutContents($inputPath, $this->input());
        $this->fileDriver->filePutContents($outputPath, '');
        $this->fileDriver->filePutContents($tmpDir . '/content.html', $html);

        chmod($twBinary, 0755);
        exec("{$twBinary} -i {$inputPath} -o {$outputPath} --minify", $output);

        $css = $this->fileDriver->fileGetContents($outputPath);

        $this->fileDriver->deleteDirectory($tmpDir);

        return $css;
    }

    public function input($input = null)
    {
        if ($input) {
            $this->input = $input;
            return;
        }

        if ($this->input) {
            return $this->input;
        }

        return <<<CSS
        @import 'tailwindcss/theme.css';
        @import 'tailwindcss/utilities.css' source(none);
        @source 'content\.html';
        CSS;
    }

    public function binaryPath()
    {
        return $this->directoryList->getPath(DirectoryList::VAR_DIR)
            . '/melios/tailwind/tailwindcss';
    }

    public function version()
    {
        exec("{$this->binaryPath()} --help", $output);
        return $output[0];
    }
}
