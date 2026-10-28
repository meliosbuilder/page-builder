define([], function () {
    'use strict';

    const MARGIN = 12,
        RECHECK = 1000;

    var last = null,
        observer = null,
        observed = new WeakSet();

    function scroll(el, stage) {
        var header = stage.querySelector(':scope > .pagebuilder-header'),
            bounds = stage.getBoundingClientRect(),
            rect = el.getBoundingClientRect(),
            top = (header ? header.getBoundingClientRect().bottom : bounds.top) + MARGIN,
            bottom = bounds.bottom - MARGIN;

        if (rect.top >= top && rect.bottom <= bottom) {
            return;
        }

        stage.scrollBy({
            top: rect.top < top || rect.height > bottom - top ? rect.top - top : rect.bottom - bottom,
            behavior: 'smooth',
        });
    }

    function size(target) {
        return [target.stage.clientWidth, target.stage.clientHeight, target.el.offsetHeight].join();
    }

    function onResize() {
        var current;

        if (!last || performance.now() - last.time >= RECHECK || !last.el.isConnected) {
            return;
        }

        current = size(last);

        if (current !== last.size) {
            last.size = current;
            scroll(last.el, last.stage);
        }
    }

    return function scrollIntoStage(el) {
        var stage = el.closest('.pagebuilder-stage-wrapper.stage-full-screen');

        // Not displayed (Live mode)
        if (!el.getClientRects().length) {
            return;
        }

        if (!stage) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }

        observer = observer || new ResizeObserver(onResize);

        if (!observed.has(stage)) {
            observed.add(stage);
            observer.observe(stage);
        }

        if (last?.el !== el) {
            if (last) {
                observer.unobserve(last.el);
            }

            observer.observe(el);
        }

        last = { el, stage, time: performance.now() };
        last.size = size(last);
        scroll(el, stage);
    };
});
