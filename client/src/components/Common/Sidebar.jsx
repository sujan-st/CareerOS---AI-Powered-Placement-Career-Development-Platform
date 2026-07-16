import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileCheck,
  Brain,
  Video,
  Trello,
  Calendar,
  MessageSquare,
  Sparkles,
  Search,
  CheckSquare,
  Users,
  Compass,
  Trophy,
  Award,
  Bot,
  Mail
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  const getStudentLinks = () => [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Resume Builder', path: '/resume-builder', icon: FileSpreadsheet },
    { name: 'ATS Score Checker', path: '/ats-checker', icon: FileCheck },
    { name: 'AI Placement Copilot', path: '/copilot', icon: Sparkles },
    { name: 'AI Virtual Interview', path: '/mock-interviews', icon: Video },
    { name: 'AI Skill Gap Roadmap', path: '/roadmaps', icon: Compass },
    { name: 'AI Daily Mentor', path: '/daily-mentor', icon: Bot },
    { name: 'AI Email Writer', path: '/email-generator', icon: Mail },
    { name: 'Daily Planner', path: '/planner', icon: CheckSquare },
    { name: 'Coding Tracker', path: '/coding-tracker', icon: Trophy },
    { name: 'Applications CRM', path: '/applications', icon: Trello },
    { name: 'Placement Chatbot', path: '/chatbot', icon: Brain },
    { name: 'Visual Calendar', path: '/calendar', icon: Calendar },
    { name: 'Chat Channels', path: '/chat', icon: MessageSquare },
  ];

  const getRecruiterLinks = () => [
    { name: 'Recruiter Desk', path: '/recruiter', icon: LayoutDashboard },
    { name: 'Manage Postings', path: '/recruiter/jobs', icon: CheckSquare },
    { name: 'Student Finder', path: '/recruiter/students', icon: Search },
    { name: 'Chat Channels', path: '/chat', icon: MessageSquare },
  ];

  const getMentorLinks = () => [
    { name: 'Mentor Dashboard', path: '/mentor', icon: LayoutDashboard },
    { name: 'Candidate Review', path: '/mentor/review', icon: Users },
    { name: 'Chat Channels', path: '/chat', icon: MessageSquare },
  ];

  const getAdminLinks = () => [
    { name: 'Admin Console', path: '/admin', icon: LayoutDashboard },
    { name: 'User Directory', path: '/admin/users', icon: Users },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'recruiter':
        return getRecruiterLinks();
      case 'mentor':
        return getMentorLinks();
      case 'admin':
        return getAdminLinks();
      default:
        return getStudentLinks();
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 glass-panel h-[calc(100vh-62px)] flex flex-col justify-between py-6 border-r shrink-0">
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-4 px-3">
          Menu Navigation
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Gamification Level Footer */}
      {user?.role === 'student' && (
        <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>XP progress</span>
            <span>{user.xp % 100}/100</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-350"
              style={{ width: `${user.xp % 100}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-slate-850 dark:text-white">
            <Award className="w-4 h-4 text-indigo-500" />
            <span>Level {user.level} Prep rank</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
