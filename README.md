# Melios Page Builder

Improvements for the built-in Magento PageBuilder module.

## Installation

```bash
composer require melios/page-builder
bin/magento module:enable Melios_PageBuilder
```

## Features

### Hotkeys

 -  <kbd>Alt+0</kbd>, <kbd>Opt+0</kbd> — open the first pagebuilder found on the page.
 -  <kbd>Ctrl+Shift+M</kbd>, <kbd>Cmd+Shift+M</kbd> — switch between Desktop and Mobile views.
 -  <kbd>Delete</kbd>, <kbd>Backspace</kbd> — delete hovered element.
 -  <kbd>Enter</kbd> or Double Click — edit hovered element.
 -  <kbd>Ctrl+C</kbd>, <kbd>Cmd+C</kbd> — copy hovered element, or entire HTML into the clipboard.
 -  <kbd>Ctrl+X</kbd>, <kbd>Cmd+X</kbd> — **Pro version only** cut hovered element, or entire content into the clipboard.
 -  <kbd>Ctrl+V</kbd>, <kbd>Cmd+V</kbd> — paste previously copied element (**Pro version only**), or entire HTML at the bottom or after the hovered element.
 -  <kbd>Ctrl+Shift+V</kbd>, <kbd>Cmd+Shift+V</kbd> — paste previously copied element (**Pro version only**), or entire HTML at the top or before the hovered element.
 -  <kbd>Ctrl+S</kbd>, <kbd>Cmd+S</kbd> — **Pro version only** save the content without leaving the editor.
 -  <kbd>Ctrl+Enter</kbd>, <kbd>Cmd+Enter</kbd>, <kbd>/</kbd> — open Spotlight to insert new content.

### UX Improvements

 -  **Pro version only** Copy-Cut-Paste hovered element between different editors and different Magento instances.
 -  **Pro version only** Quick save without leaving the editor.
 -  Copy-Paste entire HTML between different editors and different Magento instances.
 -  Add new content using a faster Spotlight popup.
 -  Edit element with an intuitive double-click.

### Columns

 -  Added `Gap` field to edit gap between columns for desktop and mobile devices.

### Image

 -  Added `Width` and `Height` fields to set the image dimensions for desktop and mobile devices.
 -  Added ability to set `fetchpriority` attribute for desktop and mobile devices.
 -  **Pro version only** Added ability to preload image for desktop and mobile devices.

### WYSIWYG

 -  Always show menubar for each WYSIWYG element.
