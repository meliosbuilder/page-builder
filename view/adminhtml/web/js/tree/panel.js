define([
    'jquery',
    'knockout',
    'mage/translate',
    'Melios_PageBuilder/js/utils/storage',
    'Melios_PageBuilder/js/utils/toast',
    'Melios_PageBuilder/js/utils/add',
    'Melios_PageBuilder/js/tree/tree',
    'Melios_PageBuilder/js/tree/drag'
], function ($, ko, $t, storage, toast, add, Tree, Drag) {
    'use strict';

    const TABS = ['elements', 'layers'];

    function Panel(pageBuilder) {
        this.pageBuilder = pageBuilder;
        this.tree = new Tree(pageBuilder, this);
        this.drag = null;
        this.tab = null;
        this.el = null;
        this.rail = null;
        this.body = null;
    }

    Panel.prototype.titles = function () {
        return { elements: $t('Elements'), layers: $t('Layers') };
    };

    Panel.prototype.mount = function () {
        var el = $(this.pageBuilder.panel.element).find('.pagebuilder-panel').first(),
            titles = this.titles(),
            elements;

        if (!el.length || el.hasClass('mls-panel')) {
            return;
        }

        elements = $('<div class="mls-panel-elements">').append(el.contents());
        this.body = $('<div class="mls-panel-body">').append(elements);
        this.rail = $('<div class="mls-panel-rail" role="tablist" aria-orientation="vertical">')
            .append(TABS.map(tab => $('<button type="button" role="tab">')
                .attr({ 'data-tab': tab, title: titles[tab], 'aria-label': titles[tab] })));
        this.el = el.addClass('mls-panel').append(this.rail, this.body);

        this.rail.on('click', 'button', e => {
            var tab = e.currentTarget.dataset.tab;

            this.setTab(tab === this.tab ? null : tab, true);
        });
        elements.on('click', '.pagebuilder-draggable-content-type', e => this.addElement(e.currentTarget));

        this.tree.mount(this.body);
        this.drag = new Drag(this);
        this.restoreTab();
    };

    Panel.prototype.restoreTab = function () {
        var stored = storage.get('tree.tab');

        this.setTab(TABS.includes(stored) ? stored : stored === 'none' ? null : 'elements');
    };

    Panel.prototype.setTab = function (tab, remember) {
        this.tab = tab;
        this.el.closest('.pagebuilder-stage-wrapper').toggleClass('mls-panel-open', !!tab);
        this.el.toggleClass('mls-show-layers', tab === 'layers');
        this.rail.children().each((i, button) => {
            var active = button.dataset.tab === tab;

            button.classList.toggle('active', active);
            button.setAttribute('aria-selected', active);
        });

        if (remember) {
            storage.set('tree.tab', tab || 'none');
        }

        this.tree.render();
        this.tree.scrollToSelected();
    };

    Panel.prototype.visibleRect = function () {
        var rect = this.body[0].getBoundingClientRect();

        return {
            left: rect.left,
            right: rect.right,
            top: rect.top + this.tree.search[0].offsetHeight,
            bottom: rect.bottom,
        };
    };

    Panel.prototype.addElement = function (item) {
        var config = ko.dataFor(item)?.config,
            target = config && add.defaultTarget(this.pageBuilder, config.name);

        if (target) {
            add.create(config.name, target);
        } else if (config) {
            toast.error($t('%1 can\'t be added to this page.').replace('%1', config.label));
        }
    };

    return Panel;
});
