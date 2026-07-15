import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface Notification {
  id: number;
  userEmail: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface NotificationBellProps {
  userEmail: string;
}

export default function NotificationBell({ userEmail }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/notifications?userEmail=${encodeURIComponent(userEmail)}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchNotifications();
    }
  }, [userEmail]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success("Notification marked as read");
    } catch (err) {
      console.error("Failed to mark as read", err);
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50 text-left animate-in fade-in duration-200">
          <div className="p-3 border-b border-border bg-secondary/10 flex justify-between items-center">
            <span className="text-xs font-bold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="divide-y divide-border/60">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-xs leading-normal transition-colors flex justify-between items-start gap-2 ${
                    n.read ? "bg-card text-muted-foreground" : "bg-primary/5 text-foreground"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{n.title}</p>
                    <p className="text-[11px] font-medium leading-relaxed">{n.message}</p>
                    <p className="text-[9px] text-muted-foreground font-semibold">{n.date}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-1 rounded-md border border-border hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground font-semibold">
                No notifications found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
