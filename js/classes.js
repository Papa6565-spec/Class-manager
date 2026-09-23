/**
 * Class Manager — Class Management Module
 */

const ClassesModule = {
  classesList: [],
  searchQuery: '',

  async render() {
    const container = document.getElementById('view-classes');
    if (!container) return;

    App.showLoading('កំពុងទាញយកបញ្ជីថ្នាក់...');
    try {
      const res = await API.request('getClasses', 'GET');
      if (res && res.success) {
        this.classesList = res.data || [];
        this.renderUI();
      } else {
        App.showToast(res.message || 'មិនអាចទាញយកបញ្ជីថ្នាក់បានទេ', 'error');
      }
    } catch (err) {
      App.showToast('កំហុសទាញយកថ្នាក់: ' + err.message, 'error');
    } finally {
      App.hideLoading();
    }
  },

  renderUI() {
    const container = document.getElementById('view-classes');
    if (!container) return;

    const filtered = this.getFilteredClasses();

    container.innerHTML = `
      <div class="page-header-row">
        <div>
          <h2 class="page-title">គ្រប់គ្រងថ្នាក់រៀន</h2>
          <div class="page-subtitle">ថ្នាក់សរុប៖ <strong>${filtered.length}</strong> ថ្នាក់</div>
        </div>
        <button class="btn btn-primary" onclick="ClassesModule.openAddModal()">
          ➕ បន្ថែមថ្នាក់
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-filter-card card">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="search" 
            class="input-search" 
            placeholder="ស្វែងរកតាម ឈ្មោះថ្នាក់, គ្រូ, បន្ទប់..." 
            value="${this.searchQuery}"
            oninput="ClassesModule.onSearchChange(this.value)"
          />
        </div>
      </div>

      <!-- Class Cards List -->
      <div class="class-cards-container" id="class-cards-list">
        ${this.renderClassCards(filtered)}
      </div>
    `;
  },

  getFilteredClasses() {
    if (!this.searchQuery) return this.classesList;
    const q = this.searchQuery.toLowerCase().trim();
    return this.classesList.filter(c =>
      (c.ClassName || '').toLowerCase().includes(q) ||
      (c.ClassID || '').toLowerCase().includes(q) ||
      (c.TeacherName || '').toLowerCase().includes(q) ||
      (c.Room || '').toLowerCase().includes(q)
    );
  },

  onSearchChange(value) {
    this.searchQuery = value;
    const filtered = this.getFilteredClasses();
    const listEl = document.getElementById('class-cards-list');
    if (listEl) {
      listEl.innerHTML = this.renderClassCards(filtered);
    }
  },

  renderClassCards(classes) {
    if (!classes || classes.length === 0) {
      return `
        <div class="card empty-state-card">
          <div class="empty-icon">🏫</div>
          <h3>រកមិនឃើញថ្នាក់រៀនទេ</h3>
          <p>សូមចុចប៊ូតុង "បន្ថែមថ្នាក់" ដើម្បីបង្កើតថ្នាក់រៀនថ្មី។</p>
        </div>
      `;
    }

    return classes.map(c => `
      <div class="card class-card">
        <div class="class-card-header">
          <div class="class-headline">
            <h3 class="class-title">${c.ClassName}</h3>
            <div class="class-meta-tags">
              <span class="badge badge-purple">${c.ClassID}</span>
              <span class="badge ${c.Status === 'សកម្ម' ? 'badge-success' : 'badge-neutral'}">${c.Status || 'សកម្ម'}</span>
              <span class="badge badge-subtle">👨‍🎓 ${c.studentCount || 0} នាក់</span>
            </div>
          </div>
        </div>

        <div class="class-details-grid">
          <div class="detail-row">
            <span class="detail-label">គ្រូបង្រៀន៖</span>
            <span class="detail-value text-bold">${c.TeacherName || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">បន្ទប់រៀន៖</span>
            <span class="detail-value">${c.Room || '—'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">ម៉ោងសិក្សា៖</span>
            <span class="detail-value">${c.Schedule || '—'}</span>
          </div>
          ${c.StartDate ? `
            <div class="detail-row">
              <span class="detail-label">កាលបរិច្ឆេទ៖</span>
              <span class="detail-value">${c.StartDate} ${c.EndDate ? `ដល់ ${c.EndDate}` : ''}</span>
            </div>
          ` : ''}
          ${c.Note ? `
            <div class="detail-row">
              <span class="detail-label">ចំណាំ៖</span>
              <span class="detail-value text-muted">${c.Note}</span>
            </div>
          ` : ''}
        </div>

        <div class="student-card-actions">
          <button class="btn btn-sm btn-outline" onclick="ClassesModule.viewStudentsInClass('${c.ClassID}')">
            👥 សិស្សក្នុងថ្នាក់ (${c.studentCount || 0})
          </button>
          <button class="btn btn-sm btn-secondary" onclick="ClassesModule.openEditModal('${c.ClassID}')">
            ✏️ កែប្រែ
          </button>
          <button class="btn btn-sm btn-danger" onclick="ClassesModule.confirmDelete('${c.ClassID}', '${encodeURIComponent(c.ClassName)}')">
            🗑️ លុប
          </button>
        </div>
      </div>
    `).join('');
  },

  viewStudentsInClass(classId) {
    StudentsModule.currentFilterClass = classId;
    App.navigateTo('students');
  },

  openAddModal() {
    App.openModal({
      title: '🏫 បន្ថែមថ្នាក់រៀនថ្មី',
      body: `
        <form id="add-class-form" onsubmit="event.preventDefault(); ClassesModule.submitAdd();">
          <div class="form-group">
            <label class="form-label">ឈ្មោះថ្នាក់រៀន <span class="required">*</span></label>
            <input type="text" id="cls-name" class="input-field" required placeholder="ឧទាហរណ៍៖ ថ្នាក់ទី១១ B" />
          </div>

          <div class="form-group">
            <label class="form-label">គ្រូបង្រៀនទទួលបន្ទុក</label>
            <input type="text" id="cls-teacher" class="input-field" placeholder="ឧទាហរណ៍៖ លោកគ្រូ សុខ សាន" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">បន្ទប់រៀន</label>
              <input type="text" id="cls-room" class="input-field" placeholder="ឧ. បន្ទប់ 201" />
            </div>
            <div class="form-group">
              <label class="form-label">ស្ថានភាព</label>
              <select id="cls-status" class="input-select">
                <option value="សកម្ម">សកម្ម</option>
                <option value="ផ្អាក">ផ្អាក</option>
                <option value="បញ្ចប់">បញ្ចប់</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">កាលវិភាគ / ម៉ោងសិក្សា</label>
            <input type="text" id="cls-schedule" class="input-field" placeholder="ឧ. ចន្ទ - សុក្រ (08:00 - 10:00)" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ថ្ងៃចាប់ផ្តើម</label>
              <input type="date" id="cls-start-date" class="input-field" />
            </div>
            <div class="form-group">
              <label class="form-label">ថ្ងៃបញ្ចប់</label>
              <input type="date" id="cls-end-date" class="input-field" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">ចំណាំបន្ថែម</label>
            <textarea id="cls-note" class="input-textarea" rows="2" placeholder="កំណត់ចំណាំផ្សេងៗ..."></textarea>
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
    const name = document.getElementById('cls-name').value.trim();
    if (!name) {
      App.showToast('សូមបញ្ចូលឈ្មោះថ្នាក់រៀន', 'error');
      return;
    }

    const payload = {
      ClassName: name,
      TeacherName: document.getElementById('cls-teacher').value.trim(),
      Room: document.getElementById('cls-room').value.trim(),
      Schedule: document.getElementById('cls-schedule').value.trim(),
      StartDate: document.getElementById('cls-start-date').value,
      EndDate: document.getElementById('cls-end-date').value,
      Status: document.getElementById('cls-status').value,
      Note: document.getElementById('cls-note').value.trim()
    };

    App.showLoading('កំពុងរក្សាទុក...');
    try {
      const res = await API.request('addClass', 'POST', payload);
      if (res && res.success) {
        App.closeModal();
        App.showToast('✅ បន្ថែមថ្នាក់រៀនបានជោគជ័យ', 'success');
        await this.render();
      } else {
        App.showToast(res.message || 'បរាជ័យក្នុងការបន្ថែមថ្នាក់', 'error');
      }
    } catch (err) {
      App.showToast('❌ មានបញ្ហា។ សូមព្យាយាមម្ដងទៀត។', 'error');
    } finally {
      App.hideLoading();
    }
  },

  openEditModal(classId) {
    const cls = this.classesList.find(c => c.ClassID === classId);
    if (!cls) {
      App.showToast('រកមិនឃើញថ្នាក់នេះទេ', 'error');
      return;
    }

    App.openModal({
      title: `✏️ កែប្រែថ្នាក់ — ${cls.ClassID}`,
      body: `
        <form id="edit-class-form" onsubmit="event.preventDefault(); ClassesModule.submitEdit('${cls.ClassID}');">
          <div class="form-group">
            <label class="form-label">ឈ្មោះថ្នាក់រៀន <span class="required">*</span></label>
            <input type="text" id="edit-cls-name" class="input-field" required value="${cls.ClassName}" />
          </div>

          <div class="form-group">
            <label class="form-label">គ្រូបង្រៀនទទួលបន្ទុក</label>
            <input type="text" id="edit-cls-teacher" class="input-field" value="${cls.TeacherName || ''}" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">បន្ទប់រៀន</label>
              <input type="text" id="edit-cls-room" class="input-field" value="${cls.Room || ''}" />
            </div>
            <div class="form-group">
              <label class="form-label">ស្ថានភាព</label>
              <select id="edit-cls-status" class="input-select">
                <option value="សកម្ម" ${cls.Status === 'សកម្ម' ? 'selected' : ''}>សកម្ម</option>
                <option value="ផ្អាក" ${cls.Status === 'ផ្អាក' ? 'selected' : ''}>ផ្អាក</option>
                <option value="បញ្ចប់" ${cls.Status === 'បញ្ចប់' ? 'selected' : ''}>បញ្ចប់</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">កាលវិភាគ / ម៉ោងសិក្សា</label>
            <input type="text" id="edit-cls-schedule" class="input-field" value="${cls.Schedule || ''}" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ថ្ងៃចាប់ផ្តើម</label>
              <input type="date" id="edit-cls-start-date" class="input-field" value="${cls.StartDate || ''}" />
            </div>
            <div class="form-group">
              <label class="form-label">ថ្ងៃបញ្ចប់</label>
              <input type="date" id="edit-cls-end-date" class="input-field" value="${cls.EndDate || ''}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">ចំណាំបន្ថែម</label>
            <textarea id="edit-cls-note" class="input-textarea" rows="2">${cls.Note || ''}</textarea>
          </div>

          <div class="modal-buttons">
            <button type="button" class="btn btn-outline" onclick="App.closeModal()">បោះបង់</button>
            <button type="submit" class="btn btn-primary">រក្សាទុកការកែប្រែ</button>
          </div>
        </form>
      `
    });
  },

  async submitEdit(classId) {
    const name = document.getElementById('edit-cls-name').value.trim();
    if (!name) {
      App.showToast('សូមបញ្ចូលឈ្មោះថ្នាក់រៀន', 'error');
      return;
    }

    const payload = {
      ClassID: classId,
      ClassName: name,
      TeacherName: document.getElementById('edit-cls-teacher').value.trim(),
      Room: document.getElementById('edit-cls-room').value.trim(),
      Schedule: document.getElementById('edit-cls-schedule').value.trim(),
      StartDate: document.getElementById('edit-cls-start-date').value,
      EndDate: document.getElementById('edit-cls-end-date').value,
      Status: document.getElementById('edit-cls-status').value,
      Note: document.getElementById('edit-cls-note').value.trim()
    };

    App.showLoading('កំពុងរក្សាទុក...');
    try {
      const res = await API.request('updateClass', 'POST', payload);
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

  confirmDelete(classId, encodedName) {
    const className = decodeURIComponent(encodedName);
    App.openConfirmDialog({
      title: 'លុបថ្នាក់រៀន',
      message: `តើអ្នកពិតជាចង់លុបថ្នាក់ <strong>"${className}" (${classId})</strong> នេះមែនទេ?`,
      confirmText: '🗑️ លុប',
      cancelText: 'បោះបង់',
      onConfirm: async () => {
        App.showLoading('កំពុងលុបទិន្នន័យ...');
        try {
          const res = await API.request('deleteClass', 'POST', { classId: classId });
          if (res && res.success) {
            App.showToast('✅ លុបបានជោគជ័យ', 'success');
            await ClassesModule.render();
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
