<?php

namespace Melios\PageBuilder\Console\Command;

use Melios\PageBuilder\Model\Tailwind;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class TailwindInfo extends Command
{
    public function __construct(
        private Tailwind $tailwind
    ) {
        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('melios:tailwind:info')
            ->setDescription('Show TailwindCSS information');
        parent::configure();
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        try {
            $bin = $this->tailwind->binaryPath();
            $output->writeln("Checking tailwind executable: {$bin}");

            if (!file_exists($bin)) {
                $output->writeln("<error>File not found. Run bin/magento melios:tailwind:download</error>");
            } elseif (!is_executable($bin)) {
                $output->writeln("<error>File not executable. Run chmod +x {$bin}</error>");
            } else {
                $output->writeln("<info>{$this->tailwind->version()}</info>");
            }

            return \Magento\Framework\Console\Cli::RETURN_SUCCESS;
        } catch (\Exception $e) {
            $output->writeln('<error>' . $e->getMessage() . '</error>');
            if ($output->getVerbosity() >= OutputInterface::VERBOSITY_VERBOSE) {
                $output->writeln($e->getTraceAsString());
            }

            return \Magento\Framework\Console\Cli::RETURN_FAILURE;
        }
    }
}
