import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Activity,
  UserPlus,
  MessageSquare,
  CheckCircle,
  LogIn,
  LogOut,
  Search,
} from 'lucide-react';

export const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const log = storage.getActivityLog();
    setActivities(log);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <LogIn className="w-4 h-4 text-primary" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-muted-foreground" />;
      case 'employee_created':
        return <UserPlus className="w-4 h-4 text-success" />;
      case 'task_updated':
        return <CheckCircle className="w-4 h-4 text-warning" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-info" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case 'login':
        return <Badge variant="outline">Login</Badge>;
      case 'logout':
        return <Badge variant="outline">Logout</Badge>;
      case 'employee_created':
        return <Badge className="bg-success text-success-foreground">New Employee</Badge>;
      case 'task_updated':
        return <Badge className="bg-warning text-warning-foreground">Task Update</Badge>;
      case 'comment_added':
        return <Badge className="bg-info text-info-foreground">Comment</Badge>;
      default:
        return <Badge variant="secondary">Activity</Badge>;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return activityTime.toLocaleDateString();
  };

  const filteredActivities = activities
    .filter((activity) => {
      const matchesSearch = 
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || activity.type === filterType;
      
      return matchesSearch && matchesType;
    });

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'login', label: 'Logins' },
    { value: 'employee_created', label: 'New Employees' },
    { value: 'task_updated', label: 'Task Updates' },
    { value: 'comment_added', label: 'Comments' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-[Manrope] mb-2">Activity Log</h1>
        <p className="text-muted-foreground">
          Real-time audit trail of all system activities and user actions
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <CardTitle className="font-[Manrope]">Recent Activities</CardTitle>
              <CardDescription>
                {filteredActivities.length} activities logged
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-[200px]"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No activities found</p>
                </div>
              ) : (
                filteredActivities.map((activity) => (
                  <Card key={activity.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">
                                by {activity.user}
                              </p>
                            </div>
                            {getActivityBadge(activity.type)}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                              {getTimeAgo(activity.timestamp)}
                            </p>
                            {activity.employeeName && (
                              <Badge variant="outline" className="text-xs">
                                {activity.employeeName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
