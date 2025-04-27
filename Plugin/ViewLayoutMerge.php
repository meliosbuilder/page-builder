<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Framework\View\Model\Layout\Merge;

class ViewLayoutMerge
{
    public function afterGetDbUpdateString(Merge $subject, $result)
    {
        $layoutUpdatesCache = (fn () => $this->layoutUpdatesCache)->call($subject);
        $layoutUpdateXml = $layoutUpdatesCache?->asXML() ?? '';

        foreach ($subject->getHandles() as $handle) {
            if (!str_starts_with($handle, 'pagebuilder_') ||
                !str_ends_with($handle, '_mobile_form') ||
                str_contains($layoutUpdateXml, '<uiComponent name="' . $handle . '"')
            ) {
                continue;
            }

            $subject->addUpdate($this->getMobileUiComponentXml($handle));
        }

        return $result;
    }

    private function getMobileUiComponentXml($componentName): string
    {
        return <<<XML
        <referenceContainer name="content">
            <uiComponent name="{$componentName}"/>
        </referenceContainer>
        XML;
    }
}
