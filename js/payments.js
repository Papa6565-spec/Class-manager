/**
 * Class Manager — Payment Record Module
 */

const PaymentsModule = {
  paymentsList: [],
  studentsList: [],
  classesList: [],
  totalSummary: null,

  // Filters
  filterStudentId: '',
  filterClassId: '',
  filterMonth: '',
  filterDate: '',
  searchQuery: '',

  async render() {
    const container = document.getElementById('view-payments');
    if (!container) return;

    App.showLoading('កំពុងទាញយកប្រវត្តិកត់ត្រាបង់ប្រាក់...');
    try {
      const [payRes, stuRes, clsRes] = await Promise.all([
        API.request('getPayments', 'GET', {
          studentId: this.filterStudentId,
          classId: this.filterClassId,
          month: this.filterMonth,
          date: this.filterDate,
          q: this.searchQuery
        }),
        API.request('getStudents', 'GET'),
        API.request('getClasses', 'GET')
      ]);

      if (payRes && payRes.success && payRes.data) {
        this.paymentsList = payRes.data.payments || [];
        this.totalSummary = payRes.data;
      }
      if (stuRes && stuRes.success) {
        this.studentsList = stuRes.data || [];
      }
      if (clsRes && clsRes.success) {
        this.classesList = clsRes.data || [];
      }

      this.renderUI();
    } catch (err) {
      App.showToast('កំហុសទាញយកការបង់ប្រាក់: ' + err.message, 'error');
    } finally {
      App.hideLoading();
    }
  },

  renderUI() {
    const container = document.getElementById('view-payments');
    if (!container) return;

    const formattedTotal = (this.totalSummary && this.totalSummary.formattedTotal) || '0 ៛';
    const totalCount = (this.totalSummary && this.totalSummary.totalCount) || this.paymentsList.length;

    container.innerHTML = `
      <div class="page-header-row">
        <div>
          <h2 class="page-title">កត់ត្រាការបង់ប្រាក់</h2>
          <div class="page-subtitle">គ្រប់គ្រងប្រវត្តិនៃការបង់ថ្លៃសិក្សាសិស្ស</div>
        </div>
        <button class="btn btn-primary" onclick="PaymentsModule.openAddModal()">
          💵 កត់ត្រាបង់ប្រាក់
        </button>
      </div>

      <!-- Total Paid Highlight Banner -->
      <div class="card payment-total-card">
        <div class="total-header">
          <div class="total-icon">💰</div>
          <div>
            <div class="total-caption">ប្រាក់ចំណូលសរុប (តាមលក្ខខណ្ឌចម្រាញ់)</div>
            <div class="total-big-amount">${formattedTotal}</div>
          </div>
        </div>
        <div class="total-footer">
          <span>ប្រតិបត្តិការសរុប៖ <strong>${totalCount}</strong> ដង</span>
        </div>
      </div>

      <!-- Search & Multi-Filters Card -->
      <div class="card selector-card">
        <div class="search-input-wrapper mb-2">
          <span class="search-icon">🔍</span>
          <input 
            type="search" 
            class="input-search" 
            placeholder="ស្វែងរកតាម ឈ្មោះ, ID, បង្កាន់ដៃ, ប្រភេទ..." 
            value="${this.searchQuery}"
            oninput="PaymentsModule.onSearchChange(this.value)"
          />
        </div>

        <div class="filter-grid-3">
          <div class="form-group mb-0">
            <select 
              class="input-select" 
              onchange="PaymentsModule.onFilterChange('class', this.value)"
            >
              <option value="">-- គ្រប់ថ្នាក់ទាំងអស់ --</option>
              ${this.classesList.map(c => `
                <option value="${c.ClassID}" ${this.filterClassId === c.ClassID ? 'selected' : ''}>
                  ${c.ClassName}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group mb-0">
            <select 
              class="input-select" 
              onchange="PaymentsModule.onFilterChange('student', this.value)"
            >
              <option value="">-- គ្រប់សិស្សទាំងអស់ --</option>
              ${this.studentsList.map(s => `
                <option value="${s.StudentID}" ${this.filterStudentId === s.StudentID ? 'selected' : ''}>
                  ${s.StudentName} (${s.StudentID})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group mb-0">
            <input 
              type="text" 
              class="input-field" 
              placeholder="ខែ (ឧ. 09/2026)" 
              value="${this.filterMonth}"
              onchange="PaymentsModule.onFilterChange('month', this.value)"
            />
          </div>
        </div>
      </div>

      <!-- Payment History List -->
      <div class="payment-cards-container" id="payment-cards-list">
        ${this.renderPaymentCards()}
      </div>
    `;
  },

  renderPaymentCards() {
    if (!this.paymentsList || this.paymentsList.length === 0) {
      return `
        <div class="card empty-state-card">
          <div class="empty-icon">💵</div>
          <h3>មិនទាន់មានទិន្នន័យបង់ប្រាក់ទេ</h3>
          <p>ចុចប៊ូតុង "កត់ត្រាបង់ប្រាក់" ដើម្បីបញ្ចូលកំណត់ត្រាថ្មី។</p>
        </div>
      `;
    }

    return this.paymentsList.map(p => `
      <div class="card payment-card">
        <div class="payment-card-header">
          <div class="payment-student-info">
            <h4 class="payment-student-name" onclick="ProfileModule.open('${p.StudentID}')">${p.StudentName}</h4>
            <div class="payment-meta-tags">
              <span class="badge badge-subtle">${p.StudentID}</span> • 
              <span class="badge badge-purple">${p.ClassName || 'គ្មានថ្នាក់'}</span>
            </div>
          </div>
          <div class="payment-amount-box">
            <div class="payment-amount-val">${p.Amount}</div>
            <div class="payment-type-badge">${p.PaymentType || 'Tuition Fee'}</div>
          </div>
        </div>

        <div class="payment-card-details">
          <div class="payment-detail-pill">
            <span class="pill-label">📅 ថ្ងៃបង់៖</span>
            <span class="pill-val">${p.PaymentDate || ''}</span>
          </div>
          <div class="payment-detail-pill">
            <span class="pill-label">🗓️ សម្រាប់ខែ៖</span>
            <span class="pill-val">${p.Month || '—'}</span>
          </div>
          <div class="payment-detail-pill">
            <span class="pill-label">🧾 លេខវិក្កយបត្រ៖</span>
            <span class="pill-val">${p.PaymentID}</span>
          </div>
        </div>

        ${p.Note ? `
          <div class="payment-note-box">
            💬 <strong>ចំណាំ៖</strong> ${p.Note}
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  onFilterChange(type, value) {
    if (type === 'class') this.filterClassId = value;
    if (type === 'student') this.filterStudentId = value;
    if (type === 'month') this.filterMonth = value;
    if (type === 'date') this.filterDate = value;
    this.render();
  },

  onSearchChange(value) {
    this.searchQuery = value;
    this.render();
  },

  openAddModal(preSelectedStudentId = '') {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMonthStr = ('0' + (now.getMonth() + 1)).slice(-2) + '/' + now.getFullYear();

    App.openModal({
      title: '💵 កត់ត្រាការបង់ប្រាក់ថ្មី',
      body: `
        <form id="add-payment-form" onsubmit="event.preventDefault(); PaymentsModule.submitAdd();">
          <div class="form-group">
            <label class="form-label">ជ្រើសរើសសិស្ស <span class="required">*</span></label>
            <select id="pay-student-id" class="input-select" required onchange="PaymentsModule.onModalStudentSelect(this.value)">
              <option value="">-- ជ្រើសរើសសិស្ស --</option>
              ${this.studentsList.map(s => `
                <option value="${s.StudentID}" ${preSelectedStudentId === s.StudentID ? 'selected' : ''}>
                  ${s.StudentName} (${s.StudentID}) - ${s.ClassName || ''}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">ថ្នាក់រៀន</label>
            <input type="text" id="pay-class-name" class="input-field" readonly placeholder="នឹងបង្ហាញស្វ័យប្រវត្តិតាមសិស្ស" />
            <input type="hidden" id="pay-class-id" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ចំនួនទឹកប្រាក់ <span class="required">*</span></label>
              <input type="text" id="pay-amount" class="input-field text-bold" required placeholder="ឧ. 120,000៛ ឬ $30" />
            </div>
            <div class="form-group">
              <label class="form-label">សម្រាប់ខែ</label>
              <input type="text" id="pay-month" class="input-field" value="${currentMonthStr}" placeholder="MM/YYYY" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ប្រភេទបង់ប្រាក់</label>
              <select id="pay-type" class="input-select">
                <option value="Tuition Fee">ថ្លៃសិក្សា (Tuition Fee)</option>
                <option value="Registration Fee">ថ្លៃចុះឈ្មោះ (Registration Fee)</option>
                <option value="Book/Material Fee">ថ្លៃសៀវភៅ/សម្ភារៈ</option>
                <option value="Other">ផ្សេងៗ (Other)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">ថ្ងៃកត់ត្រាបង់</label>
              <input type="date" id="pay-date" class="input-field" value="${today}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">ចំណាំបន្ថែម</label>
            <textarea id="pay-note" class="input-textarea" rows="2" placeholder="ព័ត៌មានលម្អិតបន្ថែម..."></textarea>
          </div>

          <div class="modal-buttons">
            <button type="button" class="btn btn-outline" onclick="App.closeModal()">បោះបង់</button>
            <button type="submit" class="btn btn-primary">រក្សាទុកការបង់ប្រាក់</button>
          </div>
        </form>
      `
    });

    if (preSelectedStudentId) {
      this.onModalStudentSelect(preSelectedStudentId);
    }
  },

  onModalStudentSelect(studentId) {
    const student = this.studentsList.find(s => s.StudentID === studentId);
    const clsNameEl = document.getElementById('pay-class-name');
    const clsIdEl = document.getElementById('pay-class-id');
    if (student && clsNameEl && clsIdEl) {
      clsNameEl.value = student.ClassName || 'គ្មានថ្នាក់';
      clsIdEl.value = student.ClassID || '';
    }
  },

  async submitAdd() {
    const studentId = document.getElementById('pay-student-id').value;
    const amount = document.getElementById('pay-amount').value.trim();

    if (!studentId || !amount) {
      App.showToast('សូមជ្រើសរើសសិស្ស និងបញ្ចូលចំនួនទឹកប្រាក់', 'error');
      return;
    }

    const payload = {
      StudentID: studentId,
      ClassID: document.getElementById('pay-class-id').value,
      ClassName: document.getElementById('pay-class-name').value,
      Amount: amount,
      Month: document.getElementById('pay-month').value.trim(),
      PaymentType: document.getElementById('pay-type').value,
      PaymentDate: document.getElementById('pay-date').value,
      Note: document.getElementById('pay-note').value.trim()
    };

    App.showLoading('កំពុងកត់ត្រាការបង់ប្រាក់...');
    try {
      const res = await API.request('savePayment', 'POST', payload);
      if (res && res.success) {
        App.closeModal();
        App.showToast('✅ រក្សាទុកការបង់ប្រាក់បានជោគជ័យ', 'success');
        await this.render();
      } else {
        App.showToast(res.message || 'បរាជ័យក្នុងការកត់ត្រា', 'error');
      }
    } catch (err) {
      App.showToast('❌ មានបញ្ហា។ សូមព្យាយាមម្ដងទៀត។', 'error');
    } finally {
      App.hideLoading();
    }
  }
};
