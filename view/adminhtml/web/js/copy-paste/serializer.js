define([
    'underscore'
], (_) => {
    'use strict';

    function collectData(contentType) {
        return {
            config: _.pick(contentType.config, [
                'name',
            ]),
            states: contentType.getDataStoresStates(),
            children: contentType.children?.().map(child => collectData(child)),
        };
    }

    function parseData(string) {
        var data;

        if (!string?.length || !string.startsWith('{"')) {
            return;
        }

        try {
            data = JSON.parse(string);
        } catch (err) {
            return;
        }

        if (!data.config || !data.states) {
            return;
        }

        return data;
    }

    return {
        serialize: (contentType) => JSON.stringify(collectData(contentType)),
        unserialize: (string) => parseData(string),
    }
});
