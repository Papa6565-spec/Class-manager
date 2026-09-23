/**
 * Class Manager — Unified Student Profile Module
 */

const ProfileModule = {
  currentProfile: null,

  async open(studentId) {
    if (!studentId) return;

    App.showLoading('កំពុងបើកព័ត៌មានសិស្ស...');
    try {
      const res = await API.request('getStudentProfile', 'GET', { studentId: studentId });
      if (res && res.success && res.data) {
        this.currentProfile = res.data;
        this.renderModal();
      } else {
        App.showToast(res.message || 'មិនអាចទាញយកព័ត៌មានសិស្ស', 'error');
      }
    } catch (err) {
      App.showToast('កំហុស៖ ' + err.message, 'error');
    } finally {
      App.hideLoading();
    }
  },

  renderModal() {
    const data = this.currentProfile;
    if (!data) return;

    const s = data.student || {};
    const att = data.attendance || {};
    const pay = data.payments || {};

    const rate = att.rate || 0;
    let rateClass = 'rate-green';
    if (rate < 70) rateClass = 'rate-red';
    else if (rate < 85) rateClass = 'rate-yellow';

    App.openModal({
      title: `👨‍🎓 ព័ត៌មានផ្ទាល់ខ្លួន — ${s.StudentName}`,
      body: `
        <!-- Profile Header Avatar Banner -->
        <div class="profile-header-banner">
          <div class="profile-avatar-circle">
            ${s.Gender === 'ស្រី' ? '👩' : '👨'}
          </div>
          <div class="profile-header-details">
            <h3 class="profile-name">${s.StudentName}</h3>
            <div class="profile-tags">
              <span class="badge badge-primary">${s.StudentID}</span>
              <span class="badge badge-purple">${s.ClassName || 'គ្មានថ្នាក់'}</span>
              <span class="badge ${s.Status === 'សកម្ម' ? 'badge-success' : 'badge-neutral'}">${s.Status || 'សកម្ម'}</span>
            </div>
          </div>
        </div>

        <!-- 1. Personal & Contact Details -->
        <div class="profile-section">
          <h4 class="profile-section-title">👤 ព័ត៌មានលម្អិត & ទំនាក់ទំនង</h4>
          <div class="profile-details-grid">
            <div class="profile-detail-item">
              <span class="p-label">ភេទ</span>
              <span class="p-val">${s.Gender || 'ប្រុស'}</span>
            </div>
            <div class="profile-detail-item">
              <span class="p-label">ថ្ងៃខែឆ្នាំកំណើត</span>
              <span class="p-val">${s.DateOfBirth || '—'}</span>
            </div>
            <div class="profile-detail-item">
              <span class="p-label">ទូរស័ព្ទសិស្ស</span>
              <span class="p-val">${s.Phone ? `<a href="tel:${s.Phone}">${s.Phone}</a>` : '—'}</span>
            </div>
            <div class="profile-detail-item">
              <span class="p-label">អាណាព្យាបាល</span>
              <span class="p-val">${s.ParentName || '—'}</span>
            </div>
            <div class="profile-detail-item">
              <span class="p-label">ទូរស័ព្ទអាណាព្យាបាល</span>
              <span class="p-val">${s.ParentPhone ? `<a href="tel:${s.ParentPhone}">${s.ParentPhone}</a>` : '—'}</span>
            </div>
            <div class="profile-detail-item">
              <span class="p-label">អាសយដ្ឋាន</span>
              <span class="p-val">${s.Address || '—'}</span>
            </div>
            <div class="profile-detail-item">
              <span class="p-label">កាលបរិច្ឆេទចុះឈ្មោះ</span>
              <span class="p-val">${s.RegisterDate || '—'}</span>
            </div>
          </div>
          ${s.Note ? `
            <div class="profile-note-alert">
              📝 <strong>ចំណាំ៖</strong> ${s.Note}
            </div>
          ` : ''}
        </div>

        <!-- 2. Attendance Summary & Rate -->
        <div class="profile-section">
          <div class="d-flex justify-between align-center mb-1">
            <h4 class="profile-section-title mb-0">📋 ស្ថិតិវត្តមាន</h4>
            <span class="profile-rate-pill ${rateClass}">អត្រាវត្តមាន៖ ${rate}%</span>
          </div>

          <div class="rate-bar-container mb-2">
            <div class="rate-bar-fill ${rateClass}" style="width: ${rate}%;"></div>
          </div>

          <div class="summary-counts-row">
            <span class="tag-present">🟢 វត្តមាន: <strong>${att.present || 0}</strong></span>
            <span class="tag-absent">🔴 អវត្តមាន: <strong>${att.absent || 0}</strong></span>
            <span class="tag-late">🟡 យឺត: <strong>${att.late || 0}</strong></span>
            <span class="tag-permission">🔵 ច្បាប់: <strong>${att.permission || 0}</strong></span>
          </div>

          <div class="history-table-wrapper mt-2">
            <div class="history-table-title">កំណត់ត្រាវត្តមាន ១០ ថ្ងៃចុងក្រោយ</div>
            ${(att.records && att.records.length > 0) ? `
              <table class="table-compact">
                <thead>
                  <tr>
                    <th>កាលបរិច្ឆេទ</th>
                    <th>ស្ថានភាព</th>
                    <th>ម៉ោង</th>
                    <th>ចំណាំ</th>
                  </tr>
                </thead>
                <tbody>
                  ${att.records.map(r => `
                    <tr>
                      <td>${r.Date}</td>
                      <td>
                        <span class="status-indicator status-${(r.Status || 'Present').toLowerCase()}">
                          ${r.Status}
                        </span>
                      </td>
                      <td>${r.CheckInTime || '—'}</td>
                      <td>${r.Note || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="text-muted text-center py-2">មិនទាន់មានទិន្នន័យវត្តមានទេ</p>'}
          </div>
        </div>

        <!-- 3. Payment Summary & History -->
        <div class="profile-section">
          <div class="d-flex justify-between align-center mb-1">
            <h4 class="profile-section-title mb-0">💰 ប្រវត្តិនៃការបង់ប្រាក់</h4>
            <button class="btn btn-xs btn-primary" onclick="App.closeModal(); PaymentsModule.openAddModal('${s.StudentID}')">
              ➕ កត់ត្រាបង់ប្រាក់
            </button>
          </div>

          <div class="profile-payment-total-banner">
            <div>
              <span class="text-sm">សរុបប្រាក់បានបង់៖</span>
              <h3 class="total-text-green">${pay.formattedTotal || '0 ៛'}</h3>
            </div>
            <span class="badge badge-subtle">${(pay.records && pay.records.length) || 0} លើក</span>
          </div>

          <div class="history-table-wrapper mt-2">
            ${(pay.records && pay.records.length > 0) ? `
              <table class="table-compact">
                <thead>
                  <tr>
                    <th>ថ្ងៃបង់</th>
                    <th>ចំនួនទឹកប្រាក់</th>
                    <th>សម្រាប់ខែ</th>
                    <th>ប្រភេទ</th>
                  </tr>
                </thead>
                <tbody>
                  ${pay.records.map(p => `
                    <tr>
                      <td>${p.PaymentDate}</td>
                      <td class="text-bold text-success">${p.Amount}</td>
                      <td>${p.Month || '—'}</td>
                      <td><span class="badge badge-subtle">${p.PaymentType || 'Tuition'}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="text-muted text-center py-2">មិនទាន់មានប្រវត្តិបង់ប្រាក់ទេ</p>'}
          </div>
        </div>

        <div class="modal-buttons mt-3">
          <button type="button" class="btn btn-secondary btn-block" onclick="App.closeModal()">បិទ</button>
        </div>
      `
    });
  }
};
