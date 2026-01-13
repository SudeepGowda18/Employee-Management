import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { storage } from '../utils/storage';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  X 
} from 'lucide-react';

export const NotificationPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const generateNotifications = () => {
      const employees = storage.getEmployees();
      const tasks = storage.getTasks();
      const notifs = [];

      employees.forEach((emp) => {
        const empTasks = tasks[emp.id];
        if (empTasks) {
          ['hr', 'it', 'admin'].forEach((dept) => {
            const pending = empTasks[dept]?.tasks.filter(
              (t) => t.status !== 'completed'
            );
            if (pending?.length > 0) {
              notifs.push({
                id: `${emp.id}-${dept}`,
                type: 'pending',
                employee: emp.name,
                department: dept.toUpperCase(),
                count: pending.length,
                timestamp: new Date(emp.joiningDate).toISOString(),
              });
            }
          });
        }

        const joiningDate = new Date(emp.joiningDate);
        const daysUntilJoining = Math.ceil(
          (joiningDate - new Date()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntilJoining > 0 && daysUntilJoining <= 7) {
          notifs.push({
            id: `joining-${emp.id}`,
            type: 'upcoming',
            employee: emp.name,
            days: daysUntilJoining,
            timestamp: joiningDate.toISOString(),
          });
        }
      });

      setNotifications(notifs.slice(0, 10));
    };

    generateNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'upcoming':
        return <Clock className="w-4 h-4 text-info" />;
      default:
        return <UserPlus className="w-4 h-4 text-primary" />;
    }
  };

  const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] shadow-xl border-border/50 z-50">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold font-[Manrope]">Notifications</h3>
          <p className="text-xs text-muted-foreground">
            {notifications.length} pending items
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-96">
        <div className="p-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 mb-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    {notif.type === 'pending' && (
                      <>
                        <p className="text-sm font-medium">
                          {notif.count} pending {notif.department} tasks
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notif.employee}
                        </p>
                      </>
                    )}
                    {notif.type === 'upcoming' && (
                      <>
                        <p className="text-sm font-medium">
                          {notif.employee} joining soon
                        </p>
                        <p className="text-xs text-muted-foreground">
                          In {notif.days} {notif.days === 1 ? 'day' : 'days'}
                        </p>
                      </>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {getTimeAgo(notif.timestamp)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    New
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
