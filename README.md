# Melios Page Builder

Must-have improvements for the built-in Magento PageBuilder module.

## Installation

```bash
composer require melios/page-builder
bin/magento module:enable Melios_PageBuilder --clear-static-content
bin/magento melios:tailwind:download # required for tailwindcss support
```

## Highlights

 -  [Tailwind CSS](https://meliosbuilder.com/docs#tailwind-css) inside Magento
    PageBuilder!
 -  [CodeMirror](https://meliosbuilder.com/docs#codemirror) editor used for HTML
    content elements and for CSS class fields.
 -  HTML/JS/CSS code formatter using [Prettier](https://prettier.io/).
 -  [Live preview](https://meliosbuilder.com/docs#live-preview) automatically
    reloads the browser tab when [Quick-save](https://meliosbuilder.com/docs#quick-save)
    is used &mdash; **Pro edition only**
 -  [AI assistant](https://meliosbuilder.com/docs#ai-assistant) &mdash; **Pro edition only**
 -  [Premium Elements](https://meliosbuilder.com/elements) &mdash; **Pro edition only**
 -  Hotkeys
    - <kbd>Alt+0</kbd> to activate pagebuilder immediately.
    - <kbd>Ctr+C</kbd>, <kbd>Ctrl+V</kbd> to copy/paste whole pagebuilder content.
    - <kbd>Ctr+C</kbd>, <kbd>Ctrl+V</kbd> to [copy/paste](https://meliosbuilder.com/docs#copy-paste)
      selected pagebuilder elements &mdash; **Pro edition only**
    - <kbd>Ctr+S</kbd> to [save contents](https://meliosbuilder.com/docs#quick-save)
      without leaving the editor &mdash; **Pro edition only**
 -  [Image enhancements](https://meliosbuilder.com/docs#image)
    - Allow uploading `WEBP` and `AVIF` images.
    - Added ability to lazy load the image or background image.
    - Added ability to preload the image or background image &mdash; **Pro edition only**
    - Added dimensions with autofill feature.
    - Added fetchpriority attribute.
 -  Added ability to use `Gap` property for [columns component](https://meliosbuilder.com/docs#columns).
 -  Double click to edit hovered element.

View videos, screenshots, and documentation at [meliosbuilder.com](https://meliosbuilder.com)
