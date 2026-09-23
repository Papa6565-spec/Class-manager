/**
 * Class Manager — Dashboard Feature Module
 */

const DashboardModule = {
  async render() {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    App.showLoading('កំពុងទាញយកស្ថិតិ...');
    try {
      const res = await API.request('getDashboard', 'GET');
      if (res && res.success && res.data) {
        this.renderStats(res.data);
      } else {
        App.showToast(res.message || 'មិនអាចទាញយកស្ថិតិបានទេ', 'error');
      }
    } catch (err) {
      App.showToast('កំហុសទាញយកស្ថិតិ: ' + err.message, 'error');
    } finally {
      App.hideLoading();
    }
  },

  renderStats(stats) {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    const todayKhmer = App.formatKhmerDate(new Date());

    container.innerHTML = `
      <!-- Today's Welcome Banner -->
      <div class="card welcome-card">
        <div class="welcome-text">
          <div class="welcome-greeting">👋 សួស្តីលោកគ្រូ / អ្នកគ្រូ</div>
          <h2 class="welcome-title">ផ្ទាំងគ្រប់គ្រងទូទៅ</h2>
          <div class="welcome-date">📅 ថ្ងៃនេះ៖ <strong>${todayKhmer}</strong></div>
        </div>
        <button class="btn btn-outline btn-sm welcome-refresh" onclick="DashboardModule.render()" title="Refresh">
          🔄 ផ្ទុកឡើងវិញ
        </button>
      </div>

      <!-- Quick Action Buttons -->
      <div class="section-heading">
        <span class="section-title">⚡ សកម្មភាពរហ័ស</span>
      </div>
      <div class="quick-actions-grid">
        <button class="quick-action-btn action-stu" onclick="StudentsModule.openAddModal()">
          <span class="action-icon">➕</span>
          <span class="action-label">ចុះឈ្មោះសិស្ស</span>
        </button>
        <button class="quick-action-btn action-att" onclick="App.navigateTo('attendance')">
          <span class="action-icon">✅</span>
          <span class="action-label">ចុះវត្តមាន</span>
        </button>
        <button class="quick-action-btn action-pay" onclick="PaymentsModule.openAddModal()">
          <span class="action-icon">💵</span>
          <span class="action-label">កត់ត្រាបង់ប្រាក់</span>
        </button>
        <button class="quick-action-btn action-cls" onclick="ClassesModule.openAddModal()">
          <span class="action-icon">🏫</span>
          <span class="action-label">បន្ថែមថ្នាក់</span>
        </button>
      </div>

      <!-- Key Metrics Counter Cards -->
      <div class="section-heading">
        <span class="section-title">📊 ស្ថិតិសង្ខេប</span>
      </div>
      <div class="stats-grid">
        <div class="stat-card stat-blue" onclick="App.navigateTo('students')">
          <div class="stat-icon-wrapper">👨‍🎓</div>
          <div class="stat-content">
            <div class="stat-value">${stats.totalStudents || 0}</div>
            <div class="stat-label">សិស្សសរុប</div>
          </div>
        </div>

        <div class="stat-card stat-purple" onclick="App.navigateTo('classes')">
          <div class="stat-icon-wrapper">🏫</div>
          <div class="stat-content">
            <div class="stat-value">${stats.totalClasses || 0}</div>
            <div class="stat-label">ថ្នាក់សរុប</div>
          </div>
        </div>

        <div class="stat-card stat-green" onclick="App.navigateTo('attendance')">
          <div class="stat-icon-wrapper">✅</div>
          <div class="stat-content">
            <div class="stat-value">${stats.todayPresent || 0}</div>
            <div class="stat-label">វត្តមានថ្ងៃនេះ</div>
          </div>
        </div>

        <div class="stat-card stat-red" onclick="App.navigateTo('attendance')">
          <div class="stat-icon-wrapper">❌</div>
          <div class="stat-content">
            <div class="stat-value">${stats.todayAbsent || 0}</div>
            <div class="stat-label">អវត្តមានថ្ងៃនេះ</div>
          </div>
        </div>

        <div class="stat-card stat-emerald full-width" onclick="App.navigateTo('payments')">
          <div class="stat-icon-wrapper">💰</div>
          <div class="stat-content">
            <div class="stat-value">${stats.todayFormattedRevenue || '0 ៛'}</div>
            <div class="stat-label">ប្រាក់បានកត់ត្រាថ្ងៃនេះ</div>
          </div>
        </div>
      </div>

      <!-- Recent Students List -->
      <div class="section-heading">
        <span class="section-title">👨‍🎓 សិស្សចុះឈ្មោះថ្មីៗ</span>
        <a href="javascript:void(0)" class="section-link" onclick="App.navigateTo('students')">មើលទាំងអស់ ›</a>
      </div>
      <div class="recent-list">
        ${this.renderRecentStudents(stats.recentStudents || [])}
      </div>

      <!-- Recent Payments -->
      <div class="section-heading">
        <span class="section-title">💰 ការបង់ប្រាក់ចុងក្រោយ</span>
        <a href="javascript:void(0)" class="section-link" onclick="App.navigateTo('payments')">មើលទាំងអស់ ›</a>
      </div>
      <div class="recent-list">
        ${this.renderRecentPayments(stats.recentPayments || [])}
      </div>
    `;
  },

  renderRecentStudents(students) {
    if (!students.length) {
      return `<div class="card empty-state-card"><p>មិនទាន់មានសិស្សចុះឈ្មោះទេ</p></div>`;
    }
    return students.map(s => `
      <div class="card list-item-card" onclick="ProfileModule.open('${s.StudentID}')">
        <div class="item-avatar">${s.Gender === 'ស្រី' ? '👩' : '👨'}</div>
        <div class="item-info">
          <div class="item-primary-text">${s.StudentName}</div>
          <div class="item-secondary-text">
            <span class="badge badge-subtle">${s.StudentID}</span> • <span>${s.ClassName || 'គ្មានថ្នាក់'}</span>
          </div>
        </div>
        <div class="item-end">
          <span class="badge ${s.Status === 'សកម្ម' ? 'badge-success' : 'badge-neutral'}">${s.Status || 'សកម្ម'}</span>
        </div>
      </div>
    `).join('');
  },

  renderRecentPayments(payments) {
    if (!payments.length) {
      return `<div class="card empty-state-card"><p>មិនទាន់មានកំណត់ត្រាបង់ប្រាក់ទេ</p></div>`;
    }
    return payments.map(p => `
      <div class="card list-item-card">
        <div class="item-avatar item-avatar-money">💵</div>
        <div class="item-info">
          <div class="item-primary-text">${p.StudentName}</div>
          <div class="item-secondary-text">
            <span>${p.PaymentType || 'Tuition'}</span> • <span>${p.Month || ''}</span>
          </div>
        </div>
        <div class="item-end text-right">
          <div class="item-amount">${p.Amount}</div>
          <div class="item-date">${p.PaymentDate || ''}</div>
        </div>
      </div>
    `).join('');
  }
};
