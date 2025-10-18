define([], () => {
  'use strict';

  // Ordered pattern groups
  const ORDER = [
    // layout & spacing
    /^m[xy]?-/,
    /^m[setrbl]?-/,
    /^p[xy]?-/,
    /^p[setrbl]?-/,
    /^flex/, /^grid/, /^block/, /^inline/, /^hidden/,
    /^max-|^min-|^w-|^h-|^size-/,

    /^rounded$/, /^rounded-/,

    // background / gradient
    /^bg-/, /^from-/, /^via-/, /^to-/,

    // text & typography
    /^text-(center|left|right|justify)/,
    /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|balance|pretty)/,
    /^font-/, /^tracking-/, /^leading-/, /^whitespace-/,

    // color & opacity
    /^text-/, /^opacity-/, /transition/,

    // state / structural
    /^first:/, /^last:/, /^odd:/, /^even:/,
    /^not-/, /^before:/, /^after:/,

    // interaction (must go after)
    /^hover:/, /^focus:/, /^focus-visible:/, /^active:/, /^disabled:/,

    // responsive
    /^2xs:/, /^xs:/, /^sm:/, /^md:/, /^lg:/, /^xl:/, /^2xl:/, /^3xl:/,

    // dark mode
    /^dark:/,

    // arbitrary selectors last
    /^\[.*\]/,
  ];

  function getWeight(cls) {
    if (!cls) {
      return 0;
    }
    for (let i = 0; i < ORDER.length; i++) {
      if (ORDER[i].test(cls)) return i + 1;
    }
    if (cls.includes(':')) {
      // /^after:/
      return 31;
    }
    return 0;
  }

  function classSorter(a, b) {
    const wa = getWeight(a);
    const wb = getWeight(b);
    if (wa !== wb) return wa - wb;

    var i = 1;
    do {
      var nextA = a.split(':').at(i),
          nextB = b.split(':').at(i),
          wnextA = getWeight(nextA),
          wnextB = getWeight(nextB);

      if (wnextA !== wnextB) {
        return wnextA - wnextB
      }

      i++;
    } while (nextA && nextB);

    return a.localeCompare(b);
  }

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
          const sorted = [...classes].sort(classSorter);
          return sorted.join(' ');
        }
      }
    }
  };
});
