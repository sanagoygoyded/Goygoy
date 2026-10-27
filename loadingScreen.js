/**
 * Gods of Egypt MMORPG - Loading Screen Manager
 * Yükleme ekranları ve durum göstergeleri
 */

(function(window) {
    'use strict';

    class LoadingScreen {
        constructor() {
            this.overlay = null;
            this.progress = 0;
            this.statusText = 'Yükleniyor...';
        }

        show(text = 'Yükleniyor...', initialProgress = 0) {
            // Remove existing
            this.hide();

            this.progress = initialProgress;
            this.statusText = text;

            this.overlay = document.createElement('div');
            this.overlay.id = 'loading-overlay';
            this.overlay.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md';
            
            const iconHtml = typeof getIcon === 'function' ? getIcon('sparkle', 'large') : '';

            this.overlay.innerHTML = `
                <div class="text-center">
                    <div class="text-6xl text-amber-300 mb-6 animate-pulse">${iconHtml}</div>
                    <h2 class="hud-font-title text-2xl font-black text-amber-100 mb-4">Mısır Tanrıları MMORPG</h2>
                    <p class="text-sm text-amber-400/80 mb-6">${this.statusText}</p>
                    <div class="w-64 h-2 bg-black/50 rounded-full overflow-hidden mx-auto">
                        <div id="loading-progress-bar" class="h-full bg-gradient-to-r from-amber-600 to-yellow-300 transition-all duration-300" style="width: ${this.progress}%"></div>
                    </div>
                    <p id="loading-percentage" class="text-xs text-amber-400/60 mt-2">${Math.round(this.progress)}%</p>
                </div>
            `;

            document.body.appendChild(this.overlay);
        }

        updateProgress(newProgress, newText = null) {
            this.progress = Math.min(100, Math.max(0, newProgress));
            
            if (newText) {
                this.statusText = newText;
                const statusEl = this.overlay?.querySelector('p.text-sm');
                if (statusEl) statusEl.textContent = newText;
            }

            const progressBar = document.getElementById('loading-progress-bar');
            const percentage = document.getElementById('loading-percentage');
            
            if (progressBar) progressBar.style.width = `${this.progress}%`;
            if (percentage) percentage.textContent = `${Math.round(this.progress)}%`;
        }

        hide() {
            if (this.overlay) {
                this.overlay.style.opacity = '0';
                this.overlay.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    if (this.overlay && this.overlay.parentNode) {
                        this.overlay.parentNode.removeChild(this.overlay);
                    }
                    this.overlay = null;
                }, 300);
            }
        }
    }

    // Initialize
    window.LoadingScreen = new LoadingScreen();

})(window);
