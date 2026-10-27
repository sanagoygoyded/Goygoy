/**
 * Gods of Egypt MMORPG - Global Error Handler
 * Hata yakalama, logging ve graceful degradation
 */

(function(window) {
    'use strict';

    class ErrorHandler {
        constructor() {
            this.errors = [];
            this.init();
        }

        init() {
            // Global error handler
            window.addEventListener('error', (event) => {
                this.logError('Global Error', event.message, event.filename, event.lineno);
                this.showErrorToast('Bir hata oluştu. Oyun çalışmaya devam ediyor.');
            });

            // Unhandled promise rejection handler
            window.addEventListener('unhandledrejection', (event) => {
                this.logError('Unhandled Promise Rejection', event.reason);
                event.preventDefault();
            });

            console.log('Error Handler initialized');
        }

        logError(type, message, file = '', line = 0) {
            const error = {
                type,
                message,
                file,
                line,
                timestamp: new Date().toISOString()
            };
            
            this.errors.push(error);
            
            // Keep only last 50 errors
            if (this.errors.length > 50) {
                this.errors.shift();
            }

            // Log to console
            console.error(`[${type}] ${message}`, file ? `at ${file}:${line}` : '');
        }

        showErrorToast(message) {
            if (window.GameHUD) {
                window.GameHUD.showToast(message, 'danger');
            }
        }

        getErrors() {
            return this.errors;
        }

        clearErrors() {
            this.errors = [];
        }

        // Safe function wrapper
        safeExecute(fn, fallback = null) {
            try {
                return fn();
            } catch (e) {
                this.logError('Safe Execute Error', e.message);
                if (fallback) return fallback();
                return null;
            }
        }

        // Safe async function wrapper
        async safeExecuteAsync(fn, fallback = null) {
            try {
                return await fn();
            } catch (e) {
                this.logError('Safe Async Execute Error', e.message);
                if (fallback) return await fallback();
                return null;
            }
        }
    }

    // Initialize
    window.ErrorHandler = new ErrorHandler();

})(window);
