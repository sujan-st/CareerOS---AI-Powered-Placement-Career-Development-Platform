import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/slices/themeSlice.js';
import { logout } from '../../redux/slices/authSlice.js';
import { setNotifications, addNotification, markAsRead } from '../../redux/slices/notificationSlice.js';
import { Sun, Moon, Bell, Coins, Award, LogOut, ShieldAlert } from 'lucide-react';
import { io } from 'socket.io-client';
import API from '../../services/api.js';

let socket = null;

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await API.get('/student/notifications');
        if (data.success) {
          dispatch(setNotifications(data.data));
        }
      } catch (err) {
        console.error('Failed to retrieve smart notifications:', err);
      }
    };

    if (user?.role === 'student') {
      fetchNotifs();
    }
  }, [user, dispatch]);

  // Connect sockets for live notifications
  useEffect(() => {
    if (user) {
      const socketUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('/api', '') 
        : (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/');
      socket = io(socketUrl);
      socket.emit('register_user', user.id);

      socket.on('smart_notification', (notif) => {
        dispatch(addNotification(notif));
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, dispatch]);

  const handleMarkRead = async (id) => {
    dispatch(markAsRead(id));
  };

  return (
    <header className="glass-panel sticky top-0 z-40 w-full flex items-center justify-between px-6 py-3 border-b">
      {/* Branding */}
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold shadow-md shadow-indigo-600/30">
          OS
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-indigo-650 dark:from-white dark:to-indigo-400 bg-clip-text text-transparent">
          CareerOS
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 border border-indigo-500/30 px-1.5 py-0.5 rounded-full">
          AI-SaaS
        </span>
      </div>

      {/* Stats and Control Grid */}
      <div className="flex items-center gap-5">
        {/* Gamification Stats */}
        {user?.role === 'student' && (
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
            {/* Level */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
              <Award className="w-4 h-4 text-yellow-500" />
              <span>Level {user.level}</span>
            </div>
            {/* XP */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
              <span>{user.xp} XP</span>
            </div>
            {/* Coins */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{user.coins} Coins</span>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 transition-colors"
          title="Toggle light/dark mode"
        >
          {mode === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-650" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 text-sm">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <span className="font-bold text-slate-850 dark:text-white">Smart Notifications</span>
                <span className="text-xs text-indigo-500 font-medium">{unreadCount} pending</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No alerts right now</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkRead(n._id)}
                      className={`p-2.5 rounded-lg cursor-pointer transition-all ${
                        n.isRead
                          ? 'bg-transparent text-slate-400'
                          : 'bg-indigo-50/50 dark:bg-indigo-950/20 text-slate-800 dark:text-slate-200 border-l-4 border-indigo-500'
                      }`}
                    >
                      <div className="font-semibold text-xs flex items-center gap-1">
                        {n.type === 'interview' && <Award className="w-3 h-3 text-emerald-500" />}
                        {n.type === 'coding' && <Coins className="w-3 h-3 text-indigo-400" />}
                        {n.type === 'suggestion' && <ShieldAlert className="w-3 h-3 text-amber-500" />}
                        <span>{n.title}</span>
                      </div>
                      <p className="text-[11px] mt-0.5 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200/50 dark:border-slate-700/50">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-850 dark:text-white leading-none">{user?.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">{user?.role}</p>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
export { socket };
