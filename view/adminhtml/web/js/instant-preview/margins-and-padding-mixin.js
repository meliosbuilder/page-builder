define([
    'underscore',
    'ko',
    'mage/translate'
], function (_, ko, $t) {
    'use strict';

    const SIDES = ['top', 'right', 'bottom', 'left'];
    const MODES = ['all', 'axis', 'sides'];
    const NUMBER = /^-?\d+(\.\d+)?$/;

    // Which sides an input writes, the first one is shown
    const INPUTS = {
        all: { sides: [0, 1, 2, 3], label: $t('all sides') },
        vertical: { sides: [0, 2], label: $t('top and bottom') },
        horizontal: { sides: [1, 3], label: $t('left and right') },
        top: { sides: [0], label: $t('top') },
        right: { sides: [1], label: $t('right') },
        bottom: { sides: [2], label: $t('bottom') },
        left: { sides: [3], label: $t('left') }
    };
    const MODE_INPUTS = {
        all: ['all'],
        axis: ['vertical', 'horizontal'],
        sides: ['top', 'right', 'bottom', 'left']
    };

    // Drag handles of the V / H inputs. All has no icon (the label drags), Sides uses the box edges.
    const arrow = path => '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
    const ICONS = {
        vertical: arrow('<path d="M12 3v18"/><path d="m8 7 4-4 4 4"/><path d="m8 17 4 4 4-4"/>'),
        horizontal: arrow('<path d="M3 12h18"/><path d="m7 8-4 4 4 4"/><path d="m17 8 4 4-4 4"/>')
    };

    // Magento stores plain numbers (px): "10px" => "10", " Auto " => "auto"
    function clean(value) {
        return String(value ?? '').trim().toLowerCase().replace(/^(-?\d*\.?\d+)\s*px$/, '$1');
    }

    function modeOf(values) {
        if (values.every(v => v === values[0])) {
            return 'all';
        }

        return values[0] === values[2] && values[1] === values[3] ? 'axis' : 'sides';
    }

    return function (target) {
        return target.extend({
            // Whole field template (two Magento field rows), set after config: forms set "template" to ui/form/field
            initConfig: function () {
                this._super();
                this.template = 'Melios_PageBuilder/form/element/margins-and-padding';

                return this;
            },

            initObservable: function () {
                this._super();

                this.spacingGroups = [
                    this._createSpacingGroup('margin', $t('Margin')),
                    this._createSpacingGroup('padding', $t('Padding'))
                ];

                return this;
            },

            setInitialValue: function () {
                this._super();
                this.spacingGroups.forEach(group => group.mode(modeOf(group.values())));

                return this;
            },

            // Margin allows "auto", which isn't a number
            validate: function () {
                const value = this.value;

                // ponytail: swaps this.value for the sync validate call only
                this.value = () => {
                    const data = value();

                    return data?.margin
                        ? { ...data, margin: _.mapObject(data.margin, v => v === 'auto' ? '' : v) }
                        : data;
                };

                try {
                    return this._super();
                } finally {
                    this.value = value;
                }
            },

            _createSpacingGroup: function (type, label) {
                const observables = SIDES.map(side => this[type + side.capitalize()]);
                const values = () => observables.map(o => clean(o()));
                // Sides are written one by one, each echoes back via _updateObservables.
                // Half-written values must not switch the mode.
                const write = (sides, list) => {
                    this._spacingWriting = true;
                    try {
                        sides.forEach((side, i) => observables[side](list[i]));
                    } finally {
                        this._spacingWriting = false;
                    }
                };
                const set = list => write([0, 1, 2, 3], list);
                const mode = ko.observable('all');
                // Values before switching to fewer inputs, see setMode
                let stash = null;
                const collapse = ([t, r, b, l], to) => {
                    if (to === 'all') {
                        return [t, t, t, t];
                    }

                    return to === 'axis' ? [t, r, t, r] : [t, r, b, l];
                };
                const min = type === 'padding' ? 0 : -999;
                const isValid = v => v === '' || NUMBER.test(v) || (type === 'margin' && v === 'auto');
                const placeholder = this.placeholder;

                const nudge = (from, delta) => {
                    if (!delta) {
                        return from;
                    }

                    const number = Math.round(((parseFloat(from) || 0) + delta) * 100) / 100;

                    return String(Math.min(999, Math.max(min, number)));
                };

                const canNudgeAll = list => list.every(v => v === '' || NUMBER.test(v));

                // Horizontal drag from a handle: right increases, 1 per 2px (Shift: 10)
                const drag = (event, apply) => {
                    const handle = event.currentTarget;
                    const x = event.clientX;
                    const move = e => apply(Math.round((e.clientX - x) / 2) * (e.shiftKey ? 10 : 1));
                    // Captured pointer keeps sending events (and the release) outside the window
                    const stop = () => {
                        handle.removeEventListener('pointermove', move);
                        handle.removeEventListener('lostpointercapture', stop);
                        document.body.classList.remove('_mls-scrubbing');
                    };

                    handle.setPointerCapture(event.pointerId);
                    handle.addEventListener('pointermove', move);
                    handle.addEventListener('lostpointercapture', stop);
                    document.body.classList.add('_mls-scrubbing');

                    return false;
                };

                // All sides at once: the centre of the Sides box
                const scrubAll = (data, event) => {
                    const start = values();

                    if (this.disabled() || !canNudgeAll(start)) {
                        return true;
                    }

                    return drag(event, delta => set(start.map(v => nudge(v, delta))));
                };

                const grow = to => {
                    if (MODES.indexOf(to) > MODES.indexOf(mode())) {
                        mode(to);
                    }
                };

                // Mode change re-renders the inputs: find the container first, focus after render
                const focusInput = (container, index) => setTimeout(() => {
                    const input = container?.querySelectorAll('input')[index];

                    input?.focus();
                    // Caret at the end, nothing selected
                    input?.setSelectionRange(input.value.length, input.value.length);
                });

                // Returns the index of the input to focus.
                // All, or top in Sides: CSS shorthand, "10px 15px" => top/bottom 10, left/right 15.
                // V / H, two values: the input's own sides, "10 20" in V => top 10, bottom 20; "5 8" in H => left 5, right 8.
                // V / H, more values: CSS shorthand.
                // Later side in Sides: values go on side by side from it, "15 9" in right => right 15, bottom 9.
                const split = (text, key) => {
                    const parts = text.trim().split(/\s+/).map(clean);
                    const start = INPUTS[key].sides[0];

                    if (mode() === 'axis' && parts.length === 2) {
                        const pair = key === 'vertical' ? [0, 2] : [3, 1];
                        const list = values();

                        list[pair[0]] = parts[0];
                        list[pair[1]] = parts[1];
                        set(list);
                        mode('sides');

                        return pair[1];
                    }

                    if (mode() !== 'sides' || start === 0) {
                        const [t, r = t, b = t, l = r] = parts.slice(0, 4);

                        set([t, r, b, l]);
                        grow(parts.length === 2 ? 'axis' : 'sides');

                        return MODE_INPUTS[mode()].length - 1;
                    }

                    const list = values();
                    const count = Math.min(parts.length, 4 - start);

                    parts.slice(0, count).forEach((v, i) => {
                        list[start + i] = v;
                    });
                    set(list);
                    mode('sides');

                    return start + count - 1;
                };

                const createInput = key => {
                    const { sides, label: sideLabel } = INPUTS[key];
                    // Text with spaces stays in the input only (no half-typed preview),
                    // split when typing stops, on Enter or blur
                    let shorthand = null;
                    let timer;
                    const value = ko.pureComputed({
                        read: () => clean(observables[sides[0]]()),
                        write: raw => {
                            shorthand = /\s/.test(String(raw).trim()) ? raw : null;
                            if (shorthand === null) {
                                write(sides, sides.map(() => clean(raw)));
                            }
                        }
                    });
                    const canNudge = () => value() === '' || NUMBER.test(value());
                    const containerOf = event => event.target.closest('.mls-spacing-inputs');
                    // Splits typed shorthand, returns where to focus: {container, index}
                    const commit = event => {
                        clearTimeout(timer);
                        if (shorthand === null) {
                            return null;
                        }

                        const container = containerOf(event);
                        const index = split(shorthand, key);

                        shorthand = null;
                        // Same mode keeps the inputs: refresh the one holding the typed text
                        value.notifySubscribers(value());

                        return { container, index };
                    };

                    return {
                        side: key,
                        value: value,
                        icon: ICONS[key] || '',
                        ariaLabel: `${label} ${sideLabel}`,
                        // V / H and Sides inputs are narrow: a dash says "not set"
                        placeholder: key === 'all' ? placeholder : '–',
                        scrubTitle: $t('Drag to change, double-click to reset'),
                        invalid: ko.pureComputed(() => !isValid(value())),

                        // Pasted shorthand splits at once, focus goes to the last input
                        paste: (data, event) => {
                            const text = (event.originalEvent || event).clipboardData.getData('text');

                            if (!/\s/.test(text.trim())) {
                                return true;
                            }

                            const container = containerOf(event);

                            focusInput(container, split(text, key));

                            return false;
                        },

                        // Pause in typing splits like Enter; focus moves on only if it's still here
                        input: (data, event) => {
                            const target = event.target;

                            clearTimeout(timer);
                            timer = setTimeout(() => {
                                const focused = document.activeElement === target;
                                const next = commit({ target });

                                if (next && focused) {
                                    focusInput(next.container, next.index);
                                }
                            }, 400);

                            return true;
                        },

                        // Leaving the input splits typed shorthand, focus stays where the user went.
                        // Not "change": instant preview triggers it on every input event.
                        blur: (data, event) => {
                            commit(event);

                            return true;
                        },

                        keydown: (data, event) => {
                            if (event.key === 'Enter') {
                                const next = commit(event);

                                if (next) {
                                    focusInput(next.container, next.index);

                                    return false;
                                }

                                return true;
                            }

                            const direction = { ArrowUp: 1, ArrowDown: -1 }[event.key];

                            if (!direction || !canNudge()) {
                                return true;
                            }

                            value(nudge(value(), direction * (event.shiftKey ? 10 : 1)));

                            return false;
                        },

                        // Double click on the drag handle: back to default
                        reset: () => {
                            if (!this.disabled()) {
                                write(sides, sides.map(() => ''));
                            }
                        },

                        // V / H icon, Sides box edge
                        scrub: (data, event) => {
                            if (this.disabled() || !canNudge()) {
                                return true;
                            }

                            const start = value();

                            return drag(event, delta => value(nudge(start, delta)));
                        }
                    };
                };

                const inputs = _.mapObject(INPUTS, (config, key) => createInput(key));

                return {
                    label: label,
                    modesLabel: $t('%1 input mode').replace('%1', label),
                    sidesLabel: $t('%1 per side').replace('%1', label),
                    scrubTitle: $t('Drag to change, double-click to reset'),
                    scrubAll: scrubAll,
                    resetAll: () => {
                        if (!this.disabled()) {
                            set(['', '', '', '']);
                        }
                    },
                    disabled: this.disabled,
                    mode: mode,
                    values: values,
                    modes: [
                        { id: 'all', label: $t('All') },
                        { id: 'axis', label: 'V / H' },
                        { id: 'sides', label: $t('Sides') }
                    ],
                    inputs: ko.pureComputed(() => MODE_INPUTS[mode()].map(key => inputs[key])),

                    // Fewer inputs keep the first value of what they merge. The values before that are kept,
                    // so switching back restores them, until the values change (typing, drag, undo...)
                    setMode: ({ id }) => {
                        if (stash && !_.isEqual(values(), collapse(stash, mode()))) {
                            stash = null;
                        }

                        const base = stash || values();
                        const keep = stash || (MODES.indexOf(id) < MODES.indexOf(mode()) ? values() : null);

                        set(collapse(base, id));
                        stash = keep;
                        mode(id);
                    },

                    // Values from outside (undo, other inputs) may need more inputs, never fewer
                    expandMode: () => {
                        const needed = modeOf(values());

                        if (MODES.indexOf(needed) > MODES.indexOf(mode())) {
                            mode(needed);
                        }
                    }
                };
            },

            // Fixed not working "reset"
            reset: function () {
                this._super();

                _.each(this.initialValue, (attributeData, attributeType) => {
                    _.each(attributeData, (attributeValue, attributeDirection) => {
                        if (attributeValue === '') {
                            this[attributeType + attributeDirection.capitalize()](attributeValue);
                        }
                    });
                });
            },

            // Magento skips empty sides, so a value set from outside (undo/redo) couldn't clear an input
            _updateObservables: function (value) {
                if (value && _.isString(value)) {
                    value = JSON.parse(value);
                }

                ['margin', 'padding'].forEach(type => {
                    ['top', 'right', 'bottom', 'left'].forEach(direction => {
                        this[type + direction.capitalize()](value?.[type]?.[direction] ?? '');
                    });
                });

                if (!this._spacingWriting) {
                    this.spacingGroups?.forEach(group => group.expandMode());
                }
            }
        });
    };
});
