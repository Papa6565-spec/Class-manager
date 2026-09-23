/**
 * Class Manager — API Client & Local Fallback Engine
 * Handles Google Apps Script Web App communications, CORS, and offline fallback.
 */

const API = {
  /**
   * Initializes local mock storage if not already present
   */
  initLocalStorage() {
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.LOCAL_DATA)) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.LOCAL_DATA, JSON.stringify(CONFIG.INITIAL_SEED));
    }
  },

  getLocalDb() {
    this.initLocalStorage();
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.LOCAL_DATA)) || CONFIG.INITIAL_SEED;
    } catch (e) {
      return CONFIG.INITIAL_SEED;
    }
  },

  saveLocalDb(db) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.LOCAL_DATA, JSON.stringify(db));
  },

  isConfigured() {
    const url = CONFIG.getApiUrl();
    return !!(url && url.startsWith('http'));
  },

  /**
   * Makes an HTTP request to Google Apps Script Web App
   */
  async request(action, method = 'GET', data = null) {
    const apiUrl = CONFIG.getApiUrl();

    // If online check
    if (!navigator.onLine && method === 'POST') {
      return {
        success: false,
        message: '🔴 គ្មានការតភ្ជាប់អ៊ីនធឺណិត — សូមភ្ជាប់អ៊ីនធឺណិតមុនពេលរក្សាទុកទៅ Google Sheets'
      };
    }

    // If live API URL is set, call Google Apps Script Web App
    if (this.isConfigured()) {
      try {
        let url = apiUrl;
        const options = {
          method: method,
          redirect: 'follow'
        };

        if (method === 'GET') {
          const params = new URLSearchParams();
          params.append('action', action);
          if (data) {
            Object.keys(data).forEach(key => {
              if (data[key] !== undefined && data[key] !== null) {
                params.append(key, data[key]);
              }
            });
          }
          url += (url.includes('?') ? '&' : '?') + params.toString();
        } else {
          // Sending as text/plain avoids CORS OPTIONS preflight that Google Apps Script does not support
          options.headers = {
            'Content-Type': 'text/plain;charset=utf-8'
          };
          options.body = JSON.stringify({
            action: action,
            data: data
          });
        }

        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }

        const json = await response.json();
        return json;
      } catch (err) {
        console.warn('[API] Remote request failed, falling back to local simulation:', err);
        // If remote fails, notify user with error message
        return {
          success: false,
          message: '❌ បរាជ័យក្នុងការតភ្ជាប់ទៅ Google Sheets: ' + (err.message || 'សូមពិនិត្យមើល Web App URL')
        };
      }
    }

    // Fallback: Local Simulation Engine (Runs instantly for testing)
    return this.simulateLocal(action, method, data);
  },

  /**
   * Local Simulation of Google Apps Script logic for immediate testing
   */
  simulateLocal(action, method, data) {
    const db = this.getLocalDb();

    switch (action) {
      case 'ping':
        return { success: true, message: 'Class Manager Local Mock Engine is active' };

      case 'getDashboard': {
        const today = new Date().toISOString().split('T')[0];
        let todayPresent = 0, todayAbsent = 0, todayLate = 0, todayPermission = 0;
        (db.attendance || []).forEach(att => {
          if (att.Date === today) {
            const st = (att.Status || '').toLowerCase();
            if (st === 'present') todayPresent++;
            else if (st === 'absent') todayAbsent++;
            else if (st === 'late') todayLate++;
            else if (st === 'permission') todayPermission++;
          }
        });

        let todayRiel = 0, todayUSD = 0;
        (db.payments || []).forEach(p => {
          if (p.PaymentDate === today) {
            const raw = String(p.Amount || '');
            const val = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
            if (raw.includes('$')) todayUSD += val;
            else todayRiel += val;
          }
        });

        return {
          success: true,
          data: {
            todayDate: today,
            totalStudents: (db.students || []).length,
            totalClasses: (db.classes || []).length,
            todayPresent: todayPresent,
            todayAbsent: todayAbsent,
            todayLate: todayLate,
            todayPermission: todayPermission,
            todayRevenueRiel: todayRiel,
            todayRevenueUSD: todayUSD,
            todayFormattedRevenue: todayRiel.toLocaleString() + ' ៛' + (todayUSD > 0 ? ` + $${todayUSD.toFixed(2)}` : ''),
            recentStudents: (db.students || []).slice(-5).reverse(),
            recentPayments: (db.payments || []).slice(-5).reverse()
          }
        };
      }

      case 'getStudents': {
        let students = [...(db.students || [])];
        if (data && data.q) {
          const q = data.q.toLowerCase().trim();
          students = students.filter(s =>
            (s.StudentName || '').toLowerCase().includes(q) ||
            (s.StudentID || '').toLowerCase().includes(q) ||
            (s.Phone || '').toLowerCase().includes(q) ||
            (s.ClassName || '').toLowerCase().includes(q)
          );
        }
        if (data && data.classId) {
          students = students.filter(s => s.ClassID === data.classId);
        }
        return { success: true, data: students };
      }

      case 'getStudentById': {
        const id = data && (data.id || data.studentId);
        const s = (db.students || []).find(x => x.StudentID === id);
        return s ? { success: true, data: s } : { success: false, message: 'រកមិនឃើញសិស្ស ID: ' + id };
      }

      case 'addStudent': {
        if (!data.StudentName || !data.ClassID) {
          return { success: false, message: 'សូមបញ្ចូលឈ្មោះសិស្ស និងជ្រើសរើសថ្នាក់រៀន' };
        }
        let maxNum = 0;
        (db.students || []).forEach(s => {
          const match = (s.StudentID || '').match(/STU-(\d+)/i);
          if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
        });
        const studentId = 'STU-' + String(maxNum + 1).padStart(4, '0');
        const cls = (db.classes || []).find(c => c.ClassID === data.ClassID);
        const newStu = {
          StudentID: studentId,
          StudentName: data.StudentName.trim(),
          Gender: data.Gender || 'ប្រុស',
          DateOfBirth: data.DateOfBirth || '',
          Phone: data.Phone || '',
          ParentName: data.ParentName || '',
          ParentPhone: data.ParentPhone || '',
          Address: data.Address || '',
          ClassID: data.ClassID,
          ClassName: cls ? cls.ClassName : (data.ClassName || ''),
          RegisterDate: data.RegisterDate || new Date().toISOString().split('T')[0],
          Status: data.Status || 'សកម្ម',
          PhotoURL: data.PhotoURL || '',
          Note: data.Note || ''
        };
        db.students.push(newStu);
        this.saveLocalDb(db);
        return { success: true, message: 'ចុះឈ្មោះសិស្សបានជោគជ័យ', data: newStu };
      }

      case 'updateStudent': {
        const idx = (db.students || []).findIndex(s => s.StudentID === data.StudentID);
        if (idx === -1) return { success: false, message: 'រកមិនឃើញសិស្ស' };
        const cls = (db.classes || []).find(c => c.ClassID === data.ClassID);
        db.students[idx] = {
          ...db.students[idx],
          ...data,
          ClassName: cls ? cls.ClassName : (data.ClassName || db.students[idx].ClassName)
        };
        this.saveLocalDb(db);
        return { success: true, message: 'កែប្រែព័ត៌មានសិស្សបានជោគជ័យ', data: db.students[idx] };
      }

      case 'deleteStudent': {
        const id = data && (data.id || data.studentId);
        db.students = (db.students || []).filter(s => s.StudentID !== id);
        this.saveLocalDb(db);
        return { success: true, message: 'លុបសិស្សបានជោគជ័យ' };
      }

      case 'getClasses': {
        const countMap = {};
        (db.students || []).forEach(s => {
          if (s.ClassID) countMap[s.ClassID] = (countMap[s.ClassID] || 0) + 1;
        });
        const classes = (db.classes || []).map(c => ({
          ...c,
          studentCount: countMap[c.ClassID] || 0
        }));
        return { success: true, data: classes };
      }

      case 'addClass': {
        if (!data.ClassName) return { success: false, message: 'សូមបញ្ចូលឈ្មោះថ្នាក់រៀន' };
        let maxNum = 0;
        (db.classes || []).forEach(c => {
          const match = (c.ClassID || '').match(/CLS-(\d+)/i);
          if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
        });
        const classId = 'CLS-' + String(maxNum + 1).padStart(3, '0');
        const newClass = {
          ClassID: classId,
          ClassName: data.ClassName.trim(),
          TeacherName: data.TeacherName || '',
          Room: data.Room || '',
          Schedule: data.Schedule || '',
          StartDate: data.StartDate || '',
          EndDate: data.EndDate || '',
          Status: data.Status || 'សកម្ម',
          Note: data.Note || '',
          studentCount: 0
        };
        db.classes.push(newClass);
        this.saveLocalDb(db);
        return { success: true, message: 'បន្ថែមថ្នាក់រៀនបានជោគជ័យ', data: newClass };
      }

      case 'updateClass': {
        const idx = (db.classes || []).findIndex(c => c.ClassID === data.ClassID);
        if (idx === -1) return { success: false, message: 'រកមិនឃើញថ្នាក់' };
        db.classes[idx] = { ...db.classes[idx], ...data };
        // Update class name in students
        (db.students || []).forEach(s => {
          if (s.ClassID === data.ClassID) s.ClassName = data.ClassName;
        });
        this.saveLocalDb(db);
        return { success: true, message: 'កែប្រែថ្នាក់រៀនបានជោគជ័យ', data: db.classes[idx] };
      }

      case 'deleteClass': {
        const id = data && (data.id || data.classId);
        db.classes = (db.classes || []).filter(c => c.ClassID !== id);
        this.saveLocalDb(db);
        return { success: true, message: 'លុបថ្នាក់រៀនបានជោគជ័យ' };
      }

      case 'getAttendance': {
        const date = (data && data.date) || new Date().toISOString().split('T')[0];
        const classId = data && data.classId;
        const students = (db.students || []).filter(s => !classId || s.ClassID === classId);
        const existingMap = {};
        (db.attendance || []).forEach(a => {
          if (a.Date === date && (!classId || a.ClassID === classId)) {
            existingMap[a.StudentID] = a;
          }
        });

        const roster = students.map(s => {
          const ex = existingMap[s.StudentID];
          return {
            AttendanceID: ex ? ex.AttendanceID : `ATT-${date.replace(/-/g, '')}-${s.StudentID}`,
            Date: date,
            StudentID: s.StudentID,
            StudentName: s.StudentName,
            ClassID: s.ClassID,
            ClassName: s.ClassName,
            Status: ex ? ex.Status : 'Present',
            CheckInTime: ex ? ex.CheckInTime : '07:00',
            Note: ex ? ex.Note : ''
          };
        });

        return {
          success: true,
          data: { date: date, classId: classId, roster: roster }
        };
      }

      case 'saveAttendance': {
        if (!data || !data.records || !data.records.length) {
          return { success: false, message: 'គ្មានទិន្នន័យវត្តមានសម្រាប់រក្សាទុក' };
        }
        const date = data.date || new Date().toISOString().split('T')[0];
        if (!db.attendance) db.attendance = [];

        data.records.forEach(rec => {
          const idx = db.attendance.findIndex(a => a.Date === date && a.StudentID === rec.StudentID);
          const attObj = {
            AttendanceID: rec.AttendanceID || `ATT-${date.replace(/-/g, '')}-${rec.StudentID}`,
            Date: date,
            StudentID: rec.StudentID,
            StudentName: rec.StudentName || '',
            ClassID: rec.ClassID || '',
            ClassName: rec.ClassName || '',
            Status: rec.Status || 'Present',
            CheckInTime: rec.CheckInTime || '',
            Note: rec.Note || ''
          };
          if (idx !== -1) {
            db.attendance[idx] = attObj;
          } else {
            db.attendance.push(attObj);
          }
        });
        this.saveLocalDb(db);
        return { success: true, message: 'រក្សាទុកវត្តមានបានជោគជ័យ' };
      }

      case 'getAttendanceSummary': {
        const records = db.attendance || [];
        const classId = data && data.classId;
        const studentId = data && data.studentId;
        const fromDate = data && data.fromDate;
        const toDate = data && data.toDate;

        const filtered = records.filter(r => {
          if (classId && r.ClassID !== classId) return false;
          if (studentId && r.StudentID !== studentId) return false;
          if (fromDate && r.Date < fromDate) return false;
          if (toDate && r.Date > toDate) return false;
          return true;
        });

        const map = {};
        filtered.forEach(r => {
          if (!map[r.StudentID]) {
            map[r.StudentID] = {
              StudentID: r.StudentID,
              StudentName: r.StudentName,
              ClassName: r.ClassName,
              Present: 0,
              Absent: 0,
              Late: 0,
              Permission: 0,
              TotalDays: 0
            };
          }
          const s = map[r.StudentID];
          s.TotalDays++;
          const st = (r.Status || '').toLowerCase();
          if (st === 'present') s.Present++;
          else if (st === 'absent') s.Absent++;
          else if (st === 'late') s.Late++;
          else if (st === 'permission') s.Permission++;
          else s.Present++;
        });

        const students = Object.values(map).map(item => {
          const eff = item.Present + (item.Late * 0.75) + (item.Permission * 0.5);
          item.AttendancePercentage = item.TotalDays > 0 ? Math.round((eff / item.TotalDays) * 100) : 0;
          return item;
        });

        return {
          success: true,
          data: { totalRecords: filtered.length, students: students }
        };
      }

      case 'getPayments': {
        let payments = [...(db.payments || [])];
        if (data && data.studentId) payments = payments.filter(p => p.StudentID === data.studentId);
        if (data && data.classId) payments = payments.filter(p => p.ClassID === data.classId);
        if (data && data.month) payments = payments.filter(p => p.Month === data.month);
        if (data && data.date) payments = payments.filter(p => p.PaymentDate === data.date);
        if (data && data.q) {
          const q = data.q.toLowerCase().trim();
          payments = payments.filter(p =>
            (p.StudentName || '').toLowerCase().includes(q) ||
            (p.StudentID || '').toLowerCase().includes(q) ||
            (p.PaymentID || '').toLowerCase().includes(q) ||
            (p.PaymentType || '').toLowerCase().includes(q)
          );
        }

        let totalRiel = 0, totalUSD = 0;
        payments.forEach(p => {
          const raw = String(p.Amount || '');
          const val = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
          if (raw.includes('$')) totalUSD += val;
          else totalRiel += val;
        });

        return {
          success: true,
          data: {
            totalCount: payments.length,
            totalRiel: totalRiel,
            totalUSD: totalUSD,
            formattedTotal: totalRiel.toLocaleString() + ' ៛' + (totalUSD > 0 ? ` + $${totalUSD.toFixed(2)}` : ''),
            payments: payments.reverse()
          }
        };
      }

      case 'savePayment': {
        if (!data || !data.StudentID || !data.Amount) {
          return { success: false, message: 'សូមជ្រើសរើសសិស្ស និងបញ្ចូលចំនួនទឹកប្រាក់ដែលបានបង់' };
        }
        if (!db.payments) db.payments = [];
        let maxNum = 0;
        db.payments.forEach(p => {
          const match = (p.PaymentID || '').match(/PAY-(\d+)/i);
          if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
        });
        const payId = 'PAY-' + String(maxNum + 1).padStart(6, '0');
        const stu = (db.students || []).find(s => s.StudentID === data.StudentID);
        const newPay = {
          PaymentID: payId,
          PaymentDate: data.PaymentDate || new Date().toISOString().split('T')[0],
          StudentID: data.StudentID,
          StudentName: stu ? stu.StudentName : (data.StudentName || ''),
          ClassID: stu ? stu.ClassID : (data.ClassID || ''),
          ClassName: stu ? stu.ClassName : (data.ClassName || ''),
          Amount: String(data.Amount).trim(),
          Month: data.Month || '',
          PaymentType: data.PaymentType || 'Tuition Fee',
          Note: data.Note || ''
        };
        db.payments.push(newPay);
        this.saveLocalDb(db);
        return { success: true, message: 'កត់ត្រាការបង់ប្រាក់បានជោគជ័យ', data: newPay };
      }

      case 'getStudentProfile': {
        const studentId = data && (data.id || data.studentId);
        const stu = (db.students || []).find(s => s.StudentID === studentId);
        if (!stu) return { success: false, message: 'រកមិនឃើញសិស្ស' };

        const att = (db.attendance || []).filter(a => a.StudentID === studentId);
        let present = 0, absent = 0, late = 0, perm = 0;
        att.forEach(a => {
          const st = (a.Status || '').toLowerCase();
          if (st === 'present') present++;
          else if (st === 'absent') absent++;
          else if (st === 'late') late++;
          else if (st === 'permission') perm++;
        });
        const totalDays = att.length;
        const eff = present + (late * 0.75) + (perm * 0.5);
        const rate = totalDays > 0 ? Math.round((eff / totalDays) * 100) : 100;

        const pays = (db.payments || []).filter(p => p.StudentID === studentId);
        let totalRiel = 0, totalUSD = 0;
        pays.forEach(p => {
          const raw = String(p.Amount || '');
          const val = parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
          if (raw.includes('$')) totalUSD += val;
          else totalRiel += val;
        });

        return {
          success: true,
          data: {
            student: stu,
            attendance: {
              totalDays: totalDays,
              present: present,
              absent: absent,
              late: late,
              permission: perm,
              rate: rate,
              records: att.slice(-10).reverse()
            },
            payments: {
              totalRiel: totalRiel,
              totalUSD: totalUSD,
              formattedTotal: totalRiel.toLocaleString() + ' ៛' + (totalUSD > 0 ? ` + $${totalUSD.toFixed(2)}` : ''),
              records: pays.reverse()
            }
          }
        };
      }

      default:
        return { success: false, message: 'Unknown local action: ' + action };
    }
  },

  /**
   * Tests connection to a given Google Apps Script Web App URL
   */
  async testConnection(testUrl) {
    try {
      const url = (testUrl || CONFIG.getApiUrl()).trim();
      if (!url) return { success: false, message: 'សូមបញ្ចូល Google Apps Script Web App URL' };

      const pingUrl = url + (url.includes('?') ? '&' : '?') + 'action=ping';
      const res = await fetch(pingUrl, { method: 'GET', redirect: 'follow' });
      const data = await res.json();
      if (data && data.success) {
        return { success: true, message: '✅ ភ្ជាប់ទៅ Google Sheets API បានជោគជ័យ!' };
      }
      return { success: false, message: '❌ ទទួលបានការឆ្លើយតបមិនត្រឹមត្រូវ: ' + JSON.stringify(data) };
    } catch (err) {
      return { success: false, message: '❌ មិនអាចភ្ជាប់បានទេ: ' + err.message };
    }
  }
};

// Initialize local DB on first script load
API.initLocalStorage();
