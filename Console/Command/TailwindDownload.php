<?php

namespace Melios\PageBuilder\Console\Command;

use Magento\Framework\Filesystem\Driver\File;
use Magento\Framework\HTTP\Client\Curl;
use Melios\PageBuilder\Model\Tailwind;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Process\Process;
use RuntimeException;

class TailwindDownload extends Command
{
    public function __construct(
        private Curl $curl,
        private Tailwind $tailwind,
        private File $fileDriver
    ) {
        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('melios:tailwind:download')
            ->setDescription('Download TailwindCSS binary');
        parent::configure();
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        try {
            $this->curl->addHeader('User-Agent', 'MeliosBuilder-TailwindDownloader');
            $this->curl->get('https://api.github.com/repos/tailwindlabs/tailwindcss/releases/latest');

            if ($this->curl->getStatus() !== 200) {
                throw new RuntimeException(
                    "Failed to fetch latest tailwind release: {$this->curl->getStatus()}"
                );
            }

            $data = json_decode($this->curl->getBody(), true);
            if (!is_array($data) || empty($data['assets'])) {
                throw new RuntimeException('GitHub response missing assets.');
            }

            $this->download($this->findAssetToDownload($data['assets']));
            chmod($this->tailwind->binaryPath(), 0755);
            // $output->writeln('Done!');

            $infoCommand = $this->getApplication()->find('melios:tailwind:info');
            $infoCommand->run(new ArrayInput([
                'command' => 'melios:tailwind:info'
            ]), $output);

            return \Magento\Framework\Console\Cli::RETURN_SUCCESS;
        } catch (\Exception $e) {
            $output->writeln('<error>' . $e->getMessage() . '</error>');
            if ($output->getVerbosity() >= OutputInterface::VERBOSITY_VERBOSE) {
                $output->writeln($e->getTraceAsString());
            }

            return \Magento\Framework\Console\Cli::RETURN_FAILURE;
        }
    }

    private function download($asset)
    {
        $target = $this->tailwind->binaryPath();
        $targetDir = dirname($target);

        if (!$this->fileDriver->isExists($targetDir)) {
            $this->fileDriver->createDirectory($targetDir);
        }

        $output = new ConsoleOutput();
        $progressBar = new ProgressBar($output);
        $progressBar->setFormat("Downloading {$asset['name']} [%bar%] %percent:3s%% (%current%/%max% MB)");
        $progressBar->start();

        $fp = fopen($target . '.tmp', 'w');
        $ch = curl_init($asset['browser_download_url']);

        curl_setopt_array($ch, [
            CURLOPT_FILE  => $fp,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_USERAGENT => 'MeliosBuilder-TailwindDownloader',
            CURLOPT_NOPROGRESS => false,
            CURLOPT_PROGRESSFUNCTION => function (
                $resource, $downloadSize, $downloaded, $uploadSize, $uploaded
            ) use ($progressBar) {
                if ($downloadSize > 0) {
                    $progressBar->setMaxSteps(round($downloadSize / 1024 / 1024));
                    $progressBar->setProgress(round($downloaded / 1024 / 1024));
                } else {
                    $progressBar->advance(); // fake activity
                }
            }
        ]);

        curl_exec($ch);
        curl_close($ch);
        fclose($fp);

        $this->fileDriver->rename($target . '.tmp', $target);
        $progressBar->finish();
        $output->writeln('');
    }

    private function findAssetToDownload($assets): array
    {
        $binaryName = $this->detectBinaryName();

        foreach ($assets as $asset) {
            if ($asset['name'] === $binaryName) {
                return $asset;
            }
        }

        throw new RuntimeException("Unable to find the asset: $binaryName");
    }

    private function detectBinaryName(): string
    {
        $os = PHP_OS_FAMILY;
        $arch = php_uname('m');
        $map = [
            'Linux-x86_64-glibc' => 'tailwindcss-linux-x64',
            'Linux-x86_64-musl' => 'tailwindcss-linux-x64-musl',
            'Linux-aarch64-glibc' => 'tailwindcss-linux-arm64',
            'Linux-aarch64-musl' => 'tailwindcss-linux-arm64-musl',
            'Darwin-x86_64' => 'tailwindcss-macos-x64',
            'Darwin-arm64' => 'tailwindcss-macos-arm64',
            'Windows-AMD64' => 'tailwindcss-windows-x64.exe',
        ];

        $key = $os . '-' . $arch;
        if ($os === 'Linux') {
            $process = new Process(['ldd', '--version']);
            $process->run();
            $out = $process->getOutput() . $process->getErrorOutput();
            $key .= (str_contains(strtolower($out), 'musl') ? '-musl' : '-glibc');
        }

        if (!isset($map[$key])) {
            throw new RuntimeException("Unsupported platform: $key");
        }

        return $map[$key];
    }
}
