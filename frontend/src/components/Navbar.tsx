import React, { useState, useEffect, useRef } from 'react';
import { Bell, Sun, Moon, LogOut, User } from 'lucide-react';
import api from '../api';

interface NavbarProps {
  onLogout: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const fullName = localStorage.getItem('fullName') || 'User';
  const username = localStorage.getItem('username') || 'user';

  // Toggle dark mode
  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to dismiss notification', err);
    }
  };

  useEffect(() => {
    // Check initial theme settings
    if (localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // refresh every 20 seconds

    // Close notifications panel on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 z-30 sticky top-0 shadow-sm transition-colors duration-200 select-none">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Selamat Datang,</h2>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{fullName}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          title="Ganti Tema"
        >
          {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-700" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all duration-200"
            title="Notifikasi"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Notifikasi Sistem</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {notifications.length} Baru
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    Tidak ada notifikasi baru.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer flex flex-col gap-1 transition-colors duration-150"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          n.type === 'Stock Warning' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          {n.type === 'Stock Warning' ? 'Stok Tipis' : 'Keuangan'}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center shadow-md">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 leading-none">{fullName}</h4>
            <span className="text-[10px] font-bold text-slate-400 truncate">@{username}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200"
          title="Keluar"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
