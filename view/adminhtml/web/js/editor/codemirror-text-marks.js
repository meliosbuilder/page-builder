define([
    'jquery'
], function ($) {
    'use strict';

    var marks = [{
        regexp: /<svg [^<>]*?(?:viewBox=\"(?<viewBox>\b[^"]*)\")?>([\s\S]*?)<\/svg>/,
        render: (match) => {
            var result = match[0],
                width = 20,
                height = 20,
                viewBox = match.groups.viewBox?.split(' ');

            if (!isValidSvg(result)) {
                return false;
            }

            if (viewBox?.length === 4 &&
                !result.includes('height=') &&
                !result.includes('width=')
            ) {
                width = 100;
                height = Math.round(width / (viewBox[2] / viewBox[3]));
            }

            if (!result.includes('height=')) {
                result = result.replace('<svg ', `<svg height="${width}" `);
            }
            if (!result.includes('width=')) {
                result = result.replace('<svg ', `<svg width="${height}" `);
            }

            return result;
        }
    }];

    function isValidSvg(svg) {
        var svgLower = svg.toLowerCase(),
            forbidden = [
                'javascript', 'script',
                'foreignobject', 'object', 'embed', 'iframe',
                'file:', 'href=', 'src=',
            ];

        if (forbidden.some(str => svgLower.includes(str))) {
            return false;
        }

        var svgDoc = new DOMParser().parseFromString(svg, 'image/svg+xml'),
            parserError = svgDoc.querySelector('parsererror');

        if (parserError || !svgDoc.documentElement.children.length) {
            return false;
        }

        if ([...svgDoc.querySelectorAll('*')].some(el =>
            [...el.attributes].some(attr => attr.name.startsWith('on'))
        )) {
            return false;
        }

        return true;
    }

    function render(cm) {
        var value = cm.getValue(),
            cursor = cm.getCursor(),
            match, from, to, html, el;

        cm.doc.getAllMarks().forEach(mark => mark.clear());

        marks.forEach(function (mark) {
            var re = new RegExp(mark.regexp, 'g');

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

                if (!(html = mark.render(match))) {
                    continue;
                }

                cm.doc.markText(from, to, {
                    replacedWith: $('<span class="mls-cm-textmark">')
                        .append(html)
                        .attr('title', match[0])
                        .get(0),
                    handleMouseEvents: true
                });
            }
        });
    }

    function findTextMark(cm, event) {
        return cm.doc.findMarksAt(cm.coordsChar({
                left: event.pageX,
                top: event.pageY
            }))
            .find(item => item.widgetNode);
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
