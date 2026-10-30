define([
    'jquery',
    'mage/translate'
], function ($, $t) {
    'use strict';

    document.head.appendChild(document.createElement('style')).innerHTML = `
        .melios-spotlight {
            position: fixed;
            inset: 0;
            z-index: 9999999;

            .mls-overlay {
                position: absolute;
                inset: 0;
                background: rgba(255,255,255,.5);
            }

            .mls-popup {
                display: flex;
                flex-direction: column;
                position: absolute;
                top: 5vh;
                left: calc(50% - min(90vw, 784px) / 2);
                width: 90vw;
                max-width: 784px;
                max-height: 90vh;
                overflow: hidden;
                color: #3d3530;
                background: #f6f6f5;
                border-radius: 18px;
                box-shadow: 0 0 0 .5px rgba(0,0,0,.15),
                            0 30px 80px rgba(0,0,0,.35);
            }

            .mls-head {
                display: flex;
                flex-shrink: 0;
                align-items: center;
                gap: 16px;
                height: 76px;
                padding: 0 24px 0 30px;
                border-bottom: 1px solid #e2e0dd;

                input {
                    flex: 1;
                    min-width: 0;
                    border: 0;
                    background: none;
                    padding: 0;
                    color: inherit;
                    font-size: 22px;
                    &:focus {
                        box-shadow: none;
                    }
                }

                .mls-close {
                    display: flex;
                    flex-shrink: 0;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border-radius: 6px;
                    width: 40px;
                    height: 40px;
                    svg {
                        opacity: .6;
                        width: 26px;
                        height: 26px;
                    }
                    &:hover {
                        background: rgba(0,0,0,.035);
                        svg {
                            opacity: .8;
                        }
                    }
                }
            }

            .mls-body {
                display: flex;
                flex-direction: column;
                gap: 28px;
                min-height: 0;
                overflow: auto;
                padding: 24px 30px 32px;
                user-select: none;

                .mls-group {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .mls-title {
                    font-size: 13px;
                    letter-spacing: .08em;
                    text-transform: uppercase;
                    color: #6f665f;
                }
                .mls-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .mls-empty {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding-top: 4px;
                }
                .mls-empty-title {
                    font-size: 18px;
                    font-weight: 500;
                }
                .mls-empty-hint {
                    font-size: 14px;
                    color: #6f665f;
                }

                .item {
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 9px;
                    box-sizing: border-box;
                    width: 112px;
                    height: 96px;
                    padding: 17px 6px 0;
                    background: #fff;
                    border: 1px solid #e4e1dd;
                    border-radius: 8px;
                    font-size: 14px;
                    line-height: 1.2;
                    text-align: center;

                    &:focus {
                        box-shadow: none;
                    }
                    &.active {
                        border-color: #3d3530;
                        box-shadow: inset 0 0 0 1px #3d3530;
                    }

                    > i,
                    .mls-image {
                        display: flex;
                        flex: none;
                        align-items: center;
                        justify-content: center;
                        width: 44px;
                        height: 30px;
                        font-size: 28px;
                    }
                    .mls-image > * {
                        width: 44px;
                        height: 30px;
                    }
                    .mls-label {
                        display: flex;
                        flex-direction: column;
                        gap: 2px;
                        max-width: 100%;
                    }
                    .mls-note {
                        font-size: 12px;
                        color: #7a716a;
                    }

                    &.mls-wide {
                        flex-direction: row;
                        gap: 16px;
                        width: 100%;
                        height: auto;
                        padding: 16px 20px;
                        border-radius: 12px;
                        color: inherit;
                        text-align: left;
                        text-decoration: none;

                        > i,
                        .mls-image {
                            width: 44px;
                            height: 44px;
                        }
                        .mls-image > * {
                            width: 30px;
                            height: 30px;
                        }
                        .mls-label {
                            flex: 1;
                            min-width: 0;
                            gap: 3px;
                            > :first-child {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                font-size: 16px;
                                font-weight: 500;
                            }
                        }
                        .mls-note {
                            font-size: 13px;
                            color: #6f665f;
                        }
                    }
                    .mls-kbd {
                        flex: none;
                        padding: 2px 7px;
                        border: 1px solid #d9d5d0;
                        border-bottom-width: 2px;
                        border-radius: 5px;
                        background: #fafaf9;
                        color: #6f665f;
                        font-family: 'Fira Mono', monospace;
                        font-size: 12px;
                    }
                    .mls-pro {
                        padding: 2px 5px;
                        border-radius: 4px;
                        background: #3d3530;
                        color: #fff;
                        font-size: 10px;
                        font-weight: 500;
                        letter-spacing: .06em;
                    }
                    .mls-cta {
                        flex: none;
                        padding: 8px 14px;
                        border-radius: 8px;
                        background: #3d3530;
                        color: #fff;
                        font-size: 14px;
                        font-weight: 500;
                    }
                }
            }
        }
        .mls-mouse .melios-spotlight .mls-body .item:hover {
            border-color: #3d3530;
        }
    `;

    function eventMatchesHotkeys(e, hotkeys) {
        return hotkeys.some(hotkey => {
            return hotkey.every(key => {
                if (['cmd', 'ctrl'].includes(key)) {
                    return e.metaKey || e.ctrlKey;
                }
                return e.key === key || e.code === key;
            });
        })
    }

    // Label with its note, e.g. "Row Full Width"
    function text(item) {
        return (item.label + (item.note ? ' ' + item.note : '')).toLowerCase();
    }

    // Image: <svg> markup or a URL, otherwise an icon class
    function icon(item) {
        if (!item.image) {
            return `<i class="${item.icon || ''}"></i>`;
        }

        return `<span class="mls-image">${item.image.startsWith('<') ? item.image : `<img src="${item.image}" alt="">`}</span>`;
    }

    function escape(value) {
        return $('<div>').text(value).html();
    }

    // Items under their group titles, groups in the order of their first item
    function groups(items) {
        var list = [];

        items.forEach(item => {
            var group = list.find(group => group.title === (item.group || ''));

            if (!group) {
                list.push(group = { title: item.group || '', items: [] });
            }
            group.items.push(item);
        });

        return list;
    }

    // Fallback item as a card: "Compose “hero banner” with AI"
    function wide(item, query) {
        return `<div class="item mls-wide" tabindex="0" data-id="${item.id}">
            ${icon(item)}
            <span class="mls-label">
                <span>${item.fallback.label.replace('%1', escape(query))}</span>
                ${item.fallback.note ? `<span class="mls-note">${item.fallback.note}</span>` : ''}
            </span>
            <span class="mls-kbd">↵ Enter</span>
        </div>`;
    }

    function tile(item) {
        return `<div class="item ${item.class || ''}" tabindex="0" data-id="${item.id}">
            ${icon(item)}
            <span class="mls-label">
                <span>${item.label}</span>
                ${item.note ? `<span class="mls-note">${item.note}</span>` : ''}
            </span>
        </div>`;
    }

    $.widget('melios.spotlight', {
        options: {
            hotkeys: {
                open: [['Slash']],
                toggle: [['cmd', 'Enter']],
            },
            canOpen: (e) => true,
            onSelect: (id, event) => true,
            items: [],
            context: () => null,
            // Heading when nothing matches. hint: from the fallback item, if any
            empty: (query, hint) => `<div class="mls-empty">
                <div class="mls-empty-title">${$t('No results for “%1”').replace('%1', escape(query))}</div>
                <div class="mls-empty-hint">${hint || $t('Check the spelling, or try another name.')}</div>
            </div>`,
            markup: `
                <div class="mls-overlay"></div>
                <div class="mls-popup">
                    <div class="mls-head">
                        <input placeholder="Search for content...">
                        <div class="mls-close">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                    <div class="mls-body"></div>
                </div>
            `,
        },
        _create: function () {
            $(document).on('mousemove', (e) => {
                $('html').addClass('mls-mouse');
            });

            $(document).on('keydown', (e) => {
                $('html').removeClass('mls-mouse');

                if (e.code === 'Escape' && this.opened()) {
                    return this.input.val() ? this.clear().focus() : this.close();
                }

                if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && this.opened()) {
                    var active = this.body.find('.item.active');

                    // A link card (upgrade)
                    if (active.is('a')) {
                        e.preventDefault();
                        return active[0].click();
                    }
                    this.run(active.attr('data-id'), e);
                }

                if (eventMatchesHotkeys(e, this.options.hotkeys.toggle)) {
                    if (this.opened()) {
                        this.close();
                        e.preventDefault();
                    } else if (this.options.canOpen(e)) {
                        this.open();
                        e.preventDefault();
                    }
                    return;
                }

                if (eventMatchesHotkeys(e, this.options.hotkeys.open)) {
                    if (!this.opened() && this.options.canOpen(e)) {
                        this.open();
                        e.preventDefault();
                    }
                    return;
                }

                if (!this.opened()) {
                    return;
                }

                if (e.code.startsWith('Key') ||
                    e.code.startsWith('Digit') ||
                    ['Space', 'Backspace'].includes(e.code)
                ) {
                    this.input.focus();
                } else if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
                    this.selectRow(e.code === 'ArrowDown' ? 1 : -1);
                    e.preventDefault();
                } else if (['ArrowLeft', 'ArrowRight'].includes(e.code) &&
                    !(this.input.is(document.activeElement) && this.input.val())
                ) {
                    this[e.code === 'ArrowRight' ? 'selectNext' : 'selectPrev']();
                    e.preventDefault();
                } else if (e.code === 'Tab') {
                    this[e.shiftKey ? 'selectPrev' : 'selectNext']();
                    e.preventDefault();
                }
            });
            $(document).on('click', '.mls-body .item', (e) => {
                if (!this.opened()) {
                    return;
                }
                this.run($(e.target).closest('.item').attr('data-id'), e);
            });
        },
        open: function (context) {
            this.context = context || this.options.context() || null;
            this.element.addClass('melios-spotlight');

            if (!this.input) {
                this.element.html(this.options.markup);
                this.input = this.element.find('.mls-head input');
                this.input.on('input', this.renderItems.bind(this));

                this.body = this.element.find('.mls-body');
                this.body.on('focusin', '.item', (e) => {
                    if (!$(e.target).hasClass('active')) {
                        this.select(this.body.find('.item').index(e.target));
                    }
                });

                this.element.find('.mls-close').click(this.close.bind(this));
            }

            this.renderItems();
            this.element.show();
            this.input.focus().select();
        },
        opened: function () {
            return this.element.is(':visible');
        },
        close: function () {
            var context = this.context;

            this.context = null;
            this.element.hide();
            context?.onClose?.();
        },
        clear: function () {
            this.input.val('').trigger('input');
            return this;
        },
        focus: function () {
            this.input.focus();
        },
        run: function (id, e) {
            var item = this.rendered?.find(rendered => String(rendered.id) === id);

            if (id && (this.context?.onSelect || this.options.onSelect)(id, e, item)) {
                this.close();
                setTimeout(() => this.clear(), 50);
            }
        },
        renderItems: function () {
            var query = this.input.val(),
                found = this.items(),
                source = this.context?.items || this.options.items,
                fallbacks = [],
                popular = [];

            // Nothing matches: the items that can make anything (AI Composer), then the popular ones
            if (!found.length && Array.isArray(source)) {
                fallbacks = source
                    .filter(item => item.fallback)
                    .map(item => $.extend({}, item, { preset: item.fallback.preset?.(query) || item.preset }));
                popular = source
                    .filter(item => item.popular !== null && item.popular !== undefined)
                    .sort((a, b) => a.popular - b.popular)
                    .map(item => $.extend({}, item, { group: $t('Popular') }));
            }

            this.rendered = found.length ? found : fallbacks.concat(popular);
            this.body.html(found.length ? '' : this.options.empty(query, fallbacks[0]?.fallback.hint));

            if (fallbacks.length) {
                this.body.append(`<div class="mls-group">${fallbacks.map(item => wide(item, query)).join('')}</div>`);
            }

            this.body.append(groups(found.length ? found : popular).map(group => {
                return `<div class="mls-group">
                    ${group.title ? `<div class="mls-title">${escape(group.title)}</div>` : ''}
                    <div class="mls-grid">${group.items.map(tile).join('')}</div>
                </div>`;
            }).join(''));

            // The best match, which may come in a later group. Nothing matches: the first card
            this.select(found.length ?
                this.body.find('.item').index(this.body.find(`.item[data-id="${found[0].id}"]`)) :
                0);
        },
        items: function (items) {
            if (items) {
                this.options.items = items;
                if (this.body) {
                    this.renderItems();
                }
                return;
            }

            var source = this.context?.items || this.options.items;

            if (typeof source === 'function') {
                return source(this.input.val());
            }

            function fuzzyMatch(pattern, str) {
                pattern = '.*' + pattern.split('').map(l => {
                    return l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*'
                }).join('');
                return (new RegExp(pattern)).test(str);
            }

            var pattern = this.input.val().toLowerCase();

            return source
                .filter(item => fuzzyMatch(pattern, text(item)))
                .sort((a, b) => {
                    var aObj = {
                            score: 0,
                            label: text(a),
                        },
                        bObj = {
                            score: 0,
                            label: text(b),
                        };

                    // the more letters matches the start of the label the higher the rank
                    [aObj, bObj].forEach(obj => {
                        var tmp = pattern;
                        do {
                            if (obj.label.indexOf(tmp) === 0) {
                                obj.score += tmp.length;
                                break;
                            }
                        } while (tmp = tmp.slice(0, -1));
                    });

                    return bObj.score - aObj.score;
                });
        },
        selectNext: function () {
            var items = this.body.find('.item'),
                index = items.index(items.filter('.active'));

            index = index < items.length - 1 ? index : -1;

            this.select(index + 1).focus();
        },
        selectPrev: function () {
            var items = this.body.find('.item'),
                index = items.index(items.filter('.active'));

            index = index > 0 ? index : items.length;

            this.select(index - 1).focus();
        },
        // The nearest item in the next row (dir: 1) or the previous one (-1)
        selectRow: function (dir) {
            var items = this.body.find('.item').get(),
                active = items.find(item => $(item).hasClass('active')),
                from = active?.getBoundingClientRect(),
                rows,
                row;

            if (!from) {
                return this.select(dir > 0 ? 0 : items.length - 1).focus();
            }

            rows = items
                .map(item => ({ item, rect: item.getBoundingClientRect() }))
                .filter(({ rect }) => dir > 0 ? rect.top > from.bottom - 1 : rect.bottom < from.top + 1);

            if (!rows.length) {
                return this.select(dir > 0 ? 0 : items.length - 1).focus();
            }

            row = rows.reduce((top, { rect }) => dir > 0 ? Math.min(top, rect.top) : Math.max(top, rect.top), dir * Infinity);

            row = rows
                .filter(({ rect }) => rect.top === row)
                .reduce((nearest, entry) => {
                    var distance = Math.abs(entry.rect.left - from.left);

                    return !nearest || distance < nearest.distance ? { item: entry.item, distance } : nearest;
                }, null);

            this.select(items.indexOf(row.item)).focus();
        },
        select: function (index) {
            return this.body.find('.item').removeClass('active')
                .eq(index)
                .addClass('active');
        }
    });

    return $.melios.spotlight;
});
