define([], () => {
  'use strict';

  return {
    languages: [
      {
        name: 'ClassList',
        parsers: ['classlist'],
        extensions: ['.cls']
      }
    ],
    parsers: {
      classlist: {
        astFormat: 'classlist',
        parse(text) {
          const classes = text.trim().split(/\s+/).filter(Boolean);
          return {
            type: 'ClassList',
            classes,
            locStart: () => 0,
            locEnd: () => text.length
          };
        },
        locStart(node) {
          return node.locStart();
        },
        locEnd(node) {
          return node.locEnd();
        }
      }
    },
    printers: {
      classlist: {
        print(path) {
          const { classes } = path.getValue();
          const sorted = [...classes].sort();
          return sorted.join(' ');
        }
      }
    }
  };
});
