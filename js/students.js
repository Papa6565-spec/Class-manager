/**
 * Class Manager — Student Management Module
 */

const StudentsModule = {
  studentsList: [],
  classesList: [],
  currentFilterClass: '',
  searchQuery: '',

  async render() {
    const container = document.getElementById('view-students');
    if (!container) return;

    App.showLoading('កំពុងទាញយកបញ្ជីសិស្ស...');
    try {
      const [stuRes, clsRes] = await Promise.all([
        API.request('getStudents', 'GET'),
        API.request('getClasses', 'GET')
      ]);

      if (stuRes && stuRes.success) {
        this.studentsList = stuRes.data || [];
      }
      if (clsRes && clsRes.success) {
        this.classesList = clsRes.data || [];
      }

      this.renderUI();
    } catch (err) {
      App.showToast('កំហុសទាញយកសិស្ស: ' + err.message, 'error');
    } finally {
      App.hideLoading();
    }
  },

  renderUI() {
    const container = document.getElementById('view-students');
    if (!container) return;

    const filtered = this.getFilteredStudents();

    container.innerHTML = `
      <div class="page-header-row">
        <div>
          <h2 class="page-title">បញ្ជីសិស្ស</h2>
          <div class="page-subtitle">សរុប៖ <strong>${filtered.length}</strong> នាក់</div>
        </div>
        <button class="btn btn-primary" onclick="StudentsModule.openAddModal()">
          ➕ ចុះឈ្មោះសិស្ស
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="search-filter-card card">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="search" 
            id="student-search-input" 
            class="input-search" 
            placeholder="ស្វែងរកតាម ឈ្មោះ, ID, លេខទូរស័ព្ទ, ថ្នាក់..." 
            value="${this.searchQuery}"
            oninput="StudentsModule.onSearchChange(this.value)"
          />
        </div>
        <div class="filter-row">
          <select 
            id="student-class-filter" 
            class="input-select" 
            onchange="StudentsModule.onClassFilterChange(this.value)"
          >
            <option value="">-- គ្រប់ថ្នាក់ទាំងអស់ --</option>
            ${this.classesList.map(c => `
              <option value="${c.ClassID}" ${this.currentFilterClass === c.ClassID ? 'selected' : ''}>
                ${c.ClassName}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Students Cards List -->
      <div class="student-cards-container" id="student-cards-list">
        ${this.renderStudentCards(filtered)}
      </div>
    `;
  },

  getFilteredStudents() {
    return this.studentsList.filter(s => {
      const matchClass = !this.currentFilterClass || s.ClassID === this.currentFilterClass;
      if (!matchClass) return false;

      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase().trim();
      const name = (s.StudentName || '').toLowerCase();
      const id = (s.StudentID || '').toLowerCase();
      const phone = (s.Phone || '').toLowerCase();
      const clsName = (s.ClassName || '').toLowerCase();
      return name.includes(q) || id.includes(q) || phone.includes(q) || clsName.includes(q);
    });
  },

  onSearchChange(value) {
    this.searchQuery = value;
    const filtered = this.getFilteredStudents();
    const listEl = document.getElementById('student-cards-list');
    if (listEl) {
      listEl.innerHTML = this.renderStudentCards(filtered);
    }
  },

  onClassFilterChange(classId) {
    this.currentFilterClass = classId;
    const filtered = this.getFilteredStudents();
    const listEl = document.getElementById('student-cards-list');
    if (listEl) {
      listEl.innerHTML = this.renderStudentCards(filtered);
    }
  },

  renderStudentCards(students) {
    if (!students || students.length === 0) {
      return `
        <div class="card empty-state-card">
          <div class="empty-icon">👨‍🎓</div>
          <h3>រកមិនឃើញទិន្នន័យសិស្សទេ</h3>
          <p>សូមសាកល្បងស្វែងរកម្តងទៀត ឬចុចប៊ូតុង "ចុះឈ្មោះសិស្ស" ដើម្បីបន្ថែមថ្មី។</p>
        </div>
      `;
    }

    return students.map(s => `
      <div class="card student-card">
        <div class="student-card-header">
          <div class="student-avatar-box">
            ${s.Gender === 'ស្រី' ? '👩' : '👨'}
          </div>
          <div class="student-headline">
            <h3 class="student-name" onclick="ProfileModule.open('${s.StudentID}')">${s.StudentName}</h3>
            <div class="student-meta-tags">
              <span class="badge badge-primary">${s.StudentID}</span>
              <span class="badge ${s.Status === 'សកម្ម' ? 'badge-success' : 'badge-neutral'}">${s.Status || 'សកម្ម'}</span>
            </div>
          </div>
        </div>

        <div class="student-details-grid">
          <div class="detail-row">
            <span class="detail-label">ភេទ៖</span>
            <span class="detail-value">${s.Gender || 'ប្រុស'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">ថ្នាក់រៀន៖</span>
            <span class="detail-value text-bold text-accent">${s.ClassName || 'មិនទាន់មាន'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">ទូរស័ព្ទ៖</span>
            <span class="detail-value">${s.Phone ? `<a href="tel:${s.Phone}">${s.Phone}</a>` : '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">អាណាព្យាបាល៖</span>
            <span class="detail-value">${s.ParentName || '—'} ${s.ParentPhone ? `(${s.ParentPhone})` : ''}</span>
          </div>
        </div>

        <div class="student-card-actions">
          <button class="btn btn-sm btn-outline" onclick="ProfileModule.open('${s.StudentID}')">
            👁️ មើល Profile
          </button>
          <button class="btn btn-sm btn-secondary" onclick="StudentsModule.openEditModal('${s.StudentID}')">
            ✏️ កែប្រែ
          </button>
          <button class="btn btn-sm btn-danger" onclick="StudentsModule.confirmDelete('${s.StudentID}', '${encodeURIComponent(s.StudentName)}')">
            🗑️ លុប
          </button>
        </div>
      </div>
    `).join('');
  },

  openAddModal() {
    const today = new Date().toISOString().split('T')[0];

    App.openModal({
      title: '➕ ចុះឈ្មោះសិស្សថ្មី',
      body: `
        <form id="add-student-form" onsubmit="event.preventDefault(); StudentsModule.submitAdd();">
          <div class="form-group">
            <label class="form-label">ឈ្មោះសិស្ស <span class="required">*</span></label>
            <input type="text" id="stu-name" class="input-field" required placeholder="ឧទាហរណ៍៖ សុខ ដារ៉ា" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ភេទ</label>
              <select id="stu-gender" class="input-select">
                <option value="ប្រុស">ប្រុស</option>
                <option value="ស្រី">ស្រី</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">ថ្ងៃខែឆ្នាំកំណើត</label>
              <input type="date" id="stu-dob" class="input-field" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">លេខទូរស័ព្ទសិស្ស</label>
            <input type="tel" id="stu-phone" class="input-field" placeholder="ឧទាហរណ៍៖ 012 345 678" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ឈ្មោះអាណាព្យាបាល</label>
              <input type="text" id="stu-parent-name" class="input-field" placeholder="ឧ. សុខ សាន" />
            </div>
            <div class="form-group">
              <label class="form-label">ទូរស័ព្ទអាណាព្យាបាល</label>
              <input type="tel" id="stu-parent-phone" class="input-field" placeholder="ឧ. 012 999 888" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">អាសយដ្ឋាន</label>
            <input type="text" id="stu-address" class="input-field" placeholder="ឧ. ភ្នំពេញ" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ជ្រើសរើសថ្នាក់រៀន <span class="required">*</span></label>
              <select id="stu-class-id" class="input-select" required>
                <option value="">-- ជ្រើសរើសថ្នាក់ --</option>
                ${this.classesList.map(c => `<option value="${c.ClassID}">${c.ClassName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">កាលបរិច្ឆេទចុះឈ្មោះ</label>
              <input type="date" id="stu-reg-date" class="input-field" value="${today}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">ស្ថានភាព</label>
            <select id="stu-status" class="input-select">
              <option value="សកម្ម">សកម្ម</option>
              <option value="ផ្អាក">ផ្អាក</option>
              <option value="ឈប់រៀន">ឈប់រៀន</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">ចំណាំបន្ថែម</label>
            <textarea id="stu-note" class="input-textarea" rows="2" placeholder="កំណត់ចំណាំផ្សេងៗ..."></textarea>
          </div>

          <div class="modal-buttons">
            <button type="button" class="btn btn-outline" onclick="App.closeModal()">បោះបង់</button>
            <button type="submit" class="btn btn-primary">រក្សាទុក</button>
          </div>
        </form>
      `
    });
  },

  async submitAdd() {
    const name = document.getElementById('stu-name').value.trim();
    const classId = document.getElementById('stu-class-id').value;

    if (!name) {
      App.showToast('សូមបញ្ចូលឈ្មោះសិស្ស', 'error');
      return;
    }
    if (!classId) {
      App.showToast('សូមជ្រើសរើសថ្នាក់រៀន', 'error');
      return;
    }

    const payload = {
      StudentName: name,
      Gender: document.getElementById('stu-gender').value,
      DateOfBirth: document.getElementById('stu-dob').value,
      Phone: document.getElementById('stu-phone').value.trim(),
      ParentName: document.getElementById('stu-parent-name').value.trim(),
      ParentPhone: document.getElementById('stu-parent-phone').value.trim(),
      Address: document.getElementById('stu-address').value.trim(),
      ClassID: classId,
      RegisterDate: document.getElementById('stu-reg-date').value,
      Status: document.getElementById('stu-status').value,
      Note: document.getElementById('stu-note').value.trim()
    };

    App.showLoading('កំពុងរក្សាទុក...');
    try {
      const res = await API.request('addStudent', 'POST', payload);
      if (res && res.success) {
        App.closeModal();
        App.showToast('✅ ចុះឈ្មោះសិស្សបានជោគជ័យ', 'success');
        await this.render();
      } else {
        App.showToast(res.message || 'បរាជ័យក្នុងការចុះឈ្មោះ', 'error');
      }
    } catch (err) {
      App.showToast('❌ មានបញ្ហា។ សូមព្យាយាមម្ដងទៀត។', 'error');
    } finally {
      App.hideLoading();
    }
  },

  openEditModal(studentId) {
    const student = this.studentsList.find(s => s.StudentID === studentId);
    if (!student) {
      App.showToast('រកមិនឃើញសិស្សនេះទេ', 'error');
      return;
    }

    App.openModal({
      title: `✏️ កែប្រែព័ត៌មាន — ${student.StudentID}`,
      body: `
        <form id="edit-student-form" onsubmit="event.preventDefault(); StudentsModule.submitEdit('${student.StudentID}');">
          <div class="form-group">
            <label class="form-label">ឈ្មោះសិស្ស <span class="required">*</span></label>
            <input type="text" id="edit-stu-name" class="input-field" required value="${student.StudentName}" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ភេទ</label>
              <select id="edit-stu-gender" class="input-select">
                <option value="ប្រុស" ${student.Gender === 'ប្រុស' ? 'selected' : ''}>ប្រុស</option>
                <option value="ស្រី" ${student.Gender === 'ស្រី' ? 'selected' : ''}>ស្រី</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">ថ្ងៃខែឆ្នាំកំណើត</label>
              <input type="date" id="edit-stu-dob" class="input-field" value="${student.DateOfBirth || ''}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">លេខទូរស័ព្ទសិស្ស</label>
            <input type="tel" id="edit-stu-phone" class="input-field" value="${student.Phone || ''}" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ឈ្មោះអាណាព្យាបាល</label>
              <input type="text" id="edit-stu-parent-name" class="input-field" value="${student.ParentName || ''}" />
            </div>
            <div class="form-group">
              <label class="form-label">ទូរស័ព្ទអាណាព្យាបាល</label>
              <input type="tel" id="edit-stu-parent-phone" class="input-field" value="${student.ParentPhone || ''}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">អាសយដ្ឋាន</label>
            <input type="text" id="edit-stu-address" class="input-field" value="${student.Address || ''}" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ថ្នាក់រៀន <span class="required">*</span></label>
              <select id="edit-stu-class-id" class="input-select" required>
                ${this.classesList.map(c => `
                  <option value="${c.ClassID}" ${c.ClassID === student.ClassID ? 'selected' : ''}>
                    ${c.ClassName}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">ស្ថានភាព</label>
              <select id="edit-stu-status" class="input-select">
                <option value="សកម្ម" ${student.Status === 'សកម្ម' ? 'selected' : ''}>សកម្ម</option>
                <option value="ផ្អាក" ${student.Status === 'ផ្អាក' ? 'selected' : ''}>ផ្អាក</option>
                <option value="ឈប់រៀន" ${student.Status === 'ឈប់រៀន' ? 'selected' : ''}>ឈប់រៀន</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">ចំណាំបន្ថែម</label>
            <textarea id="edit-stu-note" class="input-textarea" rows="2">${student.Note || ''}</textarea>
          </div>

          <div class="modal-buttons">
            <button type="button" class="btn btn-outline" onclick="App.closeModal()">បោះបង់</button>
            <button type="submit" class="btn btn-primary">រក្សាទុកការកែប្រែ</button>
          </div>
        </form>
      `
    });
  },

  async submitEdit(studentId) {
    const name = document.getElementById('edit-stu-name').value.trim();
    const classId = document.getElementById('edit-stu-class-id').value;

    if (!name || !classId) {
      App.showToast('សូមបំពេញឈ្មោះ និងជ្រើសរើសថ្នាក់', 'error');
      return;
    }

    const payload = {
      StudentID: studentId,
      StudentName: name,
      Gender: document.getElementById('edit-stu-gender').value,
      DateOfBirth: document.getElementById('edit-stu-dob').value,
      Phone: document.getElementById('edit-stu-phone').value.trim(),
      ParentName: document.getElementById('edit-stu-parent-name').value.trim(),
      ParentPhone: document.getElementById('edit-stu-parent-phone').value.trim(),
      Address: document.getElementById('edit-stu-address').value.trim(),
      ClassID: classId,
      Status: document.getElementById('edit-stu-status').value,
      Note: document.getElementById('edit-stu-note').value.trim()
    };

    App.showLoading('កំពុងរក្សាទុក...');
    try {
      const res = await API.request('updateStudent', 'POST', payload);
      if (res && res.success) {
        App.closeModal();
        App.showToast('✅ កែប្រែបានជោគជ័យ', 'success');
        await this.render();
      } else {
        App.showToast(res.message || 'បរាជ័យក្នុងការកែប្រែ', 'error');
      }
    } catch (err) {
      App.showToast('❌ មានបញ្ហា។ សូមព្យាយាមម្ដងទៀត។', 'error');
    } finally {
      App.hideLoading();
    }
  },

  confirmDelete(studentId, encodedName) {
    const studentName = decodeURIComponent(encodedName);
    App.openConfirmDialog({
      title: 'លុបសិស្ស',
      message: `តើអ្នកពិតជាចង់លុបសិស្ស <strong>"${studentName}" (${studentId})</strong> នេះមែនទេ?`,
      confirmText: '🗑️ លុប',
      cancelText: 'បោះបង់',
      onConfirm: async () => {
        App.showLoading('កំពុងលុបទិន្នន័យ...');
        try {
          const res = await API.request('deleteStudent', 'POST', { studentId: studentId });
          if (res && res.success) {
            App.showToast('✅ លុបបានជោគជ័យ', 'success');
            await StudentsModule.render();
          } else {
            App.showToast(res.message || 'មិនអាចលុបបានទេ', 'error');
          }
        } catch (err) {
          App.showToast('❌ មានបញ្ហា។ សូមព្យាយាមម្ដងទៀត។', 'error');
        } finally {
          App.hideLoading();
        }
      }
    });
  }
};
