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

    public function run($html)
    {
        $tw = $this->directoryList->getPath(DirectoryList::VAR_DIR) . '/melios/tw';
        $tmp = $tw . '/' . bin2hex(random_bytes(4));
        $inputPath = $tmp . '/input.css';
        $outputPath = $tmp . '/output.css';

        $this->fileDriver->createDirectory($tmp);
        $this->fileDriver->filePutContents($inputPath, $this->input());
        $this->fileDriver->filePutContents($outputPath, '');
        $this->fileDriver->filePutContents($tmp . '/content.html', $html);

        chdir($tw);
        chmod('tailwindcss', 0755);
        exec("tailwindcss -i {$inputPath} -o {$outputPath} --minify");

        $css = $this->fileDriver->fileGetContents($outputPath);

        $this->fileDriver->deleteDirectory($tmp);

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
}
