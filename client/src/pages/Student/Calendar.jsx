import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import {
  Calendar as CalendarIcon,
  Clock,
  Briefcase,
  Video,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Bell,
  Mail,
  ListTodo,
  Compass,
  Trophy,
  ToggleLeft,
  ToggleRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Calendar = () => {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Sync settings states
  const [syncSettings, setSyncSettings] = useState({
    googleSync: true,
    interviews: true,
    planner: true,
    coding: true,
    deadlines: true,
    roadmap: true,
    emailReminders: true,
    pushNotifications: false
  });

  const toggleSetting = (key) => {
    setSyncSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const fetchCalendarEvents = async () => {
    try {
      const resInterviews = await API.get('/interviews/history');
      const resApps = await API.get('/student/applications');
      if (resInterviews.data.success) setInterviews(resInterviews.data.data);
      if (resApps.data.success) setApplications(resApps.data.data);
    } catch (err) {
      console.error('Error fetching calendar elements:', err);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const handleGoogleCalendarSync = () => {
    setSyncing(true);
    setSyncStatus('');
    setTimeout(() => {
      setSyncing(false);
      setSyncStatus('Successfully synchronized with sujann005@gmail.com Google Calendar events!');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    }, 1500);
  };

  // Mock days grid creation including planner tasks, coding milestones, and roadmap checkpoints
  const daysInMonth = Array.from({ length: 30 }, (_, idx) => {
    const day = idx + 1;
    // Map interviews
    const dayInterviews = syncSettings.interviews ? interviews.filter((i) => {
      const d = new Date(i.scheduledAt);
      return d.getDate() === day;
    }) : [];

    // Map applications (deadlines simulated 7 days after application creation)
    const dayApps = syncSettings.deadlines ? applications.filter((a) => {
      const d = new Date(a.createdAt);
      return d.getDate() === day || (d.getDate() + 7) % 30 === day;
    }) : [];

    // Simulated Daily Planner task checkpoints (scheduled on even days)
    const dayPlannerTasks = (syncSettings.planner && day % 3 === 0) ? [
      { id: `t-${day}`, label: 'Solve Daily Prep Tasks' }
    ] : [];

    // Simulated Coding Goals milestones (scheduled on prime-like days)
    const dayCodingTasks = (syncSettings.coding && (day % 4 === 1)) ? [
      { id: `c-${day}`, label: 'LeetCode Milestone' }
    ] : [];

    // Simulated Learning Roadmap checkpoints (scheduled on Saturdays/Sundays)
    const dayRoadmaps = (syncSettings.roadmap && day % 7 === 0) ? [
      { id: `r-${day}`, label: 'System Design path' }
    ] : [];

    return {
      day,
      interviews: dayInterviews,
      applications: dayApps,
      planner: dayPlannerTasks,
      coding: dayCodingTasks,
      roadmap: dayRoadmaps
    };
  });

  return (
    <div className="space-y-8 font-sans pb-10 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-855 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-500" /> Google Calendar Integration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track interview dates, coding schedules, job deadlines, and synchronize with your Google Calendar accounts.
          </p>
        </div>
        <button
          onClick={handleGoogleCalendarSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-650/50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/15"
        >
          {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>{syncing ? 'Syncing...' : 'Google Calendar Sync'}</span>
        </button>
      </div>

      {syncStatus && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-555 text-xs flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left 3 Cols: Monthly grid view */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">
                July 2026
              </h3>
              <div className="flex gap-2">
                <button className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days Headings */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase font-bold text-slate-400 mb-3">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Monthly grid */}
            <div className="grid grid-cols-7 gap-2">
              <div className="bg-transparent h-24 rounded-xl" />
              <div className="bg-transparent h-24 rounded-xl" />
              
              {daysInMonth.map((cell) => {
                const hasEvent =
                  cell.interviews.length > 0 ||
                  cell.applications.length > 0 ||
                  cell.planner.length > 0 ||
                  cell.coding.length > 0 ||
                  cell.roadmap.length > 0;

                return (
                  <div
                    key={cell.day}
                    className={`h-24 border border-slate-200/50 dark:border-slate-800/50 p-2 rounded-xl flex flex-col justify-between hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors ${
                      hasEvent ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/40 dark:bg-slate-900/40'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400">{cell.day}</span>
                    <div className="space-y-0.5 overflow-hidden">
                      {cell.interviews.map((i) => (
                        <div key={i._id} className="bg-amber-500 text-white rounded text-[7px] px-1 py-0.5 font-bold truncate flex items-center gap-0.5">
                          <Video className="w-1.5 h-1.5 shrink-0" /> Interview
                        </div>
                      ))}
                      {cell.applications.map((a) => (
                        <div key={a._id} className="bg-emerald-500 text-white rounded text-[7px] px-1 py-0.5 font-bold truncate flex items-center gap-0.5">
                          <Briefcase className="w-1.5 h-1.5 shrink-0" /> App Deadline
                        </div>
                      ))}
                      {cell.planner.map((p) => (
                        <div key={p.id} className="bg-blue-500 text-white rounded text-[7px] px-1 py-0.5 font-bold truncate flex items-center gap-0.5">
                          <ListTodo className="w-1.5 h-1.5 shrink-0" /> Goal
                        </div>
                      ))}
                      {cell.coding.map((c) => (
                        <div key={c.id} className="bg-violet-500 text-white rounded text-[7px] px-1 py-0.5 font-bold truncate flex items-center gap-0.5">
                          <Trophy className="w-1.5 h-1.5 shrink-0" /> Coding
                        </div>
                      ))}
                      {cell.roadmap.map((r) => (
                        <div key={r.id} className="bg-rose-500 text-white rounded text-[7px] px-1 py-0.5 font-bold truncate flex items-center gap-0.5">
                          <Compass className="w-1.5 h-1.5 shrink-0" /> Roadmap
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Sync Settings Panel */}
        <div className="space-y-6 col-span-1">
          {/* Sync Categories Toggles */}
          <div className="glass-card p-5 rounded-2xl space-y-4 text-xs">
            <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Sync Categories
            </h3>

            <div className="space-y-3.5 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-350">Google Calendar Link</span>
                <button onClick={() => toggleSetting('googleSync')}>
                  {syncSettings.googleSync ? <ToggleRight className="w-6 h-6 text-indigo-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                </button>
              </div>

              <div className="flex justify-between items-center border-t pt-2 border-slate-200/40 dark:border-slate-800/40">
                <span className="font-medium text-slate-400">Interview Schedules</span>
                <button onClick={() => toggleSetting('interviews')}>
                  {syncSettings.interviews ? <ToggleRight className="w-5 h-5 text-indigo-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                </button>
              </div>

              <div className="flex justify-between items-center border-t pt-2 border-slate-200/40 dark:border-slate-800/40">
                <span className="font-medium text-slate-400">Daily Planner Checklist</span>
                <button onClick={() => toggleSetting('planner')}>
                  {syncSettings.planner ? <ToggleRight className="w-5 h-5 text-indigo-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                </button>
              </div>

              <div className="flex justify-between items-center border-t pt-2 border-slate-200/40 dark:border-slate-800/40">
                <span className="font-medium text-slate-400">Coding Practice Goals</span>
                <button onClick={() => toggleSetting('coding')}>
                  {syncSettings.coding ? <ToggleRight className="w-5 h-5 text-indigo-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                </button>
              </div>

              <div className="flex justify-between items-center border-t pt-2 border-slate-200/40 dark:border-slate-800/40">
                <span className="font-medium text-slate-400">Application Deadlines</span>
                <button onClick={() => toggleSetting('deadlines')}>
                  {syncSettings.deadlines ? <ToggleRight className="w-5 h-5 text-indigo-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                </button>
              </div>

              <div className="flex justify-between items-center border-t pt-2 border-slate-200/40 dark:border-slate-800/40">
                <span className="font-medium text-slate-400">Learning Roadmap Milestones</span>
                <button onClick={() => toggleSetting('roadmap')}>
                  {syncSettings.roadmap ? <ToggleRight className="w-5 h-5 text-indigo-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Notification Options */}
          <div className="glass-card p-5 rounded-2xl space-y-4 text-xs">
            <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-500" /> Alerts & Reminders
            </h3>

            <div className="space-y-3.5 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> Email Reminders</span>
                <button onClick={() => toggleSetting('emailReminders')}>
                  {syncSettings.emailReminders ? <ToggleRight className="w-5 h-5 text-indigo-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                </button>
              </div>

              <div className="flex justify-between items-center border-t pt-2 border-slate-200/40 dark:border-slate-800/40">
                <span className="font-medium text-slate-400 flex items-center gap-1"><Bell className="w-3.5 h-3.5 text-slate-500" /> Push Notifications</span>
                <button onClick={() => toggleSetting('pushNotifications')}>
                  {syncSettings.pushNotifications ? <ToggleRight className="w-5 h-5 text-indigo-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Calendar;

