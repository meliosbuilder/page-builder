define([
    'jquery',
    'underscore',
    'jquery-ui-modules/resizable'
], function ($, _) {
    'use strict';

    function resizable(cm) {
        $(cm.getWrapperElement()).resizable({
            handles: 's',
            resize: _.debounce(() => cm.refresh(), 100),
            zIndex: 900
        });
    }

    function controls(cm) {
        $(cm.getWrapperElement()).append(`
            <div class="mls-cm-controls">
                <button data-mls-cm data-action="toggleFullscreen" data-option="fullScreen" data-value="false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
                </button>
                <button data-mls-cm data-action="toggleTheme" data-option="theme" data-value="light" data-global="true">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    </span>
                </button>
            </div>
        `);

        cm.on('optionChange', (cm, option) => {
            var value = cm.getOption(option);

            if (option === 'theme') {
                value = value === cm.getOption('themeLight') ? 'light' : 'dark';
            }

            $(cm.getWrapperElement()).find(`[data-option="${option}"]`)
                .attr('data-value', value);
        });

        $(cm.getWrapperElement()).find('[data-mls-cm]').each((i, button) => {
            var option = $(button).data('option'),
                value = cm.getOption(option);

            if (option === 'theme') {
                value = value === cm.getOption('themeLight') ? 'light' : 'dark';
            }

            $(button).attr('data-value', value);
        });

        $(document).on('click', '[data-mls-cm]', function (e) {
            if ($(this).data('global') || cm.getWrapperElement().contains(this)) {
                cm.execCommand($(this).data('action'));
            }
        });
    }

    return function (cm) {
        resizable(cm);
        controls(cm);
    };
});
