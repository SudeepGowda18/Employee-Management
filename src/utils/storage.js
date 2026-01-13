const STORAGE_KEYS = {
  EMPLOYEES: 'onboarding_employees',
  TASKS: 'onboarding_tasks',
  USER: 'onboarding_user',
  ACTIVITY_LOG: 'onboarding_activity_log',
  THEME: 'onboarding_theme',
};

export const storage = {
  getEmployees: () => {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
  },

  saveEmployees: (employees) => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  getTasks: () => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : {};
  },

  saveTasks: (tasks) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getUser: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getActivityLog: () => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
    return data ? JSON.parse(data) : [];
  },

  saveActivityLog: (log) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(log));
  },

  addActivity: (activity) => {
    const log = storage.getActivityLog();
    log.unshift({
      ...activity,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    });
    storage.saveActivityLog(log.slice(0, 100));
  },

  getTheme: () => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },

  saveTheme: (theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  initializeDemoData: () => {
    const existingEmployees = storage.getEmployees();
    if (existingEmployees.length === 0) {
      const demoEmployees = [
        {
          id: 'EMP001',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          department: 'Engineering',
          jobRole: 'Senior Software Engineer',
          joiningDate: '2024-01-15',
          createdAt: new Date('2024-01-10').toISOString(),
          status: 'active',
        },
        {
          id: 'EMP002',
          name: 'Michael Chen',
          email: 'michael.chen@company.com',
          department: 'Marketing',
          jobRole: 'Marketing Manager',
          joiningDate: '2024-01-20',
          createdAt: new Date('2024-01-12').toISOString(),
          status: 'active',
        },
        {
          id: 'EMP003',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@company.com',
          department: 'Sales',
          jobRole: 'Sales Executive',
          joiningDate: '2024-01-25',
          createdAt: new Date('2024-01-18').toISOString(),
          status: 'active',
        },
        {
          id: 'EMP004',
          name: 'David Park',
          email: 'david.park@company.com',
          department: 'Engineering',
          jobRole: 'DevOps Engineer',
          joiningDate: '2024-02-01',
          createdAt: new Date('2024-01-22').toISOString(),
          status: 'active',
        },
        {
          id: 'EMP005',
          name: 'Jessica Williams',
          email: 'jessica.williams@company.com',
          department: 'HR',
          jobRole: 'HR Specialist',
          joiningDate: '2024-02-05',
          createdAt: new Date('2024-01-28').toISOString(),
          status: 'active',
        },
      ];

      const demoTasks = {};
      demoEmployees.forEach((emp, index) => {
        const hrProgress = [100, 80, 60, 40, 20][index];
        const itProgress = [100, 60, 30, 0, 0][index];
        const adminProgress = [100, 40, 0, 0, 0][index];

        demoTasks[emp.id] = {
          hr: {
            tasks: [
              {
                id: 'hr-1',
                title: 'Employment Contract',
                description: 'Review and sign employment contract',
                status: hrProgress >= 25 ? 'completed' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: hrProgress >= 25 ? new Date().toISOString() : null,
                comments: [],
              },
              {
                id: 'hr-2',
                title: 'Company Policies',
                description: 'Read and acknowledge company policies',
                status: hrProgress >= 50 ? 'completed' : hrProgress >= 25 ? 'in_progress' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: hrProgress >= 50 ? new Date().toISOString() : null,
                comments: [],
              },
              {
                id: 'hr-3',
                title: 'Tax Documents',
                description: 'Submit W-4 and state tax forms',
                status: hrProgress >= 75 ? 'completed' : hrProgress >= 50 ? 'in_progress' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: hrProgress >= 75 ? new Date().toISOString() : null,
                comments: [],
              },
              {
                id: 'hr-4',
                title: 'Benefits Enrollment',
                description: 'Complete health insurance and benefits selection',
                status: hrProgress >= 100 ? 'completed' : hrProgress >= 75 ? 'in_progress' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: hrProgress >= 100 ? new Date().toISOString() : null,
                comments: [],
              },
            ],
          },
          it: {
            tasks: [
              {
                id: 'it-1',
                title: 'Email Account Setup',
                description: 'Create company email account',
                status: itProgress >= 25 ? 'completed' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: itProgress >= 25 ? new Date().toISOString() : null,
                comments: [],
              },
              {
                id: 'it-2',
                title: 'Laptop Assignment',
                description: 'Assign and configure laptop',
                status: itProgress >= 50 ? 'completed' : itProgress >= 25 ? 'in_progress' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: itProgress >= 50 ? new Date().toISOString() : null,
                comments: [],
              },
              {
                id: 'it-3',
                title: 'Software Access',
                description: 'Grant access to required software and tools',
                status: itProgress >= 75 ? 'completed' : itProgress >= 50 ? 'in_progress' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: itProgress >= 75 ? new Date().toISOString() : null,
                comments: [],
              },
              {
                id: 'it-4',
                title: 'VPN & Security Setup',
                description: 'Configure VPN and security credentials',
                status: itProgress >= 100 ? 'completed' : itProgress >= 75 ? 'in_progress' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: itProgress >= 100 ? new Date().toISOString() : null,
                comments: [],
              },
            ],
          },
          admin: {
            tasks: [
              {
                id: 'admin-1',
                title: 'ID Card Creation',
                description: 'Create employee ID card',
                status: adminProgress >= 33 ? 'completed' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: adminProgress >= 33 ? new Date().toISOString() : null,
                comments: [],
              },
              {
                id: 'admin-2',
                title: 'Desk Assignment',
                description: 'Assign desk and seating arrangement',
                status: adminProgress >= 66 ? 'completed' : adminProgress >= 33 ? 'in_progress' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: adminProgress >= 66 ? new Date().toISOString() : null,
                comments: [],
              },
              {
                id: 'admin-3',
                title: 'Office Supplies',
                description: 'Provide office supplies and equipment',
                status: adminProgress >= 100 ? 'completed' : adminProgress >= 66 ? 'in_progress' : 'not_started',
                dueDate: new Date(emp.joiningDate).toISOString(),
                completedAt: adminProgress >= 100 ? new Date().toISOString() : null,
                comments: [],
              },
            ],
          },
        };
      });

      storage.saveEmployees(demoEmployees);
      storage.saveTasks(demoTasks);
    }
  },
};
