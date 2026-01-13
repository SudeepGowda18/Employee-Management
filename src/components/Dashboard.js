import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Users,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState({});
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = () => {
      const emps = storage.getEmployees();
      const tsks = storage.getTasks();
      setEmployees(emps);
      setTasks(tsks);
      calculateStats(emps, tsks);
    };

    loadData();
  }, []);

  const calculateStats = (emps, tsks) => {
    let totalOnboarding = 0;
    let completed = 0;
    let hrPending = 0;
    let itPending = 0;
    let adminPending = 0;
    let delayed = 0;

    emps.forEach((emp) => {
      const empTasks = tsks[emp.id];
      if (empTasks) {
        totalOnboarding++;
        let empCompleted = 0;
        let empTotal = 0;

        ['hr', 'it', 'admin'].forEach((dept) => {
          const deptTasks = empTasks[dept]?.tasks || [];
          empTotal += deptTasks.length;
          deptTasks.forEach((task) => {
            if (task.status === 'completed') {
              empCompleted++;
            } else {
              if (dept === 'hr') hrPending++;
              if (dept === 'it') itPending++;
              if (dept === 'admin') adminPending++;

              const dueDate = new Date(task.dueDate);
              if (dueDate < new Date()) {
                delayed++;
              }
            }
          });
        });

        if (empCompleted === empTotal) {
          completed++;
        }
      }
    });

    setStats({
      totalOnboarding,
      completed,
      hrPending,
      itPending,
      adminPending,
      delayed,
      completionRate: totalOnboarding > 0 ? Math.round((completed / totalOnboarding) * 100) : 0,
    });
  };

  const getDepartmentData = () => {
    const deptCount = {};
    employees.forEach((emp) => {
      deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
    });

    return Object.entries(deptCount).map(([name, value]) => ({ name, value }));
  };

  const getStatusData = () => {
    return [
      { name: 'Completed', value: stats.completed, color: 'hsl(var(--success))' },
      { name: 'In Progress', value: stats.totalOnboarding - stats.completed, color: 'hsl(var(--warning))' },
      { name: 'Delayed', value: stats.delayed, color: 'hsl(var(--destructive))' },
    ];
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatCard = ({ title, value, description, icon: Icon, trend, color = 'primary' }) => (
    <Card className="transition-all hover:shadow-md border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold font-[Manrope]">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm text-success font-medium">{trend}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}`} style={{ color: `hsl(var(--${color}))` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (user?.role === 'hr') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-[Manrope] mb-2">HR Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all onboarding activities and employee status
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Onboarding"
            value={stats.totalOnboarding || 0}
            description="Active employees"
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Completed"
            value={stats.completed || 0}
            description={`${stats.completionRate}% completion rate`}
            icon={CheckCircle}
            color="success"
            trend="+12% this week"
          />
          <StatCard
            title="Pending Tasks"
            value={(stats.hrPending || 0) + (stats.itPending || 0) + (stats.adminPending || 0)}
            description="All departments"
            icon={ClipboardList}
            color="warning"
          />
          <StatCard
            title="Delayed"
            value={stats.delayed || 0}
            description="Action required"
            icon={AlertTriangle}
            color="destructive"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-[Manrope]">Department Distribution</CardTitle>
              <CardDescription>Employee count by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getDepartmentData()}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-[Manrope]">Onboarding Status</CardTitle>
              <CardDescription>Overall progress overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStatusData().map((entry, index) => (
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-[Manrope]">Search Employees</CardTitle>
                <CardDescription>Find employees by name, email, or ID</CardDescription>
              </div>
              <Link to="/create-employee">
                <Button className="gap-2">
                  <Users className="w-4 h-4" />
                  Add Employee
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3">
              {filteredEmployees.slice(0, 5).map((emp) => {
                const empTasks = tasks[emp.id];
                let completedCount = 0;
                let totalCount = 0;

                if (empTasks) {
                  ['hr', 'it', 'admin'].forEach((dept) => {
                    const deptTasks = empTasks[dept]?.tasks || [];
                    totalCount += deptTasks.length;
                    completedCount += deptTasks.filter((t) => t.status === 'completed').length;
                  });
                }

                const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <Link key={emp.id} to={`/employees/${emp.id}`}>
                    <div className="p-4 rounded-lg border border-border/50 hover:bg-muted transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{emp.name}</h4>
                          <p className="text-sm text-muted-foreground">{emp.department} • {emp.jobRole}</p>
                        </div>
                        <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                          {progress}%
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </Link>
                );
              })}
              {filteredEmployees.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No employees found</p>
              )}
              {filteredEmployees.length > 5 && (
                <Link to="/employees">
                  <Button variant="ghost" className="w-full gap-2">
                    View All Employees <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-[Manrope] text-lg">HR Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-[Manrope] mb-2">{stats.hrPending || 0}</div>
              <p className="text-sm text-muted-foreground">Pending tasks</p>
              <Link to="/tasks?dept=hr">
                <Button variant="link" className="p-0 h-auto mt-2">
                  View Details →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-[Manrope] text-lg">IT Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-[Manrope] mb-2">{stats.itPending || 0}</div>
              <p className="text-sm text-muted-foreground">Pending tasks</p>
              <Link to="/tasks?dept=it">
                <Button variant="link" className="p-0 h-auto mt-2">
                  View Details →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-[Manrope] text-lg">Admin Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-[Manrope] mb-2">{stats.adminPending || 0}</div>
              <p className="text-sm text-muted-foreground">Pending tasks</p>
              <Link to="/tasks?dept=admin">
                <Button variant="link" className="p-0 h-auto mt-2">
                  View Details →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // IT and Admin Dashboard
  const userDept = user?.role;
  const myPendingTasks = stats[`${userDept}Pending`] || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-[Manrope] mb-2 capitalize">{userDept} Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your assigned onboarding tasks
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="My Pending Tasks"
          value={myPendingTasks}
          description="Assigned to you"
          icon={ClipboardList}
          color="primary"
        />
        <StatCard
          title="Total Employees"
          value={stats.totalOnboarding || 0}
          description="In onboarding"
          icon={Users}
          color="info"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate || 0}%`}
          description="Overall progress"
          icon={TrendingUp}
          color="success"
        />
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-[Manrope]">My Task List</CardTitle>
          <CardDescription>Tasks assigned to {userDept.toUpperCase()} department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employees.map((emp) => {
              const empTasks = tasks[emp.id];
              const myTasks = empTasks?.[userDept]?.tasks || [];
              const pendingTasks = myTasks.filter((t) => t.status !== 'completed');

              if (pendingTasks.length === 0) return null;

              return (
                <Link key={emp.id} to={`/employees/${emp.id}`}>
                  <div className="p-4 rounded-lg border border-border/50 hover:bg-muted transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{emp.name}</h4>
                        <p className="text-sm text-muted-foreground">{emp.department}</p>
                      </div>
                      <Badge variant="secondary">
                        {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {pendingTasks.slice(0, 3).map((task) => (
                        <Badge key={task.id} variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {task.title}
                        </Badge>
                      ))}
                      {pendingTasks.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pendingTasks.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
            {employees.every((emp) => {
              const myTasks = tasks[emp.id]?.[userDept]?.tasks || [];
              return myTasks.filter((t) => t.status !== 'completed').length === 0;
            }) && (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                <p className="text-muted-foreground">All tasks completed! Great job!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
