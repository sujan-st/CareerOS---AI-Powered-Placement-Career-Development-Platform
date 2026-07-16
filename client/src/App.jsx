import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth Pages
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

// Student Pages
import Dashboard from './pages/Student/Dashboard.jsx';
import ResumeBuilder from './pages/Student/ResumeBuilder.jsx';
import ResumeAnalyzer from './pages/Student/ResumeAnalyzer.jsx';
import VoiceInterview from './pages/Student/VoiceInterview.jsx';
import Chatbot from './pages/Student/Chatbot.jsx';
import Copilot from './pages/Student/Copilot.jsx';
import Applications from './pages/Student/Applications.jsx';
import Planner from './pages/Student/Planner.jsx';
import CodingTracker from './pages/Student/CodingTracker.jsx';
import Roadmaps from './pages/Student/Roadmaps.jsx';
import Calendar from './pages/Student/Calendar.jsx';
import Chat from './pages/Student/Chat.jsx';
import DailyMentor from './pages/Student/DailyMentor.jsx';
import EmailGenerator from './pages/Student/EmailGenerator.jsx';

// Other Role Dashboards
import RecruiterDashboard from './pages/Recruiter/RecruiterDashboard.jsx';
import MentorDashboard from './pages/Mentor/MentorDashboard.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';

// Layout & Guards
import ProtectedRoute from './components/Common/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Helper to resolve landing page depending on role
  const getLandingRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === 'recruiter') return <Navigate to="/recruiter" replace />;
    if (user?.role === 'mentor') return <Navigate to="/mentor" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? getLandingRedirect() : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? getLandingRedirect() : <Register />}
        />

        {/* Student Protected Section (Uses Sidebars, Navbars from DashboardLayout) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/ats-checker" element={<ResumeAnalyzer />} />
          <Route path="/mock-interviews" element={<VoiceInterview />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/copilot" element={<Copilot />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/coding-tracker" element={<CodingTracker />} />
          <Route path="/roadmaps" element={<Roadmaps />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/daily-mentor" element={<DailyMentor />} />
          <Route path="/email-generator" element={<EmailGenerator />} />
        </Route>

        {/* Recruiter Workspace */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
                <DashboardLayout />
              </div>
            </ProtectedRoute>
          }
        >
          <Route index element={<RecruiterDashboard />} />
          <Route path="jobs" element={<RecruiterDashboard activeTab="jobs" />} />
          <Route path="students" element={<RecruiterDashboard activeTab="search" />} />
        </Route>

        {/* Mentor Workspace */}
        <Route
          path="/mentor"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
                <DashboardLayout />
              </div>
            </ProtectedRoute>
          }
        >
          <Route index element={<MentorDashboard />} />
          <Route path="review" element={<MentorDashboard activeTab="review" />} />
        </Route>

        {/* Admin Workspace */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
                <DashboardLayout />
              </div>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard activeTab="users" />} />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={getLandingRedirect()} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
