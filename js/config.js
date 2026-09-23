/**
 * Class Manager — Application Configuration & Local Seed Data
 */

const CONFIG = {
  APP_NAME: 'Class Manager',
  APP_SUBTITLE: 'កម្មវិធីគ្រប់គ្រងថ្នាក់រៀន',
  VERSION: '1.0.0',
  STORAGE_KEYS: {
    API_URL: 'cm_gas_api_url',
    THEME: 'cm_theme_preference',
    LOCAL_DATA: 'cm_mock_database'
  },
  DEFAULT_API_URL: '', // Set by user in More -> Settings
  
  getApiUrl() {
    return localStorage.getItem(this.STORAGE_KEYS.API_URL) || this.DEFAULT_API_URL;
  },

  setApiUrl(url) {
    if (url) {
      localStorage.setItem(this.STORAGE_KEYS.API_URL, url.trim());
    } else {
      localStorage.removeItem(this.STORAGE_KEYS.API_URL);
    }
  },

  getTheme() {
    return localStorage.getItem(this.STORAGE_KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(this.STORAGE_KEYS.THEME, theme);
  },

  // Initial Cambodian school sample data used when Google Apps Script is not yet linked
  INITIAL_SEED: {
    classes: [
      {
        ClassID: 'CLS-001',
        ClassName: 'ថ្នាក់ទី១០ A ( Grade 10 A )',
        TeacherName: 'លោកគ្រូ ចាន់ សុផល',
        Room: 'បន្ទប់ 101',
        Schedule: 'ចន្ទ - សុក្រ ( 07:00 - 11:00 )',
        StartDate: '2026-01-05',
        EndDate: '2026-11-30',
        Status: 'សកម្ម',
        Note: 'ថ្នាក់វិទ្យាសាស្ត្រពិត',
        studentCount: 3
      },
      {
        ClassID: 'CLS-002',
        ClassName: 'ភាសាអង់គ្លេស Beginner',
        TeacherName: 'អ្នកគ្រូ កែវ មុនី',
        Room: 'បន្ទប់ 204',
        Schedule: 'ចន្ទ - សុក្រ ( 14:00 - 16:00 )',
        StartDate: '2026-02-01',
        EndDate: '2026-12-15',
        Status: 'សកម្ម',
        Note: 'វគ្គសិក្សាភាសាអង់គ្លេសមូលដ្ឋាន',
        studentCount: 2
      }
    ],
    students: [
      {
        StudentID: 'STU-0001',
        StudentName: 'សុខ ដារ៉ា (Sok Dara)',
        Gender: 'ប្រុស',
        DateOfBirth: '2008-04-12',
        Phone: '012 345 678',
        ParentName: 'សុខ សាន',
        ParentPhone: '012 999 888',
        Address: 'ខណ្ឌទួលគោក, ភ្នំពេញ',
        ClassID: 'CLS-001',
        ClassName: 'ថ្នាក់ទី១០ A ( Grade 10 A )',
        RegisterDate: '2026-01-05',
        Status: 'សកម្ម',
        PhotoURL: '',
        Note: 'សិស្សពូកែគណិតវិទ្យា'
      },
      {
        StudentID: 'STU-0002',
        StudentName: 'ចាន់ បុប្ផា (Chan Bopha)',
        Gender: 'ស្រី',
        DateOfBirth: '2008-07-20',
        Phone: '098 765 432',
        ParentName: 'ចាន់ ពិសិដ្ឋ',
        ParentPhone: '098 111 222',
        Address: 'ខណ្ឌដូនពេញ, ភ្នំពេញ',
        ClassID: 'CLS-001',
        ClassName: 'ថ្នាក់ទី១០ A ( Grade 10 A )',
        RegisterDate: '2026-01-05',
        Status: 'សកម្ម',
        PhotoURL: '',
        Note: 'ឧស្សាហ៍ព្យាយាម'
      },
      {
        StudentID: 'STU-0003',
        StudentName: 'កែវ ពេជ្រ (Keo Pich)',
        Gender: 'ប្រុស',
        DateOfBirth: '2008-09-15',
        Phone: '077 112 233',
        ParentName: 'កែវ វិបុល',
        ParentPhone: '077 445 566',
        Address: 'ក្រុងតាខ្មៅ, កណ្តាល',
        ClassID: 'CLS-001',
        ClassName: 'ថ្នាក់ទី១០ A ( Grade 10 A )',
        RegisterDate: '2026-01-06',
        Status: 'សកម្ម',
        PhotoURL: '',
        Note: 'សិស្សឆ្លាត និងរួសរាយ'
      },
      {
        StudentID: 'STU-0004',
        StudentName: 'ហេង សុវណ្ណ (Heng Sovan)',
        Gender: 'ប្រុស',
        DateOfBirth: '2009-02-10',
        Phone: '015 889 900',
        ParentName: 'ហេង វុទ្ធី',
        ParentPhone: '015 334 455',
        Address: 'ខណ្ឌចំការមន, ភ្នំពេញ',
        ClassID: 'CLS-002',
        ClassName: 'ភាសាអង់គ្លេស Beginner',
        RegisterDate: '2026-02-01',
        Status: 'សកម្ម',
        PhotoURL: '',
        Note: 'រៀនពូកែបញ្ចេញសម្លេង'
      },
      {
        StudentID: 'STU-0005',
        StudentName: 'ញ៉ែម រតនា (Nhem Rathana)',
        Gender: 'ស្រី',
        DateOfBirth: '2009-06-25',
        Phone: '089 556 677',
        ParentName: 'ញ៉ែម សុខា',
        ParentPhone: '089 778 899',
        Address: 'ខណ្ឌសែនសុខ, ភ្នំពេញ',
        ClassID: 'CLS-002',
        ClassName: 'ភាសាអង់គ្លេស Beginner',
        RegisterDate: '2026-02-02',
        Status: 'សកម្ម',
        PhotoURL: '',
        Note: 'សិស្សផ្ទេរមកពីសាលាខេត្ត'
      }
    ],
    attendance: [
      {
        AttendanceID: 'ATT-20260923-STU-0001',
        Date: '2026-09-23',
        StudentID: 'STU-0001',
        StudentName: 'សុខ ដារ៉ា (Sok Dara)',
        ClassID: 'CLS-001',
        ClassName: 'ថ្នាក់ទី១០ A ( Grade 10 A )',
        Status: 'Present',
        CheckInTime: '06:55',
        Note: 'មកទាន់ពេល'
      },
      {
        AttendanceID: 'ATT-20260923-STU-0002',
        Date: '2026-09-23',
        StudentID: 'STU-0002',
        StudentName: 'ចាន់ បុប្ផា (Chan Bopha)',
        ClassID: 'CLS-001',
        ClassName: 'ថ្នាក់ទី១០ A ( Grade 10 A )',
        Status: 'Present',
        CheckInTime: '07:00',
        Note: ''
      },
      {
        AttendanceID: 'ATT-20260923-STU-0003',
        Date: '2026-09-23',
        StudentID: 'STU-0003',
        StudentName: 'កែវ ពេជ្រ (Keo Pich)',
        ClassID: 'CLS-001',
        ClassName: 'ថ្នាក់ទី១០ A ( Grade 10 A )',
        Status: 'Late',
        CheckInTime: '07:20',
        Note: 'យឺតដោយសារស្ទះចរាចរណ៍'
      },
      {
        AttendanceID: 'ATT-20260923-STU-0004',
        Date: '2026-09-23',
        StudentID: 'STU-0004',
        StudentName: 'ហេង សុវណ្ណ (Heng Sovan)',
        ClassID: 'CLS-002',
        ClassName: 'ភាសាអង់គ្លេស Beginner',
        Status: 'Permission',
        CheckInTime: '',
        Note: 'សុំច្បាប់គ្រួសារ'
      },
      {
        AttendanceID: 'ATT-20260923-STU-0005',
        Date: '2026-09-23',
        StudentID: 'STU-0005',
        StudentName: 'ញ៉ែម រតនា (Nhem Rathana)',
        ClassID: 'CLS-002',
        ClassName: 'ភាសាអង់គ្លេស Beginner',
        Status: 'Absent',
        CheckInTime: '',
        Note: 'គ្មានដំណឹង'
      }
    ],
    payments: [
      {
        PaymentID: 'PAY-000001',
        PaymentDate: '2026-09-23',
        StudentID: 'STU-0001',
        StudentName: 'សុខ ដារ៉ា (Sok Dara)',
        ClassID: 'CLS-001',
        ClassName: 'ថ្នាក់ទី១០ A ( Grade 10 A )',
        Amount: '120,000៛',
        Month: '09/2026',
        PaymentType: 'Tuition Fee',
        Note: 'បង់ថ្លៃសិក្សាប្រចាំខែ'
      },
      {
        PaymentID: 'PAY-000002',
        PaymentDate: '2026-09-23',
        StudentID: 'STU-0002',
        StudentName: 'ចាន់ បុប្ផា (Chan Bopha)',
        ClassID: 'CLS-001',
        ClassName: 'ថ្នាក់ទី១០ A ( Grade 10 A )',
        Amount: '120,000៛',
        Month: '09/2026',
        PaymentType: 'Tuition Fee',
        Note: 'បង់ថ្លៃសិក្សាប្រចាំខែ'
      },
      {
        PaymentID: 'PAY-000003',
        PaymentDate: '2026-09-23',
        StudentID: 'STU-0003',
        StudentName: 'កែវ ពេជ្រ (Keo Pich)',
        ClassID: 'CLS-001',
        ClassName: 'ថ្នាក់ទី១០ A ( Grade 10 A )',
        Amount: '40,000៛',
        Month: '09/2026',
        PaymentType: 'Registration Fee',
        Note: 'បង់ថ្លៃចុះឈ្មោះ'
      },
      {
        PaymentID: 'PAY-000004',
        PaymentDate: '2026-09-23',
        StudentID: 'STU-0004',
        StudentName: 'ហេង សុវណ្ណ (Heng Sovan)',
        ClassID: 'CLS-002',
        ClassName: 'ភាសាអង់គ្លេស Beginner',
        Amount: '100,000៛',
        Month: '09/2026',
        PaymentType: 'Tuition Fee',
        Note: 'បង់ពេញ'
      },
      {
        PaymentID: 'PAY-000005',
        PaymentDate: '2026-09-23',
        StudentID: 'STU-0005',
        StudentName: 'ញ៉ែម រតនា (Nhem Rathana)',
        ClassID: 'CLS-002',
        ClassName: 'ភាសាអង់គ្លេស Beginner',
        Amount: '100,000៛',
        Month: '09/2026',
        PaymentType: 'Tuition Fee',
        Note: 'បង់ពេញ'
      }
    ]
  }
};
