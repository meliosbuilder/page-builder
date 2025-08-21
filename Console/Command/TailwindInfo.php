<?php

namespace Melios\PageBuilder\Console\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class TailwindInfo extends Command
{
    protected function configure()
    {
        $this->setName('melios:tailwind:info')
            ->setDescription('Show TailwindCSS information');
        parent::configure();
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        try {
            $output->writeln('<info>WIP</info>');

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
