import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CreateEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    jobRole: '',
    joiningDate: '',
  });

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.department || !formData.jobRole || !formData.joiningDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const employees = storage.getEmployees();
    const tasks = storage.getTasks();

    const empId = `EMP${String(employees.length + 1).padStart(3, '0')}`;

    const newEmployee = {
      id: empId,
      ...formData,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    const newTasks = {
      hr: {
        tasks: [
          {
            id: 'hr-1',
            title: 'Employment Contract',
            description: 'Review and sign employment contract',
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
            comments: [],
          },
          {
            id: 'hr-2',
            title: 'Company Policies',
            description: 'Read and acknowledge company policies',
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
            comments: [],
          },
          {
            id: 'hr-3',
            title: 'Tax Documents',
            description: 'Submit W-4 and state tax forms',
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
            comments: [],
          },
          {
            id: 'hr-4',
            title: 'Benefits Enrollment',
            description: 'Complete health insurance and benefits selection',
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
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
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
            comments: [],
          },
          {
            id: 'it-2',
            title: 'Laptop Assignment',
            description: 'Assign and configure laptop',
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
            comments: [],
          },
          {
            id: 'it-3',
            title: 'Software Access',
            description: 'Grant access to required software and tools',
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
            comments: [],
          },
          {
            id: 'it-4',
            title: 'VPN & Security Setup',
            description: 'Configure VPN and security credentials',
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
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
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
            comments: [],
          },
          {
            id: 'admin-2',
            title: 'Desk Assignment',
            description: 'Assign desk and seating arrangement',
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
            comments: [],
          },
          {
            id: 'admin-3',
            title: 'Office Supplies',
            description: 'Provide office supplies and equipment',
            status: 'not_started',
            dueDate: new Date(formData.joiningDate).toISOString(),
            completedAt: null,
            comments: [],
          },
        ],
      },
    };

    employees.push(newEmployee);
    tasks[empId] = newTasks;

    storage.saveEmployees(employees);
    storage.saveTasks(tasks);
    storage.addActivity({
      type: 'employee_created',
      user: 'HR',
      description: `New employee ${formData.name} added to onboarding`,
      employeeId: empId,
    });

    toast.success(`Employee ${formData.name} created successfully!`);
    navigate('/employees');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold font-[Manrope] mb-2">Add New Employee</h1>
        <p className="text-muted-foreground">
          Create a new employee profile and initiate onboarding workflow
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-[Manrope] flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Employee Information
          </CardTitle>
          <CardDescription>
            Enter the new employee's details. An onboarding workflow will be automatically created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger id="department" className="transition-all">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobRole">Job Role *</Label>
                <Input
                  id="jobRole"
                  placeholder="Software Engineer"
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  className="transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="joiningDate">Joining Date *</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="transition-all"
                />
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2">Automatic Workflow Assignment</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Upon creation, the following tasks will be automatically assigned:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• HR: Employment contract, policies, tax documents, benefits (4 tasks)</li>
                <li>• IT: Email setup, laptop assignment, software access, VPN setup (4 tasks)</li>
                <li>• Admin: ID card, desk assignment, office supplies (3 tasks)</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <Link to="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Create Employee
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
