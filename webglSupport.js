(function(window) {
    'use strict';

    const THREE = window.THREE;
    if (!THREE || !THREE.WebGLRenderer) return;

    const OriginalWebGLRenderer = THREE.WebGLRenderer;
    const ResilientWebGLRenderer = function(parameters = {}) {
        try {
            return new OriginalWebGLRenderer(parameters);
        } catch (initialError) {
            const fallbackParameters = Object.assign({}, parameters, {
                antialias: false,
                powerPreference: 'low-power',
                failIfMajorPerformanceCaveat: false
            });
            if (fallbackParameters.antialias === parameters.antialias
                && fallbackParameters.powerPreference === parameters.powerPreference
                && fallbackParameters.failIfMajorPerformanceCaveat === parameters.failIfMajorPerformanceCaveat) {
                throw initialError;
            }

            try {
                const renderer = new OriginalWebGLRenderer(fallbackParameters);
                console.warn('WebGL renderer started with compatibility settings.', initialError);
                return renderer;
            } catch (fallbackError) {
                throw new Error(`WebGL initialization failed: ${fallbackError.message || fallbackError}`);
            }
        }
    };

    ResilientWebGLRenderer.prototype = OriginalWebGLRenderer.prototype;
    Object.setPrototypeOf(ResilientWebGLRenderer, OriginalWebGLRenderer);
    THREE.WebGLRenderer = ResilientWebGLRenderer;
})(window);
