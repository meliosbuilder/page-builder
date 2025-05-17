define([
    'jquery'
], function ($) {
    'use strict';

    var marks = [{
        re: /<svg [^<>]*?(?:viewBox=\"(?<viewBox>\b[^"]*)\")?>([\s\S]*?)<\/svg>/,
        placeholder: (match) => {
            var result = match[0],
                parser = new DOMParser(),
                doc = parser.parseFromString(result, 'image/svg+xml'),
                parserError = doc.querySelector('parsererror');

            if (parserError || !doc.documentElement.children.length) {
                return false;
            }

            if (!result.includes('height=')) {
                result = result.replace('<svg ', '<svg height="20" ');
            }
            if (!result.includes('width=')) {
                result = result.replace('<svg ', '<svg width="20" ');
            }

            return result;
        }
    }]

    function render(cm) {
        var value = cm.getValue(),
            cursor = cm.getCursor(),
            match, from, to, placeholder, el;

        _.each(marks, function (mark) {
            var re = new RegExp(mark.re, 'g');

            while ((match = re.exec(value)) !== null) {
                from = cm.doc.posFromIndex(match.index);
                to = cm.doc.posFromIndex(match.index + match[0].length);

                if (cursor.line > from.line && cursor.line < to.line) {
                    continue; // cursor is inside mark
                }

                if (cursor.line >= from.line && cursor.ch > from.ch &&
                    cursor.line <= to.line && cursor.ch < to.ch
                ) {
                    continue; // cursor is inside mark
                }

                placeholder = mark.placeholder;

                if (typeof placeholder === 'function') {
                    placeholder = placeholder(match);
                }

                if (!placeholder) {
                    continue;
                }

                if (typeof placeholder === 'string') {
                    el = $('<span class="mls-cm-textmark">')
                        .append(placeholder)
                        .attr('title', match[0])
                        .get(0);
                }

                cm.doc.markText(from, to, {
                    replacedWith: el,
                    handleMouseEvents: true
                });
            }
        });
    }

    function findTextMark(cm, event) {
        var marks = cm.doc.findMarksAt(cm.coordsChar({
                left: event.pageX,
                top: event.pageY
            }));

        return _.find(marks, function (item) {
            return item.widgetNode;
        });
    }

    return function (cm) {
        cm.setOption('configureMouse', function (instance, repeat, event) {
            var mark = findTextMark(cm, event);

            if (!mark) {
                return {};
            }

            return {
                unit: function () {
                    return mark.find();
                }
            };
        });
        cm.on('changes', () => cm.operation(() => render(cm)));
        cm.on('dblclick', function (instance, event) {
            var mark = findTextMark(cm, event);

            if (!mark) {
                return;
            }

            mark.clear();
        });

        render(cm);
    }
});
