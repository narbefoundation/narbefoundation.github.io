/**
 * Accessibility Widget for NARBE Foundation
 * Provides user-controlled accessibility features following WCAG guidelines
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    storageKey: 'narbe-accessibility-prefs',
    fontSizeStep: 10, // percentage
    maxFontSize: 150,
    minFontSize: 100
  };

  // Default preferences
  const defaultPrefs = {
    fontSize: 100,
    highContrast: false,
    dyslexiaFont: false,
    largeSpacing: false,
    highlightLinks: false,
    largerCursor: false,
    reducedMotion: false,
    readingGuide: false,
    focusMode: false
  };

  // Current preferences
  let prefs = { ...defaultPrefs };

  // Load saved preferences
  function loadPrefs() {
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved) {
        prefs = { ...defaultPrefs, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load accessibility preferences:', e);
    }
  }

  // Save preferences
  function savePrefs() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Could not save accessibility preferences:', e);
    }
  }

  // Apply all preferences
  function applyPrefs() {
    const html = document.documentElement;
    const body = document.body;

    // Font size
    html.style.fontSize = prefs.fontSize + '%';

    // High contrast
    body.classList.toggle('a11y-high-contrast', prefs.highContrast);

    // Dyslexia font
    body.classList.toggle('a11y-dyslexia-font', prefs.dyslexiaFont);

    // Large spacing
    body.classList.toggle('a11y-large-spacing', prefs.largeSpacing);

    // Highlight links
    body.classList.toggle('a11y-highlight-links', prefs.highlightLinks);

    // Larger cursor
    body.classList.toggle('a11y-larger-cursor', prefs.largerCursor);

    // Reduced motion
    body.classList.toggle('a11y-reduced-motion', prefs.reducedMotion);

    // Reading guide - controlled via JS mousemove event, no body class needed

    // Focus mode
    body.classList.toggle('a11y-focus-mode', prefs.focusMode);

    // Update UI toggles
    updateToggleStates();
  }

  // Update toggle button states
  function updateToggleStates() {
    const panel = document.getElementById('a11y-panel');
    if (!panel) return;

    // Update toggle buttons
    panel.querySelectorAll('[data-a11y-toggle]').forEach(btn => {
      const pref = btn.dataset.a11yToggle;
      const isActive = prefs[pref];
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });

    // Update font size display
    const fontSizeDisplay = panel.querySelector('#a11y-font-size-value');
    if (fontSizeDisplay) {
      fontSizeDisplay.textContent = prefs.fontSize + '%';
    }

    // Update font size buttons
    const decreaseBtn = panel.querySelector('[data-a11y-action="decrease-font"]');
    const increaseBtn = panel.querySelector('[data-a11y-action="increase-font"]');
    if (decreaseBtn) {
      decreaseBtn.disabled = prefs.fontSize <= CONFIG.minFontSize;
    }
    if (increaseBtn) {
      increaseBtn.disabled = prefs.fontSize >= CONFIG.maxFontSize;
    }
  }

  // Toggle a preference
  function togglePref(prefName) {
    if (prefName in prefs && typeof prefs[prefName] === 'boolean') {
      prefs[prefName] = !prefs[prefName];
      savePrefs();
      applyPrefs();
    }
  }

  // Adjust font size
  function adjustFontSize(direction) {
    const newSize = prefs.fontSize + (direction * CONFIG.fontSizeStep);
    if (newSize >= CONFIG.minFontSize && newSize <= CONFIG.maxFontSize) {
      prefs.fontSize = newSize;
      savePrefs();
      applyPrefs();
    }
  }

  // Reset all preferences
  function resetPrefs() {
    prefs = { ...defaultPrefs };
    savePrefs();
    applyPrefs();
    announceToScreenReader('Accessibility settings have been reset to defaults.');
  }

  // Announce message to screen readers
  function announceToScreenReader(message) {
    const announcement = document.getElementById('a11y-announcer');
    if (announcement) {
      announcement.textContent = message;
      setTimeout(() => {
        announcement.textContent = '';
      }, 1000);
    }
  }

  // Create reading guide element
  function createReadingGuide() {
    const guide = document.createElement('div');
    guide.id = 'a11y-reading-guide';
    guide.setAttribute('aria-hidden', 'true');
    document.body.appendChild(guide);

    document.addEventListener('mousemove', (e) => {
      if (prefs.readingGuide) {
        guide.style.top = (e.clientY - 15) + 'px';
        guide.style.display = 'block';
      } else {
        guide.style.display = 'none';
      }
    });

    document.addEventListener('mouseleave', () => {
      guide.style.display = 'none';
    });
  }

  // Create the accessibility widget
  function createWidget() {
    // Create screen reader announcer
    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);

    // Create widget button
    const widgetBtn = document.createElement('button');
    widgetBtn.id = 'a11y-widget-btn';
    widgetBtn.className = 'a11y-widget-btn';
    widgetBtn.setAttribute('aria-label', 'Open accessibility settings');
    widgetBtn.setAttribute('aria-expanded', 'false');
    widgetBtn.setAttribute('aria-controls', 'a11y-panel');
    widgetBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="8" r="2"></circle>
        <path d="M12 10v8"></path>
        <path d="M8 14l4 4 4-4"></path>
      </svg>
      <span class="sr-only">Accessibility</span>
    `;

    // Create panel
    const panel = document.createElement('div');
    panel.id = 'a11y-panel';
    panel.className = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Accessibility Settings');
    panel.setAttribute('aria-modal', 'false');
    panel.innerHTML = `
      <div class="a11y-panel-header">
        <h2 id="a11y-panel-title">Accessibility Settings</h2>
        <button class="a11y-panel-close" aria-label="Close accessibility settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="a11y-panel-content">
        <!-- Font Size -->
        <div class="a11y-section">
          <h3 class="a11y-section-title">Text Size</h3>
          <div class="a11y-font-controls">
            <button class="a11y-font-btn" data-a11y-action="decrease-font" aria-label="Decrease text size">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M5 12h14"></path>
              </svg>
            </button>
            <span id="a11y-font-size-value" class="a11y-font-value" aria-live="polite">100%</span>
            <button class="a11y-font-btn" data-a11y-action="increase-font" aria-label="Increase text size">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Visual Settings -->
        <div class="a11y-section">
          <h3 class="a11y-section-title">Visual Settings</h3>
          <div class="a11y-toggles">
            <button class="a11y-toggle" data-a11y-toggle="highContrast" aria-pressed="false">
              <span class="a11y-toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2v20"></path>
                  <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor"></path>
                </svg>
              </span>
              <span class="a11y-toggle-label">High Contrast</span>
            </button>
            
            <button class="a11y-toggle" data-a11y-toggle="dyslexiaFont" aria-pressed="false">
              <span class="a11y-toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16"></path>
                </svg>
              </span>
              <span class="a11y-toggle-label">Dyslexia Friendly</span>
            </button>
            
            <button class="a11y-toggle" data-a11y-toggle="largeSpacing" aria-pressed="false">
              <span class="a11y-toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M21 6H3M21 12H3M21 18H3"></path>
                </svg>
              </span>
              <span class="a11y-toggle-label">Large Spacing</span>
            </button>
            
            <button class="a11y-toggle" data-a11y-toggle="highlightLinks" aria-pressed="false">
              <span class="a11y-toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </span>
              <span class="a11y-toggle-label">Highlight Links</span>
            </button>
          </div>
        </div>

        <!-- Navigation Settings -->
        <div class="a11y-section">
          <h3 class="a11y-section-title">Navigation &amp; Motion</h3>
          <div class="a11y-toggles">
            <button class="a11y-toggle" data-a11y-toggle="largerCursor" aria-pressed="false">
              <span class="a11y-toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
                  <path d="M13 13l6 6"></path>
                </svg>
              </span>
              <span class="a11y-toggle-label">Larger Cursor</span>
            </button>
            
            <button class="a11y-toggle" data-a11y-toggle="reducedMotion" aria-pressed="false">
              <span class="a11y-toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <path d="M12 12h.01"></path>
                </svg>
              </span>
              <span class="a11y-toggle-label">Reduce Motion</span>
            </button>
            
            <button class="a11y-toggle" data-a11y-toggle="readingGuide" aria-pressed="false">
              <span class="a11y-toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M2 12h20"></path>
                  <path d="M2 6h20"></path>
                  <path d="M2 18h20"></path>
                </svg>
              </span>
              <span class="a11y-toggle-label">Reading Guide</span>
            </button>
            
            <button class="a11y-toggle" data-a11y-toggle="focusMode" aria-pressed="false">
              <span class="a11y-toggle-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                </svg>
              </span>
              <span class="a11y-toggle-label">Focus Mode</span>
            </button>
          </div>
        </div>

        <!-- Reset Button -->
        <div class="a11y-section a11y-reset-section">
          <button class="a11y-reset-btn" data-a11y-action="reset">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Reset to Defaults
          </button>
        </div>
      </div>
      
      <div class="a11y-panel-footer">
        <p>Settings are saved automatically</p>
      </div>
    `;

    // Append to body
    document.body.appendChild(widgetBtn);
    document.body.appendChild(panel);

    // Create reading guide element
    createReadingGuide();

    // Event listeners
    setupEventListeners(widgetBtn, panel);
  }

  // Setup event listeners
  function setupEventListeners(widgetBtn, panel) {
    // Toggle panel
    widgetBtn.addEventListener('click', () => {
      const isOpen = panel.classList.contains('open');
      panel.classList.toggle('open');
      widgetBtn.setAttribute('aria-expanded', !isOpen);
      
      if (!isOpen) {
        // Focus first focusable element in panel
        const firstFocusable = panel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
          setTimeout(() => firstFocusable.focus(), 100);
        }
      }
    });

    // Close button
    const closeBtn = panel.querySelector('.a11y-panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
        widgetBtn.setAttribute('aria-expanded', 'false');
        widgetBtn.focus();
      });
    }

    // Toggle buttons
    panel.querySelectorAll('[data-a11y-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pref = btn.dataset.a11yToggle;
        togglePref(pref);
        announceToScreenReader(`${btn.querySelector('.a11y-toggle-label').textContent} ${prefs[pref] ? 'enabled' : 'disabled'}`);
      });
    });

    // Font size controls
    const decreaseFontBtn = panel.querySelector('[data-a11y-action="decrease-font"]');
    const increaseFontBtn = panel.querySelector('[data-a11y-action="increase-font"]');
    
    if (decreaseFontBtn) {
      decreaseFontBtn.addEventListener('click', () => {
        adjustFontSize(-1);
        announceToScreenReader(`Text size set to ${prefs.fontSize} percent`);
      });
    }
    
    if (increaseFontBtn) {
      increaseFontBtn.addEventListener('click', () => {
        adjustFontSize(1);
        announceToScreenReader(`Text size set to ${prefs.fontSize} percent`);
      });
    }

    // Reset button
    const resetBtn = panel.querySelector('[data-a11y-action="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetPrefs);
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
        widgetBtn.setAttribute('aria-expanded', 'false');
        widgetBtn.focus();
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (panel.classList.contains('open') && 
          !panel.contains(e.target) && 
          !widgetBtn.contains(e.target)) {
        panel.classList.remove('open');
        widgetBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Trap focus in panel when open
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusable = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  }

  // Initialize
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        loadPrefs();
        createWidget();
        applyPrefs();
      });
    } else {
      loadPrefs();
      createWidget();
      applyPrefs();
    }
  }

  // Start initialization
  init();

})();
