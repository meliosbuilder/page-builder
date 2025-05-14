define([
    'Melios_PageBuilder/js/lib/codemirror/addon/display/fullscreen',
    'Melios_PageBuilder/js/lib/codemirror/addon/edit/closetag',
    'Melios_PageBuilder/js/lib/codemirror/addon/edit/closebrackets',
    'Melios_PageBuilder/js/lib/codemirror/addon/edit/matchbrackets',
    'Melios_PageBuilder/js/lib/codemirror/addon/edit/matchtags',
    'Melios_PageBuilder/js/lib/codemirror/addon/lint/lint',
    'Melios_PageBuilder/js/lib/codemirror/addon/lint/css-lint',
    'Melios_PageBuilder/js/lib/codemirror/addon/lint/javascript-lint',
    'Melios_PageBuilder/js/lib/codemirror/addon/lint/html-lint',
    'Melios_PageBuilder/js/lib/codemirror/addon/scroll/simplescrollbars',
    'Melios_PageBuilder/js/lib/codemirror/addon/search/search',
    'Melios_PageBuilder/js/lib/codemirror/addon/search/jump-to-line',
    'Melios_PageBuilder/js/lib/codemirror/addon/search/matchesonscrollbar',
    'Melios_PageBuilder/js/lib/codemirror/addon/selection/active-line',
    'Melios_PageBuilder/js/lib/codemirror/mode/htmlmixed/htmlmixed',
    './codemirror-keymap'
], function () {
    'use strict';

    return {
        autoCloseBrackets: true,
        autoCloseTags: true,
        indentUnit: 2,
        keyMap: 'melios',
        lineNumbers: true,
        lineWrapping: true,
        lint: {
            highlightLines: true,
        },
        matchBrackets: true,
        matchTags: {
            bothTags: true
        },
        mode: 'htmlmixed',
        scrollbarStyle: 'overlay',
        styleActiveLine: true,
        theme: 'default', // todo: localstorage
        darkTheme: 'material-darker'
        // directives: [
        //     {
        //         re: /<svg[\s\S]*?<\/svg>/,
        //         placeholder: function (match) {
        //             var icon = match[0];

        //             // todo: parse viewBox to keep proper ratio
        //             // and to use bigger size if svg is not an
        //             // icon (> ~50px)

        //             if (!icon.includes('height=')) {
        //                 icon = icon.replace('<svg ', '<svg height="20" ');
        //             }

        //             if (!icon.includes('width=')) {
        //                 icon = icon.replace('<svg ', '<svg width="20" ');
        //             }

        //             return `<span class="mls-transparent">${icon}</span>`;
        //         }
        //     },
        // ],
    };
});
