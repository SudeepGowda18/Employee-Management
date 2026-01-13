import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Briefcase,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
} from 'lucide-react';

export const EmployeeDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    const employees = storage.getEmployees();
    const allTasks = storage.getTasks();
    const emp = employees.find((e) => e.id === id);
    
    if (!emp) {
      navigate('/employees');
      return;
    }

    setEmployee(emp);
    setTasks(allTasks[id]);
  }, [id, navigate]);

  const calculateProgress = () => {
    if (!tasks) return { overall: 0, hr: 0, it: 0, admin: 0 };

    const progress = { overall: 0, hr: 0, it: 0, admin: 0 };
    let totalTasks = 0;
    let completedTasks = 0;

    ['hr', 'it', 'admin'].forEach((dept) => {
      const deptTasks = tasks[dept]?.tasks || [];
      const deptCompleted = deptTasks.filter((t) => t.status === 'completed').length;
      
      totalTasks += deptTasks.length;
      completedTasks += deptCompleted;
      
      progress[dept] = deptTasks.length > 0 ? Math.round((deptCompleted / deptTasks.length) * 100) : 0;
    });

    progress.overall = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return progress;
  };

  const updateTaskStatus = (dept, taskId, newStatus) => {
    const allTasks = storage.getTasks();
    const empTasks = allTasks[id];

    const taskIndex = empTasks[dept].tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    empTasks[dept].tasks[taskIndex].status = newStatus;
    empTasks[dept].tasks[taskIndex].completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    allTasks[id] = empTasks;
    storage.saveTasks(allTasks);
    setTasks({ ...empTasks });

    storage.addActivity({
      type: 'task_updated',
      user: user.name,
      description: `Updated ${empTasks[dept].tasks[taskIndex].title} to ${newStatus}`,
      employeeId: id,
      employeeName: employee.name,
    });

    toast.success('Task status updated');
  };

  const addComment = (dept, taskId) => {
    const commentText = newComment[`${dept}-${taskId}`];
    if (!commentText?.trim()) return;

    const allTasks = storage.getTasks();
    const empTasks = allTasks[id];

    const taskIndex = empTasks[dept].tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const comment = {
      id: Date.now(),
      user: user.name,
      role: user.role,
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    empTasks[dept].tasks[taskIndex].comments.push(comment);
    allTasks[id] = empTasks;
    storage.saveTasks(allTasks);
    setTasks({ ...empTasks });
    setNewComment({ ...newComment, [`${dept}-${taskId}`]: '' });

    storage.addActivity({
      type: 'comment_added',
      user: user.name,
      description: `Added comment to ${empTasks[dept].tasks[taskIndex].title}`,
      employeeId: id,
      employeeName: employee.name,
    });

    toast.success('Comment added');
  };

  if (!employee || !tasks) {
    return <div>Loading...</div>;
  }

  const progress = calculateProgress();

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

  const canEditDepartment = (dept) => {
    return user.role === 'hr' || user.role === dept;
  };

  const TaskCard = ({ task, dept }) => {
    const canEdit = canEditDepartment(dept);

    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{task.title}</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
            {getStatusBadge(task.status)}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            {task.completedAt && (
              <div className="flex items-center gap-1 text-success">
                <CheckCircle className="w-4 h-4" />
                <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="mb-4">
              <Select value={task.status} onValueChange={(value) => updateTaskStatus(dept, task.id, value)}>
                <SelectTrigger className="w-full transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {task.comments.length > 0 && (
            <div className="mb-4 space-y-3">
              <h5 className="font-medium text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments ({task.comments.length})
              </h5>
              <div className="space-y-2">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment[`${dept}-${task.id}`] || ''}
              onChange={(e) => setNewComment({ ...newComment, [`${dept}-${task.id}`]: e.target.value })}
              className="min-h-[60px]"
            />
            <Button onClick={() => addComment(dept, task.id)}>
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/employees">
        <Button variant="ghost" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </Button>
      </Link>

      <Card className="mb-6 border-border/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-[Manrope] mb-1">{employee.name}</CardTitle>
                <CardDescription className="text-base">{employee.email}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {employee.id}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Building className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-medium">{employee.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Briefcase className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Job Role</p>
                <p className="font-medium">{employee.jobRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Joining Date</p>
                <p className="font-medium">{new Date(employee.joiningDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Overall Progress</h3>
              <span className="text-2xl font-bold font-[Manrope]">{progress.overall}%</span>
            </div>
            <Progress value={progress.overall} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="hr" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hr">
            HR Tasks ({progress.hr}%)
          </TabsTrigger>
          <TabsTrigger value="it">
            IT Tasks ({progress.it}%)
          </TabsTrigger>
          <TabsTrigger value="admin">
            Admin Tasks ({progress.admin}%)
          </TabsTrigger>
        </TabsList>

        {['hr', 'it', 'admin'].map((dept) => (
          <TabsContent key={dept} value={dept} className="space-y-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-[Manrope] capitalize">{dept} Department Tasks</CardTitle>
                <CardDescription>
                  {canEditDepartment(dept) 
                    ? 'You can update task status and add comments'
                    : 'View-only mode for this department'
                  }
                </CardDescription>
              </CardHeader>
            </Card>

            {tasks[dept]?.tasks.map((task) => (
              <TaskCard key={task.id} task={task} dept={dept} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
