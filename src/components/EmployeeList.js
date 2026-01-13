import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../utils/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Search, Download, Filter, ArrowUpDown, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const emps = storage.getEmployees();
    const tsks = storage.getTasks();
    setEmployees(emps);
    setTasks(tsks);
  }, []);

  const calculateEmployeeProgress = (empId) => {
    const empTasks = tasks[empId];
    if (!empTasks) return { overall: 0, hr: 0, it: 0, admin: 0 };

    let totalTasks = 0;
    let completedTasks = 0;
    const deptProgress = {};

    ['hr', 'it', 'admin'].forEach((dept) => {
      const deptTasks = empTasks[dept]?.tasks || [];
      const deptCompleted = deptTasks.filter((t) => t.status === 'completed').length;
      
      totalTasks += deptTasks.length;
      completedTasks += deptCompleted;
      deptProgress[dept] = deptTasks.length > 0 ? Math.round((deptCompleted / deptTasks.length) * 100) : 0;
    });

    return {
      overall: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      ...deptProgress,
    };
  };

  const filteredEmployees = employees
    .filter((emp) => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = filterDept === 'all' || emp.department === filterDept;
      
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'department') return a.department.localeCompare(b.department);
      if (sortBy === 'joiningDate') return new Date(b.joiningDate) - new Date(a.joiningDate);
      if (sortBy === 'progress') {
        const progressA = calculateEmployeeProgress(a.id).overall;
        const progressB = calculateEmployeeProgress(b.id).overall;
        return progressB - progressA;
      }
      return 0;
    });

  const departments = ['all', ...new Set(employees.map((e) => e.department))];

  const exportToCSV = () => {
    const csvData = filteredEmployees.map((emp) => {
      const progress = calculateEmployeeProgress(emp.id);
      return {
        'Employee ID': emp.id,
        'Name': emp.name,
        'Email': emp.email,
        'Department': emp.department,
        'Job Role': emp.jobRole,
        'Joining Date': new Date(emp.joiningDate).toLocaleDateString(),
        'HR Progress': `${progress.hr}%`,
        'IT Progress': `${progress.it}%`,
        'Admin Progress': `${progress.admin}%`,
        'Overall Progress': `${progress.overall}%`,
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map((row) => headers.map((header) => `"${row[header]}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast.success('Employee list exported to CSV');
  };

  const getStatusBadge = (progress) => {
    if (progress === 100) return <Badge className="bg-success text-success-foreground">Complete</Badge>;
    if (progress >= 50) return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
    return <Badge variant="secondary">Started</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[Manrope] mb-2">All Employees</h1>
          <p className="text-muted-foreground">
            Manage and track onboarding status for all employees
          </p>
        </div>
        <Link to="/create-employee">
          <Button className="gap-2">
            Add Employee
          </Button>
        </Link>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, ID, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 max-w-md"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={filterDept} onValueChange={setFilterDept}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept} className="capitalize">
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="department">Sort by Department</SelectItem>
                  <SelectItem value="joiningDate">Sort by Date</SelectItem>
                  <SelectItem value="progress">Sort by Progress</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={exportToCSV} className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">HR</TableHead>
                  <TableHead className="text-center">IT</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">Overall</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => {
                    const progress = calculateEmployeeProgress(emp.id);
                    return (
                      <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium">{emp.name}</p>
                            <p className="text-sm text-muted-foreground">{emp.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{emp.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium">{progress.hr}%</span>
                            <Progress value={progress.hr} className="h-1.5 w-12" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium">{progress.it}%</span>
                            <Progress value={progress.it} className="h-1.5 w-12" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium">{progress.admin}%</span>
                            <Progress value={progress.admin} className="h-1.5 w-12" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-lg font-bold font-[Manrope]">{progress.overall}%</span>
                            <Progress value={progress.overall} className="h-2 w-16" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(progress.overall)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/employees/${emp.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                              View <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
