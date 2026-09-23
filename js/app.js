/**
 * Class Manager — Main Application Controller & Router
 */

const App = {
  currentView: 'dashboard',
  isOnline: navigator.onLine,

  init() {
    this.setupTheme();
    this.setupNetworkListeners();
    this.updateHeaderDate();
    this.setupBottomNav();
    this.registerServiceWorker();

    // Default route
    this.navigateTo('dashboard');
  },

  // ==========================================
  // ROUTING & NAVIGATION
  // ==========================================

  navigateTo(viewId) {
    this.currentView = viewId;

    // Hide all view containers
    const views = document.querySelectorAll('.view-page');
    views.forEach(v => v.classList.remove('active'));

    // Show target view container
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active');
    }

    // Update bottom nav buttons
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-target') === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Scroll to top with smooth behavior
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger module renderers
    switch (viewId) {
      case 'dashboard':
        DashboardModule.render();
        break;
      case 'students':
        StudentsModule.render();
        break;
      case 'classes':
        ClassesModule.render();
        break;
      case 'attendance':
        AttendanceModule.render();
        break;
      case 'payments':
        PaymentsModule.render();
        break;
      case 'more':
        this.renderMorePage();
        break;
    }
  },

  setupBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target) {
          this.navigateTo(target);
        }
      });
    });
  },

  // ==========================================
  // THEME (DARK / LIGHT MODE)
  // ==========================================

  setupTheme() {
    const savedTheme = CONFIG.getTheme();
    this.applyTheme(savedTheme);
  },

  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
    CONFIG.setTheme(theme);
  },

  toggleTheme() {
    const current = CONFIG.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    this.showToast(next === 'dark' ? '🌙 បានបើក Dark Mode' : '☀️ បានបើក Light Mode', 'info');
    if (this.currentView === 'more') {
      this.renderMorePage();
    }
  },

  // ==========================================
  // NETWORK MONITORING (ONLINE / OFFLINE)
  // ==========================================

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateNetworkBadge();
      this.showToast('🟢 ភ្ជាប់អ៊ីនធឺណិតឡើងវិញ (Online)', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateNetworkBadge();
      this.showToast('🔴 គ្មានអ៊ីនធឺណិត (Offline) — ដំណើរការក្នុងទម្រង់អាន', 'warning');
    });

    this.updateNetworkBadge();
  },

  updateNetworkBadge() {
    const badge = document.getElementById('network-badge');
    if (!badge) return;

    if (navigator.onLine) {
      badge.className = 'network-badge badge-online';
      badge.innerHTML = '<span class="status-dot"></span> Online';
    } else {
      badge.className = 'network-badge badge-offline';
      badge.innerHTML = '<span class="status-dot"></span> Offline';
    }
  },

  // ==========================================
  // KHMER DATE FORMATTING
  // ==========================================

  updateHeaderDate() {
    const dateEl = document.getElementById('header-date-text');
    if (dateEl) {
      dateEl.textContent = this.formatKhmerDate(new Date());
    }
  },

  formatKhmerDate(date) {
    const days = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
    const months = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

    const toKhmerNum = (num) => String(num).split('').map(d => khmerDigits[parseInt(d, 10)] || d).join('');

    const dayName = days[date.getDay()];
    const day = toKhmerNum(date.getDate());
    const monthName = months[date.getMonth()];
    const year = toKhmerNum(date.getFullYear());

    return `ថ្ងៃ${dayName} ទី${day} ខែ${monthName} ឆ្នាំ${year}`;
  },

  // ==========================================
  // DATA REFRESH
  // ==========================================

  refreshCurrentView() {
    this.showToast('🔄 កំពុងផ្ទុកទិន្នន័យឡើងវិញ...', 'info');
    this.navigateTo(this.currentView);
  },

  // ==========================================
  // GLOBAL MODAL & CONFIRM DIALOG
  // ==========================================

  openModal({ title, body }) {
    const overlay = document.getElementById('global-modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (!overlay || !titleEl || !bodyEl) return;

    titleEl.innerHTML = title;
    bodyEl.innerHTML = body;
    overlay.classList.add('visible');
    document.body.classList.add('modal-open');
  },

  closeModal() {
    const overlay = document.getElementById('global-modal-overlay');
    if (overlay) {
      overlay.classList.remove('visible');
    }
    document.body.classList.remove('modal-open');
  },

  openConfirmDialog({ title, message, confirmText = 'យល់ព្រម', cancelText = 'បោះបង់', onConfirm }) {
    this.openModal({
      title: title || 'ការបញ្ជាក់',
      body: `
        <div class="confirm-dialog-content">
          <p class="confirm-message">${message}</p>
          <div class="modal-buttons mt-3">
            <button type="button" class="btn btn-outline" onclick="App.closeModal()">${cancelText}</button>
            <button type="button" class="btn btn-danger" id="dialog-confirm-btn">${confirmText}</button>
          </div>
        </div>
      `
    });

    const confirmBtn = document.getElementById('dialog-confirm-btn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        App.closeModal();
        if (typeof onConfirm === 'function') {
          onConfirm();
        }
      };
    }
  },

  // ==========================================
  // TOAST NOTIFICATIONS & LOADING
  // ==========================================

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-text">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    // Auto-remove after 3.8s
    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, 3800);
  },

  showLoading(text = 'កំពុងទាញយកទិន្នន័យ...') {
    const overlay = document.getElementById('global-loading-overlay');
    const textEl = document.getElementById('loading-text');
    if (overlay && textEl) {
      textEl.textContent = text;
      overlay.classList.add('visible');
    }
  },

  hideLoading() {
    const overlay = document.getElementById('global-loading-overlay');
    if (overlay) {
      overlay.classList.remove('visible');
    }
  },

  // ==========================================
  // MORE / SETTINGS PAGE
  // ==========================================

  renderMorePage() {
    const container = document.getElementById('view-more');
    if (!container) return;

    const currentApiUrl = CONFIG.getApiUrl();
    const isDark = CONFIG.getTheme() === 'dark';

    container.innerHTML = `
      <div class="page-header-row">
        <div>
          <h2 class="page-title">ការកំណត់ & ជំនួយ</h2>
          <div class="page-subtitle">កំណែ Class Manager v${CONFIG.VERSION}</div>
        </div>
      </div>

      <!-- Google Sheets Connection Settings -->
      <div class="card settings-card">
        <div class="settings-card-header">
          <div class="settings-icon">🔗</div>
          <div>
            <h3 class="settings-title">ភ្ជាប់ Google Sheets Database</h3>
            <p class="settings-desc">បញ្ចូល Google Apps Script Web App URL ដើម្បីធ្វើសមកាលកម្មទិន្នន័យផ្ទាល់ជាមួយ Google Sheets។</p>
          </div>
        </div>

        <div class="form-group mt-2">
          <label class="form-label">Google Apps Script Web App URL</label>
          <input 
            type="url" 
            id="settings-api-url" 
            class="input-field" 
            placeholder="https://script.google.com/macros/s/.../exec"
            value="${currentApiUrl}" 
          />
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary" onclick="App.saveApiUrl()">
            💾 រក្សាទុក URL
          </button>
          <button class="btn btn-outline" onclick="App.testApiConnection()">
            🧪 សាកល្បងភ្ជាប់
          </button>
        </div>

        <div class="api-status-box mt-2">
          ${currentApiUrl ? `
            <span class="badge badge-success">✅ បានភ្ជាប់ URL</span>
            <span class="text-sm text-muted">ទិន្នន័យកំពុង Save ទៅ Google Sheets</span>
          ` : `
            <span class="badge badge-warning">⚡ របៀប Local Simulation</span>
            <span class="text-sm text-muted">ទិន្នន័យកំពុងកត់ត្រាក្នុងទូរស័ព្ទ (Demo Mode)</span>
          `}
        </div>
      </div>

      <!-- App Appearance / Dark Mode -->
      <div class="card settings-card">
        <div class="settings-row-toggle">
          <div class="d-flex align-center gap-2">
            <span class="settings-icon-sm">${isDark ? '🌙' : '☀️'}</span>
            <div>
              <h4 class="toggle-title">Dark Mode (ផ្ទៃងងឹត)</h4>
              <p class="toggle-desc">ជួយការពារភ្នែកពេលប្រើប្រាស់ពេលយប់</p>
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" id="theme-switch" ${isDark ? 'checked' : ''} onchange="App.toggleTheme()" />
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <!-- iPhone Add to Home Screen Instructions -->
      <div class="card settings-card">
        <div class="settings-card-header">
          <div class="settings-icon">📱</div>
          <div>
            <h3 class="settings-title">របៀបតំឡើងលើ iPhone (Add to Home Screen)</h3>
            <p class="settings-desc">តំឡើងដើម្បីប្រើប្រាស់ដូចជា Native Mobile App នៅលើអេក្រង់ iPhone</p>
          </div>
        </div>

        <div class="ios-install-steps">
          <div class="step-item">
            <div class="step-num">១</div>
            <div class="step-text">បើកកម្មវិធីនេះនៅក្នុងកម្មវិធីរុករក <strong>Safari</strong> លើ iPhone។</div>
          </div>
          <div class="step-item">
            <div class="step-num">២</div>
            <div class="step-text">ចុចលើប៊ូតុងចែករំលែក <strong>Share</strong> (រូបព្រួញចង្អុលឡើងលើ 📤 នៅរបារខាងក្រោម)។</div>
          </div>
          <div class="step-item">
            <div class="step-num">៣</div>
            <div class="step-text">រំកិលចុះក្រោម រួចជ្រើសរើសយកពាក្យ <strong>"Add to Home Screen"</strong> (➕ បន្ថែមទៅអេក្រង់ដើម)។</div>
          </div>
          <div class="step-item">
            <div class="step-num">៤</div>
            <div class="step-text">ចុចពាក្យ <strong>"Add"</strong> នៅជ្រុងខាងស្តាំខាងលើ។ រួចរាល់!</div>
          </div>
        </div>
      </div>

      <!-- Data Reset & Cache -->
      <div class="card settings-card">
        <div class="settings-card-header">
          <div class="settings-icon">🧹</div>
          <div>
            <h3 class="settings-title">ជម្រះទិន្នន័យសាកល្បង (Reset Local Cache)</h3>
            <p class="settings-desc">ស្តារទិន្នន័យគំរូដើមឡើងវិញប្រសិនបើមិនទាន់បានភ្ជាប់ Google Sheets។</p>
          </div>
        </div>
        <button class="btn btn-outline btn-danger-outline mt-2" onclick="App.resetLocalData()">
          ⚠️ ស្តារទិន្នន័យគំរូដើម (Reset Local Data)
        </button>
      </div>

      <!-- About Footer -->
      <div class="app-about-footer">
        <div class="app-logo-badge">🎓</div>
        <h4>Class Manager — កម្មវិធីគ្រប់គ្រងថ្នាក់រៀន</h4>
        <p class="text-muted">បង្កើតឡើងដោយគំនិតច្នៃប្រឌិតខ្ពស់សម្រាប់លោកគ្រូ អ្នកគ្រូ និងសាលារៀន</p>
        <p class="text-xs text-muted">PWA • Google Sheets • Offline Ready</p>
      </div>
    `;
  },

  async saveApiUrl() {
    const input = document.getElementById('settings-api-url');
    if (!input) return;

    const url = input.value.trim();
    CONFIG.setApiUrl(url);
    this.showToast('✅ បានរក្សាទុក API URL រួចរាល់', 'success');
    this.renderMorePage();
  },

  async testApiConnection() {
    const input = document.getElementById('settings-api-url');
    const url = input ? input.value.trim() : CONFIG.getApiUrl();

    if (!url) {
      this.showToast('សូមបញ្ចូល Google Apps Script Web App URL សិន', 'warning');
      return;
    }

    this.showLoading('កំពុងសាកល្បងតភ្ជាប់ Google Sheets API...');
    try {
      const res = await API.testConnection(url);
      if (res && res.success) {
        this.showToast(res.message, 'success');
      } else {
        this.showToast(res.message, 'error');
      }
    } catch (err) {
      this.showToast('❌ បរាជ័យក្នុងការតភ្ជាប់: ' + err.message, 'error');
    } finally {
      this.hideLoading();
    }
  },

  resetLocalData() {
    this.openConfirmDialog({
      title: 'ស្តារទិន្នន័យគំរូឡើងវិញ',
      message: 'តើអ្នកពិតជាចង់ស្តារទិន្នន័យគំរូដើមឡើងវិញមែនទេ? (ទិន្នន័យសាកល្បងដែលមិនទាន់រក្សាទុកក្នុង Google Sheets នឹងត្រូវលុប)',
      confirmText: 'យល់ព្រមស្តារ',
      cancelText: 'បោះបង់',
      onConfirm: () => {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.LOCAL_DATA);
        API.initLocalStorage();
        App.showToast('✅ បានស្តារទិន្នន័យគំរូដើមរួចរាល់', 'success');
        App.navigateTo('dashboard');
      }
    });
  },

  // ==========================================
  // SERVICE WORKER REGISTRATION
  // ==========================================

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then(reg => {
            console.log('[PWA] Service Worker registered successfully:', reg.scope);
          })
          .catch(err => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }
  }
};

// Initialize App once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
