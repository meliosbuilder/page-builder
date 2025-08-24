<?php

namespace Melios\PageBuilder\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Filesystem\Driver\File;
use Symfony\Component\Process\Process;
use RuntimeException;

class Tailwind
{
    private $input;

    public function __construct(
        private ScopeConfigInterface $scopeConfig,
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

        do {
            $tmpDir = dirname($twBinary) . '/' . bin2hex(random_bytes(4));
        } while ($this->fileDriver->isExists($tmpDir));

        $inputPath = $tmpDir . '/input.css';
        $outputPath = $tmpDir . '/output.css';

        try {
            $this->fileDriver->createDirectory($tmpDir);
            $this->fileDriver->filePutContents($inputPath, $this->input());
            $this->fileDriver->filePutContents($outputPath, '');
            $this->fileDriver->filePutContents($tmpDir . '/content.html', $html);

            chmod($twBinary, 0755);
            // exec("{$twBinary} -i {$inputPath} -o {$outputPath} --minify");
            $process = new Process([
                $twBinary,
                '-i', $inputPath,
                '-o', $outputPath,
                '--minify'
            ]);

            $process->run();

            if (!$process->isSuccessful()) {
                throw new RuntimeException($process->getErrorOutput());
            }

            $css = $this->fileDriver->fileGetContents($outputPath);
        } finally {
            $this->fileDriver->deleteDirectory($tmpDir);
        }

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

        $twConfig = $this->scopeConfig->getValue('melios_builder/tailwind/config');

        return <<<CSS
        @import 'tailwindcss/theme.css';
        @import 'tailwindcss/utilities.css' source(none);
        {$twConfig}
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
        // exec("{$this->binaryPath()} --help", $output);
        // return $output[0];
        $process = new Process([$this->binaryPath(), '--help']);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new RuntimeException($process->getErrorOutput());
        }

        return explode("\n", $process->getOutput())[0];
    }
}
