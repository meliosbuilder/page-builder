define([
    'jquery'
], function ($) {
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
                left: calc(50% - min(90vw, 750px) / 2);
                width: 90vw;
                max-width: 750px;
                height: 476px;
                background: #f6f6f6;
                border-radius: 10px;
                box-shadow: 0 0 0 .5px rgba(0,0,0,.15),
                            0 15px 35px -5px rgba(0,0,0,.3);
            }

            .mls-head {
                display: flex;
                align-items: center;
                border-bottom: 1px solid #e1e1e1;

                input {
                    border: 0;
                    border-radius: 10px 10px 0 0;
                    background: none;
                    width: 100%;
                    padding: 14px 40px 14px 15px;
                    font-size: 16px;
                    &:focus {
                        box-shadow: none;
                    }
                }

                .mls-close {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: -40px;
                    cursor: pointer;
                    border-radius: 6px;
                    width: 30px;
                    height: 30px;
                    svg {
                        opacity: .6;
                        width: 24px;
                        height: 24px;
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
                flex-grow: 1;
                overflow: auto;
                border-radius: 0 0 10px 10px;
                padding: 6px 8px;
                user-select: none;

                .item {
                    cursor: pointer;
                    border-radius: 6px;
                    padding: 8px;
                    margin-bottom: 1px;
                    display: flex;
                    align-items: center;
                    gap: 6px;

                    &:focus {
                        box-shadow: none;
                    }
                    &.active {
                        background: rgba(0,0,0,.07);
                    }
                }
            }
        }
        .mls-mouse .melios-spotlight .mls-body .item:hover {
            background: rgba(0,0,0,.035);
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

    $.widget('melios.spotlight', {
        options: {
            hotkeys: {
                open: [['Slash']],
                toggle: [['cmd', 'Enter']],
            },
            canOpen: (e) => true,
            onSelect: (id, event) => true,
            items: [],
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
                    this.run(this.body.find('.item.active').data('id'), e);
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
                } else if (e.code === 'ArrowDown') {
                    this.selectNext();
                    e.preventDefault();
                } else if (e.code === 'ArrowUp') {
                    this.selectPrev();
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
                this.run($(e.target).data('id'), e);
            });
        },
        open: function () {
            this.element.addClass('melios-spotlight');

            if (!this.input) {
                this.element.html(this.options.markup);
                this.input = this.element.find('.mls-head input');
                this.input.on('input', this.renderItems.bind(this));

                this.body = this.element.find('.mls-body');
                this.body.on('focusin', '.item', (e) => {
                    if (!$(e.target).hasClass('active')) {
                        this.select($(e.target).index());
                    }
                });

                this.element.find('.mls-close').click(this.close.bind(this));

                this.renderItems();
            }

            this.element.show();
            this.input.focus().select();
        },
        opened: function () {
            return this.element.is(':visible');
        },
        close: function () {
            this.element.hide();
        },
        clear: function () {
            this.input.val('').trigger('input');
            return this;
        },
        focus: function () {
            this.input.focus();
        },
        run: function (id, e) {
            if (id && this.options.onSelect(id, e)) {
                this.close();
                setTimeout(() => this.clear(), 50);
            }
        },
        renderItems: function () {
            this.body.html(this.items().map(item => {
                return `<div class="item ${item.class || ''}" tabindex="0" data-id="${item.id}">
                    <i class="${item.icon}"></i>
                    ${item.label}
                </div>`;
            }) || '');
            this.select(0);
        },
        items: function () {
            if (typeof this.options.items === 'function') {
                return this.options.items(this.input.val());
            }

            function fuzzyMatch(pattern, str) {
                pattern = '.*' + pattern.split('').map(l => {
                    return l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*'
                }).join('');
                return (new RegExp(pattern)).test(str);
            }

            var pattern = this.input.val().toLowerCase();

            return this.options.items
                .filter(item => fuzzyMatch(pattern, item.label.toLowerCase()))
                .sort((a, b) => {
                    var aObj = {
                            score: 0,
                            label: a.label.toLowerCase(),
                        },
                        bObj = {
                            score: 0,
                            label: b.label.toLowerCase(),
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
                index = items.filter('.active').index();

            index = index < items.length - 1 ? index : -1;

            this.select(index + 1).focus();
        },
        selectPrev: function () {
            var items = this.body.find('.item'),
                index = items.filter('.active').index();

            index = index > 0 ? index : items.length;

            this.select(index - 1).focus();
        },
        select: function (index) {
            return this.body.find('.item').removeClass('active')
                .eq(index)
                .addClass('active');
        }
    });

    return $.melios.spotlight;
});
