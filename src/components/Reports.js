import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState({});
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    const emps = storage.getEmployees();
    const tsks = storage.getTasks();
    setEmployees(emps);
    setTasks(tsks);
  }, []);

  const getDepartmentData = () => {
    const deptStats = {};

    employees.forEach((emp) => {
      if (!deptStats[emp.department]) {
        deptStats[emp.department] = {
          name: emp.department,
          total: 0,
          completed: 0,
          pending: 0,
        };
      }

      const empTasks = tasks[emp.id];
      if (empTasks) {
        let empCompleted = 0;
        let empTotal = 0;

        ['hr', 'it', 'admin'].forEach((dept) => {
          const deptTasks = empTasks[dept]?.tasks || [];
          empTotal += deptTasks.length;
          empCompleted += deptTasks.filter((t) => t.status === 'completed').length;
        });

        deptStats[emp.department].total += empTotal;
        deptStats[emp.department].completed += empCompleted;
        deptStats[emp.department].pending += empTotal - empCompleted;
      }
    });

    return Object.values(deptStats);
  };

  const getCompletionData = () => {
    const completionData = { completed: 0, in_progress: 0, not_started: 0 };

    employees.forEach((emp) => {
      const empTasks = tasks[emp.id];
      if (empTasks) {
        ['hr', 'it', 'admin'].forEach((dept) => {
          const deptTasks = empTasks[dept]?.tasks || [];
          deptTasks.forEach((task) => {
            completionData[task.status] = (completionData[task.status] || 0) + 1;
          });
        });
      }
    });

    return [
      { name: 'Completed', value: completionData.completed, color: 'hsl(var(--success))' },
      { name: 'In Progress', value: completionData.in_progress, color: 'hsl(var(--warning))' },
      { name: 'Not Started', value: completionData.not_started, color: 'hsl(var(--muted-foreground))' },
    ];
  };

  const getTimelineData = () => {
    const timeline = {};

    employees.forEach((emp) => {
      const month = new Date(emp.joiningDate).toLocaleString('default', { month: 'short' });
      if (!timeline[month]) {
        timeline[month] = { month, employees: 0, avgCompletion: 0 };
      }
      timeline[month].employees++;

      const empTasks = tasks[emp.id];
      if (empTasks) {
        let empTotal = 0;
        let empCompleted = 0;

        ['hr', 'it', 'admin'].forEach((dept) => {
          const deptTasks = empTasks[dept]?.tasks || [];
          empTotal += deptTasks.length;
          empCompleted += deptTasks.filter((t) => t.status === 'completed').length;
        });

        const completion = empTotal > 0 ? Math.round((empCompleted / empTotal) * 100) : 0;
        timeline[month].avgCompletion += completion;
      }
    });

    return Object.values(timeline).map((item) => ({
      ...item,
      avgCompletion: item.employees > 0 ? Math.round(item.avgCompletion / item.employees) : 0,
    }));
  };

  const getDepartmentTaskData = () => {
    const deptTasks = { hr: 0, it: 0, admin: 0 };
    const deptCompleted = { hr: 0, it: 0, admin: 0 };

    employees.forEach((emp) => {
      const empTasks = tasks[emp.id];
      if (empTasks) {
        ['hr', 'it', 'admin'].forEach((dept) => {
          const tasks = empTasks[dept]?.tasks || [];
          deptTasks[dept] += tasks.length;
          deptCompleted[dept] += tasks.filter((t) => t.status === 'completed').length;
        });
      }
    });

    return [
      {
        department: 'HR',
        total: deptTasks.hr,
        completed: deptCompleted.hr,
        pending: deptTasks.hr - deptCompleted.hr,
      },
      {
        department: 'IT',
        total: deptTasks.it,
        completed: deptCompleted.it,
        pending: deptTasks.it - deptCompleted.it,
      },
      {
        department: 'Admin',
        total: deptTasks.admin,
        completed: deptCompleted.admin,
        pending: deptTasks.admin - deptCompleted.admin,
      },
    ];
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalEmployees: employees.length,
      departmentStats: getDepartmentData(),
      completionStats: getCompletionData(),
      departmentTasks: getDepartmentTaskData(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    toast.success('Report exported successfully');
  };

  const stats = {
    totalEmployees: employees.length,
    avgCompletion: employees.length > 0
      ? Math.round(
          employees.reduce((acc, emp) => {
            const empTasks = tasks[emp.id];
            if (!empTasks) return acc;

            let total = 0;
            let completed = 0;

            ['hr', 'it', 'admin'].forEach((dept) => {
              const deptTasks = empTasks[dept]?.tasks || [];
              total += deptTasks.length;
              completed += deptTasks.filter((t) => t.status === 'completed').length;
            });

            return acc + (total > 0 ? (completed / total) * 100 : 0);
          }, 0) / employees.length
        )
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[Manrope] mb-2">Onboarding Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights on onboarding progress
          </p>
        </div>
        <Button onClick={exportReport} className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold font-[Manrope]">{stats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold font-[Manrope]">{stats.avgCompletion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date Range</p>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-[Manrope]">Department-wise Onboarding</CardTitle>
            <CardDescription>Employee distribution and task completion by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDepartmentData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="hsl(var(--success))" name="Completed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="hsl(var(--warning))" name="Pending" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-[Manrope]">Overall Completion Status</CardTitle>
            <CardDescription>Distribution of task completion across all employees</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCompletionData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCompletionData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-[Manrope]">Onboarding Timeline</CardTitle>
          <CardDescription>Average completion rate and employee count by month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTimelineData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="employees"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="New Employees"
              />
              <Line
                type="monotone"
                dataKey="avgCompletion"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                name="Avg Completion %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-[Manrope]">Department Task Summary</CardTitle>
          <CardDescription>Task completion across HR, IT, and Admin departments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getDepartmentTaskData()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="department" type="category" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="hsl(var(--success))" name="Completed" radius={[0, 8, 8, 0]} />
              <Bar dataKey="pending" fill="hsl(var(--warning))" name="Pending" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
