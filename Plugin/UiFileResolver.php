<?php

namespace Melios\PageBuilder\Plugin;

use Magento\Ui\Config\Reader\FileResolver;

class UiFileResolver
{
    public function afterGet(FileResolver $subject, $result, $filename, $scope)
    {
        if (!str_starts_with($filename, 'pagebuilder_') ||
            !str_ends_with($filename, '_mobile_form.xml')
        ) {
            return $result;
        }

        if (!$result) {
            $componentName = substr($filename, 0, -4);
            $result = ["melios/{$filename}" => $this->getMobileFormXml($componentName)];
        }

        if (!$this->contains($result, '<field name="margins_and_padding">')) {
            $result["melios/margins_and_padding/{$filename}"] =
                $this->getMobileMarginAndPaddingXml();
        }

        return $result;
    }

    private function contains(array $haystack, string $needle): bool
    {
        foreach ($haystack as $string) {
            if (str_contains($string, $needle)) {
                return true;
            }
        }
        return false;
    }

    private function getMobileFormXml($componentName): string
    {
        $parentName = str_replace('_mobile_form', '_form', $componentName);

        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <form xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Ui:etc/ui_configuration.xsd"
              extends="{$parentName}">
            <argument name="data" xsi:type="array">
                <item name="js_config" xsi:type="array">
                    <item name="provider" xsi:type="string">{$componentName}.{$componentName}_data_source</item>
                </item>
            </argument>
            <settings>
                <deps>
                    <dep>{$componentName}.{$componentName}_data_source</dep>
                </deps>
                <namespace>{$componentName}</namespace>
            </settings>
            <dataSource name="{$componentName}_data_source">
                <argument name="data" xsi:type="array">
                    <item name="js_config" xsi:type="array">
                        <item name="component" xsi:type="string">Magento_PageBuilder/js/form/provider</item>
                    </item>
                </argument>
                <dataProvider name="{$componentName}_data_source" class="Magento\PageBuilder\Model\ContentType\DataProvider">
                    <settings>
                        <requestFieldName/>
                        <primaryFieldName/>
                    </settings>
                </dataProvider>
            </dataSource>
        </form>
        XML;
    }

    private function getMobileMarginAndPaddingXml(): string
    {
        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <form xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Ui:etc/ui_configuration.xsd">
            <fieldset name="advanced">
                <field name="margins_and_padding">
                    <argument name="data" xsi:type="array">
                        <item name="config" xsi:type="array">
                            <item name="breakpoints" xsi:type="array">
                                <item name="mobile" xsi:type="boolean">true</item>
                            </item>
                        </item>
                    </argument>
                    <settings>
                        <additionalClasses>
                            <class name="admin__field-mobile-breakpoint-notice">true</class>
                        </additionalClasses>
                        <tooltip>
                            <description translate="true">
                                <![CDATA[
                                <p>Style changes will only affect this breakpoint</p>
                                ]]>
                            </description>
                        </tooltip>
                    </settings>
                </field>
            </fieldset>
        </form>
        XML;
    }
}
