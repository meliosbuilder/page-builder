define([
    'jquery',
    'knockout',
    'underscore',
    'mage/translate',
    'mage/utils/wrapper',
    'Magento_PageBuilder/js/config'
], function ($, ko, _, $t, wrapper, Config) {
    'use strict';

    var DATA_KEY = 'mls_hidden';

    function normalize(value) {
        if (typeof value === 'string') {
            return value.split(/\s+/).filter(Boolean);
        }
        return Array.isArray(value) ? value.slice() : [];
    }

    function humanize(name) {
        return name.split(/[-_]/).map(function (part) {
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join(' ');
    }

    function buildHint(conditions) {
        var min = conditions && conditions['min-width'],
            max = conditions && conditions['max-width'];

        if (min && max) {
            return min + ' – ' + max;
        }

        if (min) {
            return '≥ ' + min;
        }

        return max ? '≤ ' + max : '';
    }

    function supportsBreakpoints(contentType) {
        return _.some(contentType.config.appearances || {}, function (appearance) {
            return _.some(appearance.elements || {}, function (element) {
                return _.some(element.attributes || [], function (attribute) {
                    return attribute.var === DATA_KEY;
                });
            });
        });
    }

    function triggerFor(event) {
        var anchor = event.target.closest && event.target.closest('a.hide-show-content-type'),
            option;

        if (!anchor || anchor.contains(event.relatedTarget)) {
            return null;
        }

        option = ko.dataFor(anchor);

        return option && typeof option.mlsShowMenu === 'function'
            ? {
                anchor: anchor,
                option: option
            }
            : null;
    }

    // Capture phase: the preview templates stop mouseover propagation on the content type
    // ("mouseoverBubble: false"), so a bubbling or delegated listener never sees these.
    document.addEventListener('mouseover', function (event) {
        var trigger = triggerFor(event);

        if (trigger) {
            trigger.option.mlsShowMenu(trigger.anchor);
        }
    }, true);

    document.addEventListener('mouseout', function (event) {
        var trigger = triggerFor(event);

        if (trigger) {
            trigger.option.mlsScheduleHide();
        }
    }, true);

    return function (HideShowOption) {
        function MlsHideShowOption(config) {
            HideShowOption.call(this, config);

            this.mlsInit();
        }

        MlsHideShowOption.prototype = Object.create(HideShowOption.prototype);
        MlsHideShowOption.prototype.constructor = MlsHideShowOption;
        Object.setPrototypeOf(MlsHideShowOption, HideShowOption);

        MlsHideShowOption.prototype.mlsInit = function () {
            var contentType = this.preview.contentType,
                classes = this.classes(),
                breakpoints = _.pick(
                    Config.getConfig('breakpoints') || {},
                    breakpoint => !_.isEmpty(breakpoint.conditions)
                );

            this.mlsBreakpoints = supportsBreakpoints(contentType)
                ? _.map(breakpoints, function (breakpoint, name) {
                    return {
                        name: name,
                        label: breakpoint.label || humanize(name),
                        hint: buildHint(breakpoint.conditions),
                        hidden: ko.observable(false)
                    };
                })
                : [];

            this.mlsHasHidden = ko.computed(() => {
                return _.some(this.mlsBreakpoints, breakpoint => breakpoint.hidden());
            });

            classes['mls-has-hidden'] = this.mlsHasHidden;
            this.classes(classes);
            this.mlsSync(normalize(contentType.dataStore.get(DATA_KEY)));

            contentType.dataStore.subscribe(state => {
                this.mlsSync(normalize(state[DATA_KEY]));
            }, DATA_KEY);
        };

        MlsHideShowOption.prototype.mlsSync = function (hidden) {
            _.each(this.mlsBreakpoints, function (breakpoint) {
                breakpoint.hidden(hidden.includes(breakpoint.name));
            });

            this.mlsRender();
        };

        MlsHideShowOption.prototype.mlsToggle = function (breakpoint) {
            var hidden = normalize(this.preview.contentType.dataStore.get(DATA_KEY)),
                next;

            if (!hidden.includes(breakpoint.name)) {
                hidden.push(breakpoint.name);
            } else {
                hidden = _.without(hidden, breakpoint.name);
            }

            next = _.pluck(this.mlsBreakpoints, 'name').filter(function (name) {
                return hidden.includes(name);
            });

            this.preview.contentType.dataStore.set(DATA_KEY, next);
        };

        MlsHideShowOption.prototype.mlsBuildMenu = function () {
            var menu = $('<div class="mls-options-dropdown mls-hide-show-options"/>');

            this.mlsItems = _.map(this.mlsBreakpoints, breakpoint => {
                var item = $('<button type="button"/>')
                    .append($('<i/>'))
                    .append($('<span class="mls-option-label"/>').text(breakpoint.label))
                    .append($('<span class="mls-option-hint"/>').text(breakpoint.hint))
                    .on('click', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.mlsToggle(breakpoint);
                    });

                menu.append(item);

                return {
                    breakpoint: breakpoint,
                    element: item
                };
            });

            menu.on('mouseenter', () => {
                clearTimeout(this.mlsHideTimer);
            });
            menu.on('mouseleave', () => {
                this.mlsScheduleHide();
            });

            return menu;
        };

        MlsHideShowOption.prototype.mlsRender = function () {
            _.each(this.mlsItems || [], function (item) {
                var hidden = item.breakpoint.hidden();

                item.element
                    .toggleClass('mls-selected', hidden)
                    .attr('title', hidden
                        ? $t('Click to show on %1').replace('%1', item.breakpoint.label)
                        : $t('Click to hide on %1').replace('%1', item.breakpoint.label))
                    .find('i')
                    .attr('class', hidden ? 'icon-pagebuilder-hide' : 'icon-pagebuilder-show');
            });
        };

        MlsHideShowOption.prototype.mlsShowMenu = function (anchor) {
            var options = $(anchor).closest('.pagebuilder-options');

            if (!options.length || !this.mlsBreakpoints.length) {
                return;
            }

            if (!this.mlsMenu) {
                this.mlsMenu = this.mlsBuildMenu();
                this.mlsRender();
                this.mlsMenu.toggleClass(
                    'mls-globally-hidden',
                    !this.preview.contentType.dataStore.get('display')
                );
            }

            // The toolbar is re-rendered together with the content type, so re-attach when needed
            if (!$.contains(options[0], this.mlsMenu[0])) {
                options.append(this.mlsMenu);
            }

            clearTimeout(this.mlsHideTimer);
            $('.mls-options-dropdown.shown').removeClass('shown');
            this.mlsMenu.addClass('shown');
        };

        MlsHideShowOption.prototype.mlsScheduleHide = function () {
            clearTimeout(this.mlsHideTimer);
            this.mlsHideTimer = setTimeout(() => {
                if (this.mlsMenu) {
                    this.mlsMenu.removeClass('shown');
                }
            }, 300);
        };

        MlsHideShowOption.prototype.onDisplayChange = wrapper.wrap(
            HideShowOption.prototype.onDisplayChange,
            function (o, state) {
                o();

                if (this.mlsMenu) {
                    this.mlsMenu.toggleClass('mls-globally-hidden', !state.display);
                }
            }
        );

        return MlsHideShowOption;
    };
});
