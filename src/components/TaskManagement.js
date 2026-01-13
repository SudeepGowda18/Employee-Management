import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ClipboardList, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TaskManagement = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialDept = searchParams.get('dept') || (user.role === 'hr' ? 'all' : user.role);
  
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState({});
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const emps = storage.getEmployees();
    const tsks = storage.getTasks();
    setEmployees(emps);
    setTasks(tsks);
  }, []);

  const getAllTasks = () => {
    const allTasks = [];
    
    employees.forEach((emp) => {
      const empTasks = tasks[emp.id];
      if (!empTasks) return;

      const departments = selectedDept === 'all' ? ['hr', 'it', 'admin'] : [selectedDept];
      
      departments.forEach((dept) => {
        const deptTasks = empTasks[dept]?.tasks || [];
        deptTasks.forEach((task) => {
          if (statusFilter === 'all' || task.status === statusFilter) {
            if (!searchQuery || 
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.name.toLowerCase().includes(searchQuery.toLowerCase())) {
              allTasks.push({
                ...task,
                employee: emp,
                department: dept,
              });
            }
          }
        });
      });
    });

    return allTasks;
  };

  const groupedTasks = getAllTasks().reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-warning" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const TaskCard = ({ task }) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

    return (
      <Card className="border-border/50 hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{task.title}</h4>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">Overdue</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
              <Link to={`/employees/${task.employee.id}`} className="text-sm text-primary hover:underline">
                {task.employee.name} • {task.employee.department}
              </Link>
            </div>
            {getStatusIcon(task.status)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                {task.department}
              </Badge>
              {getStatusBadge(task.status)}
            </div>
            <span className="text-xs text-muted-foreground">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const stats = {
    total: getAllTasks().length,
    completed: groupedTasks.completed?.length || 0,
    in_progress: groupedTasks.in_progress?.length || 0,
    not_started: groupedTasks.not_started?.length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-[Manrope] mb-2">Task Management</h1>
        <p className="text-muted-foreground">
          View and manage onboarding tasks across all departments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold font-[Manrope]">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold font-[Manrope]">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold font-[Manrope]">{stats.in_progress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Not Started</p>
                <p className="text-2xl font-bold font-[Manrope]">{stats.not_started}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="font-[Manrope]">All Tasks</CardTitle>
            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-[200px]"
                />
              </div>

              {user.role === 'hr' && (
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="w-full md:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="not_started" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="not_started">
                Not Started ({groupedTasks.not_started?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress ({groupedTasks.in_progress?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({groupedTasks.completed?.length || 0})
              </TabsTrigger>
            </TabsList>

            {['not_started', 'in_progress', 'completed'].map((status) => (
              <TabsContent key={status} value={status} className="space-y-3">
                {groupedTasks[status]?.length > 0 ? (
                  groupedTasks[status].map((task, idx) => (
                    <TaskCard key={`${task.employee.id}-${task.department}-${task.id}`} task={task} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No tasks in this category</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
