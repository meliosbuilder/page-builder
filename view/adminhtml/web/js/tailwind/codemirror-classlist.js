define(['Melios_PageBuilder/js/lib/codemirror/lib/codemirror'], (CodeMirror) => {
    'use strict';

    CodeMirror.defineMode('classlist', function () {
        return {
            startState() {
                return {};
            },
            token(stream) {
                if (stream.eatSpace()) return null;

                const word = stream.match(/[^\s]+/);
                if (word) return 'atom';

                stream.next();
                return null;
            }
        };
    });
});
