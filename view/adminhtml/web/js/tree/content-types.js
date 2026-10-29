define([
    'Magento_PageBuilder/js/config'
], function (config) {
    'use strict';

    function find(container, id) {
        var children = container.getChildren()(),
            found,
            i;

        for (i = 0; i < children.length; i++) {
            if (children[i].id === id) {
                return children[i];
            }

            if (children[i].getChildren && (found = find(children[i], id))) {
                return found;
            }
        }

        return null;
    }

    function contains(ancestor, contentType) {
        while (contentType) {
            if (contentType === ancestor) {
                return true;
            }

            contentType = contentType.parentContentType;
        }

        return false;
    }

    function stageElement(contentType) {
        return contentType.preview.wrapperElement || contentType.preview.element?.[0] || null;
    }

    function option(contentType, code) {
        var found = contentType.preview.getOptions?.()?.getOption(code);

        return found && !found.isDisabled() ? found : null;
    }

    function hiddenViewports(contentType) {
        var value = contentType.dataStore.get('mls_hidden');

        if (typeof value === 'string') {
            return value.split(/\s+/).filter(Boolean);
        }

        return Array.isArray(value) ? value : [];
    }

    function hidden(contentType, viewport) {
        var display = contentType.dataStore.get('display');

        if (display === false || display === 'false' || display === 0 || display === '0') {
            return 'all';
        }

        return hiddenViewports(contentType).includes(viewport) ? viewport : null;
    }

    // The preview shows the first field with text, search looks in all of them
    const TEXT_FIELDS = {
        'heading': 'heading_text',
        'text': 'content',
        'html': 'html',
        'melios-ai-composer': 'markup',
        'button-item': 'button_text',
        'tab-item': 'tab_name',
        'slide': ['slide_name', 'content', 'button_text'],
        'banner': ['message', 'button_text'],
        'melios-collapsible-item': 'title',
        'melios-link-item': 'text',
        'melios-icon': 'text',
    };

    function isImage(contentType) {
        var name = contentType.config.name;

        return name === 'image'
            || name === 'melios-marquee-item' && contentType.dataStore.get('appearance') !== 'html';
    }

    const PREVIEW_LENGTH = 80;
    const texts = new Map();

    // Media or code counts as content even without text
    const CONTENT_TAGS = 'img, svg, picture, video, audio, iframe, object, embed, canvas, form, input, select, '
        + 'textarea, button, hr, script, style, link, template';

    function parse(html) {
        var parsed = texts.get(html),
            doc;

        if (parsed === undefined) {
            html = String(html);
            doc = new DOMParser().parseFromString(html, 'text/html');
            parsed = {
                blank: !doc.body.textContent.trim() && !html.includes('{{') && !doc.querySelector(CONTENT_TAGS),
            };
            doc.querySelectorAll('script, style, template').forEach(el => el.remove());
            parsed.text = doc.body.textContent.replace(/\{\{[^}]*\}\}/g, ' ').replace(/\s+/g, ' ').trim();

            if (texts.size > 500) {
                texts.clear();
            }

            texts.set(html, parsed);
        }

        return parsed;
    }

    function plainText(html) {
        return parse(html).text;
    }

    function widgetType(html) {
        var type = String(html).match(/{{widget.*\stype="(.+?)".*}}/);

        return type ? type[1].replace(/\\\\/g, '\\') : '';
    }

    // Label of the widget type in the Insert Widget dialog, the widget class if there is none
    function widgetName(html) {
        var type = widgetType(html);

        return type && (config.getConfig('tinymce')?.widgets?.types?.[type] || type);
    }

    function videoHost(url) {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch (e) {
            return '';
        }
    }

    function fieldTexts(contentType) {
        var data = contentType.dataStore,
            fields = TEXT_FIELDS[contentType.config.name];

        if (fields) {
            return [].concat(fields).map(field => plainText(data.get(field) || ''));
        }

        if (isImage(contentType)) {
            return ['image_caption', 'title_attribute', 'alt'].map(field => data.get(field) || '')
                .concat(data.get('image')?.[0]?.name || '');
        }

        if (contentType.config.name === 'melios-marquee-item') {
            return [plainText(data.get('content') || '')];
        }

        if (contentType.config.name === 'melios-widget') {
            return [widgetName(data.get('html') || '')];
        }

        if (contentType.config.name === 'video') {
            return [videoHost(data.get('video_source') || '')];
        }

        return [];
    }

    function preview(contentType) {
        var text = fieldTexts(contentType).find(Boolean) || '';

        return text.replace(/\s+/g, ' ').trim().slice(0, PREVIEW_LENGTH);
    }

    // Lowercased, for Layers search
    function searchText(contentType) {
        return fieldTexts(contentType).filter(Boolean).join(' ').toLowerCase();
    }

    // Containers without children, and elements without the content they are made for
    function empty(contentType) {
        var name = contentType.config.name,
            data = contentType.dataStore,
            fields = TEXT_FIELDS[name];

        if (contentType.getChildren && /master-collection$/.test(contentType.config.master_component || '')) {
            return !contentType.getChildren()().length;
        }

        if (isImage(contentType)) {
            return !data.get('image')?.[0] && !data.get('mobile_image')?.[0];
        }

        if (name === 'video') {
            return !data.get('video_source');
        }

        if (name === 'melios-widget') {
            return !widgetType(data.get('html') || '');
        }

        if (name === 'melios-marquee-item') {
            return parse(data.get('content') || '').blank;
        }

        if (!fields || name === 'melios-icon' || name === 'slide' || name === 'banner') {
            return false;
        }

        return [].concat(fields).every(field => parse(data.get(field) || '').blank);
    }

    return {
        find,
        empty,
        contains,
        stageElement,
        option,
        hiddenViewports,
        hidden,
        preview,
        searchText,
    };
});
