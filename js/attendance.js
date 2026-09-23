/**
 * Class Manager — Attendance Management Module
 */

const AttendanceModule = {
  currentTab: 'mark', // 'mark' | 'summary'
  selectedDate: new Date().toISOString().split('T')[0],
  selectedClassId: '',
  classesList: [],
  currentRoster: [],

  // Summary filters
  summaryClassId: '',
  summaryStudentId: '',
  summaryFromDate: '',
  summaryToDate: '',
  summaryData: null,

  async render() {
    const container = document.getElementById('view-attendance');
    if (!container) return;

    App.showLoading('កំពុងទាញយកទិន្នន័យវត្តមាន...');
    try {
      const clsRes = await API.request('getClasses', 'GET');
      if (clsRes && clsRes.success) {
        this.classesList = clsRes.data || [];
        if (!this.selectedClassId && this.classesList.length > 0) {
          this.selectedClassId = this.classesList[0].ClassID;
        }
      }
      this.renderUI();
      if (this.currentTab === 'mark') {
        await this.loadRoster();
      } else {
        await this.loadSummary();
      }
    } catch (err) {
      App.showToast('កំហុសទាញយកវត្តមាន: ' + err.message, 'error');
    } finally {
      App.hideLoading();
    }
  },

  renderUI() {
    const container = document.getElementById('view-attendance');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header-row">
        <div>
          <h2 class="page-title">កត់ត្រាវត្តមាន</h2>
          <div class="page-subtitle">គ្រប់គ្រងវត្តមានសិស្សប្រចាំថ្ងៃ</div>
        </div>
      </div>

      <!-- Segmented Tab Switcher (Mark vs Summary) -->
      <div class="tab-pill-bar">
        <button 
          class="tab-pill-btn ${this.currentTab === 'mark' ? 'active' : ''}" 
          onclick="AttendanceModule.switchTab('mark')"
        >
          📋 ចុះវត្តមានថ្ងៃនេះ
        </button>
        <button 
          class="tab-pill-btn ${this.currentTab === 'summary' ? 'active' : ''}" 
          onclick="AttendanceModule.switchTab('summary')"
        >
          📊 សង្ខេបវត្តមាន (%)
        </button>
      </div>

      <div id="attendance-content-container">
        <!-- Will be filled based on active tab -->
      </div>
    `;
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.renderUI();
    if (tab === 'mark') {
      this.loadRoster();
    } else {
      this.loadSummary();
    }
  },

  // ==========================================
  // TAB 1: MARK ATTENDANCE
  // ==========================================

  async loadRoster() {
    const content = document.getElementById('attendance-content-container');
    if (!content) return;

    content.innerHTML = `
      <!-- Date & Class Selector Card -->
      <div class="card selector-card">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">📅 កាលបរិច្ឆេទ</label>
            <input 
              type="date" 
              id="att-date-picker" 
              class="input-field" 
              value="${this.selectedDate}" 
              onchange="AttendanceModule.onDateChange(this.value)"
            />
          </div>
          <div class="form-group">
            <label class="form-label">🏫 ជ្រើសរើសថ្នាក់</label>
            <select 
              id="att-class-picker" 
              class="input-select" 
              onchange="AttendanceModule.onClassChange(this.value)"
            >
              ${this.classesList.map(c => `
                <option value="${c.ClassID}" ${this.selectedClassId === c.ClassID ? 'selected' : ''}>
                  ${c.ClassName} (${c.studentCount || 0} នាក់)
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="bulk-action-bar">
          <span class="bulk-label">ដាក់វត្តមានទាំងអស់ជា៖</span>
          <div class="bulk-buttons">
            <button class="btn btn-xs btn-bulk-present" onclick="AttendanceModule.setAllStatus('Present')">🟢 វត្តមានទាំងអស់</button>
            <button class="btn btn-xs btn-bulk-absent" onclick="AttendanceModule.setAllStatus('Absent')">🔴 អវត្តមានទាំងអស់</button>
          </div>
        </div>
      </div>

      <!-- Student Attendance Roster List -->
      <div id="attendance-roster-list" class="attendance-roster-container">
        <div class="loading-inline">កំពុងទាញយកបញ្ជីវត្តមាន...</div>
      </div>

      <!-- Floating Bottom Save Bar for easy thumb reach on iPhone -->
      <div class="sticky-save-bar">
        <button class="btn btn-primary btn-block btn-lg" onclick="AttendanceModule.saveAttendance()">
          💾 រក្សាទុកវត្តមាន
        </button>
      </div>
    `;

    App.showLoading('កំពុងទាញយកបញ្ជីវត្តមាន...');
    try {
      const res = await API.request('getAttendance', 'GET', {
        date: this.selectedDate,
        classId: this.selectedClassId
      });
      if (res && res.success && res.data) {
        this.currentRoster = res.data.roster || [];
        this.renderRosterList();
      } else {
        App.showToast(res.message || 'មិនអាចទាញយកបញ្ជីវត្តមាន', 'error');
      }
    } catch (err) {
      App.showToast('កំហុស៖ ' + err.message, 'error');
    } finally {
      App.hideLoading();
    }
  },

  onDateChange(newDate) {
    this.selectedDate = newDate;
    this.loadRoster();
  },

  onClassChange(newClassId) {
    this.selectedClassId = newClassId;
    this.loadRoster();
  },

  setAllStatus(status) {
    this.currentRoster.forEach(r => {
      r.Status = status;
    });
    this.renderRosterList();
    App.showToast(`បានកំណត់ទាំងអស់ជា "${status}"`, 'info');
  },

  renderRosterList() {
    const listEl = document.getElementById('attendance-roster-list');
    if (!listEl) return;

    if (!this.currentRoster || this.currentRoster.length === 0) {
      listEl.innerHTML = `
        <div class="card empty-state-card">
          <div class="empty-icon">👥</div>
          <h3>គ្មានសិស្សនៅក្នុងថ្នាក់នេះទេ</h3>
          <p>សូមចុះឈ្មោះសិស្សចូលក្នុងថ្នាក់នេះជាមុនសិន។</p>
        </div>
      `;
      return;
    }

    // Counters for current state
    let countPresent = 0, countAbsent = 0, countLate = 0, countPermission = 0;
    this.currentRoster.forEach(r => {
      const s = (r.Status || 'Present').toLowerCase();
      if (s === 'present') countPresent++;
      else if (s === 'absent') countAbsent++;
      else if (s === 'late') countLate++;
      else if (s === 'permission') countPermission++;
    });

    listEl.innerHTML = `
      <!-- Real-time Count Badges -->
      <div class="attendance-counters-row">
        <span class="count-tag tag-present">🟢 វត្តមាន: <strong>${countPresent}</strong></span>
        <span class="count-tag tag-absent">🔴 អវត្តមាន: <strong>${countAbsent}</strong></span>
        <span class="count-tag tag-late">🟡 យឺត: <strong>${countLate}</strong></span>
        <span class="count-tag tag-permission">🔵 ច្បាប់: <strong>${countPermission}</strong></span>
      </div>

      ${this.currentRoster.map((item, idx) => `
        <div class="card attendance-card" id="att-card-${item.StudentID}">
          <div class="att-student-header">
            <div class="att-name-col">
              <span class="att-student-name">${item.StudentName}</span>
              <span class="badge badge-subtle">${item.StudentID}</span>
            </div>
            <div class="att-time-col">
              <input 
                type="text" 
                class="input-time-sm" 
                placeholder="ម៉ោង (ឧ. 07:00)" 
                value="${item.CheckInTime || ''}"
                onchange="AttendanceModule.updateCheckInTime(${idx}, this.value)"
              />
            </div>
          </div>

          <!-- iOS Segmented Status Control -->
          <div class="segmented-control">
            <button 
              type="button" 
              class="segment-btn seg-present ${item.Status === 'Present' ? 'selected' : ''}"
              onclick="AttendanceModule.updateStudentStatus(${idx}, 'Present')"
            >
              🟢 វត្តមាន
            </button>
            <button 
              type="button" 
              class="segment-btn seg-absent ${item.Status === 'Absent' ? 'selected' : ''}"
              onclick="AttendanceModule.updateStudentStatus(${idx}, 'Absent')"
            >
              🔴 អវត្តមាន
            </button>
            <button 
              type="button" 
              class="segment-btn seg-late ${item.Status === 'Late' ? 'selected' : ''}"
              onclick="AttendanceModule.updateStudentStatus(${idx}, 'Late')"
            >
              🟡 យឺត
            </button>
            <button 
              type="button" 
              class="segment-btn seg-permission ${item.Status === 'Permission' ? 'selected' : ''}"
              onclick="AttendanceModule.updateStudentStatus(${idx}, 'Permission')"
            >
              🔵 ច្បាប់
            </button>
          </div>

          <!-- Note Input -->
          <div class="att-note-row">
            <input 
              type="text" 
              class="input-note-sm" 
              placeholder="មូលហេតុ ឬចំណាំបន្ថែម..." 
              value="${item.Note || ''}"
              onchange="AttendanceModule.updateNote(${idx}, this.value)"
            />
          </div>
        </div>
      `).join('')}
    `;
  },

  updateStudentStatus(idx, status) {
    if (this.currentRoster[idx]) {
      this.currentRoster[idx].Status = status;
      // Auto-set time if Present or Late
      if ((status === 'Present' || status === 'Late') && !this.currentRoster[idx].CheckInTime) {
        const d = new Date();
        this.currentRoster[idx].CheckInTime = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      }
      this.renderRosterList();
    }
  },

  updateCheckInTime(idx, time) {
    if (this.currentRoster[idx]) {
      this.currentRoster[idx].CheckInTime = time.trim();
    }
  },

  updateNote(idx, note) {
    if (this.currentRoster[idx]) {
      this.currentRoster[idx].Note = note.trim();
    }
  },

  async saveAttendance() {
    if (!this.currentRoster || this.currentRoster.length === 0) {
      App.showToast('គ្មានទិន្នន័យសម្រាប់រក្សាទុកទេ', 'warning');
      return;
    }

    const payload = {
      date: this.selectedDate,
      classId: this.selectedClassId,
      records: this.currentRoster
    };

    App.showLoading('កំពុងរក្សាទុកវត្តមានទៅ Google Sheets...');
    try {
      const res = await API.request('saveAttendance', 'POST', payload);
      if (res && res.success) {
        App.showToast('✅ រក្សាទុកវត្តមានបានជោគជ័យ', 'success');
      } else {
        App.showToast(res.message || 'បរាជ័យក្នុងការរក្សាទុក', 'error');
      }
    } catch (err) {
      App.showToast('❌ មានបញ្ហា។ សូមព្យាយាមម្ដងទៀត។', 'error');
    } finally {
      App.hideLoading();
    }
  },

  // ==========================================
  // TAB 2: ATTENDANCE SUMMARY & PERCENTAGES
  // ==========================================

  async loadSummary() {
    const content = document.getElementById('attendance-content-container');
    if (!content) return;

    content.innerHTML = `
      <!-- Summary Filters -->
      <div class="card selector-card">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">🏫 ថ្នាក់រៀន</label>
            <select 
              id="sum-class-filter" 
              class="input-select" 
              onchange="AttendanceModule.onSummaryFilterChange('class', this.value)"
            >
              <option value="">-- គ្រប់ថ្នាក់ទាំងអស់ --</option>
              ${this.classesList.map(c => `
                <option value="${c.ClassID}" ${this.summaryClassId === c.ClassID ? 'selected' : ''}>
                  ${c.ClassName}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">📅 ចាប់ពីថ្ងៃ</label>
            <input 
              type="date" 
              class="input-field" 
              value="${this.summaryFromDate}" 
              onchange="AttendanceModule.onSummaryFilterChange('fromDate', this.value)"
            />
          </div>
          <div class="form-group">
            <label class="form-label">📅 ដល់ថ្ងៃ</label>
            <input 
              type="date" 
              class="input-field" 
              value="${this.summaryToDate}" 
              onchange="AttendanceModule.onSummaryFilterChange('toDate', this.value)"
            />
          </div>
        </div>
      </div>

      <!-- Summary Results Container -->
      <div id="summary-results-container">
        <div class="loading-inline">កំពុងគណនាស្ថិតិ...</div>
      </div>
    `;

    App.showLoading('កំពុងគណនាស្ថិតិវត្តមាន...');
    try {
      const res = await API.request('getAttendanceSummary', 'GET', {
        classId: this.summaryClassId,
        studentId: this.summaryStudentId,
        fromDate: this.summaryFromDate,
        toDate: this.summaryToDate
      });

      if (res && res.success && res.data) {
        this.summaryData = res.data;
        this.renderSummaryResults();
      } else {
        App.showToast(res.message || 'មិនអាចទាញយកទិន្នន័យសង្ខេប', 'error');
      }
    } catch (err) {
      App.showToast('កំហុស៖ ' + err.message, 'error');
    } finally {
      App.hideLoading();
    }
  },

  onSummaryFilterChange(key, val) {
    if (key === 'class') this.summaryClassId = val;
    if (key === 'fromDate') this.summaryFromDate = val;
    if (key === 'toDate') this.summaryToDate = val;
    this.loadSummary();
  },

  renderSummaryResults() {
    const container = document.getElementById('summary-results-container');
    if (!container) return;

    const list = (this.summaryData && this.summaryData.students) || [];
    if (!list.length) {
      container.innerHTML = `
        <div class="card empty-state-card">
          <div class="empty-icon">📊</div>
          <h3>មិនទាន់មានទិន្នន័យវត្តមានតាមលក្ខខណ្ឌនេះទេ</h3>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="summary-cards-grid">
        ${list.map(s => {
          const rate = s.AttendancePercentage || 0;
          let rateColor = 'rate-green';
          if (rate < 70) rateColor = 'rate-red';
          else if (rate < 85) rateColor = 'rate-yellow';

          return `
            <div class="card summary-card" onclick="ProfileModule.open('${s.StudentID}')">
              <div class="summary-card-header">
                <div>
                  <h4 class="summary-student-name">${s.StudentName}</h4>
                  <div class="summary-student-meta">
                    <span class="badge badge-subtle">${s.StudentID}</span> • <span>${s.ClassName || ''}</span>
                  </div>
                </div>
                <div class="rate-badge ${rateColor}">
                  <span class="rate-number">${rate}%</span>
                  <span class="rate-label">វត្តមាន</span>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="rate-bar-container">
                <div class="rate-bar-fill ${rateColor}" style="width: ${rate}%;"></div>
              </div>

              <!-- Breakdown counts -->
              <div class="summary-counts-row">
                <span class="tag-present">🟢 វត្តមាន: <strong>${s.Present}</strong></span>
                <span class="tag-absent">🔴 អវត្តមាន: <strong>${s.Absent}</strong></span>
                <span class="tag-late">🟡 យឺត: <strong>${s.Late}</strong></span>
                <span class="tag-permission">🔵 ច្បាប់: <strong>${s.Permission}</strong></span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};
