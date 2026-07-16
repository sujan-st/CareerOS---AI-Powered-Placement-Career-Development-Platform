import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Send,
  User,
  Activity,
  Zap,
  BarChart,
  Bot,
  Clock
} from 'lucide-react';
import API from '../../services/api.js';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const DailyMentor = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly' | 'monthly' | 'analytics'
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'mentor',
      text: `Hello ${user?.name || 'there'}! I am your AI Career Mentor. I've analyzed your resume score, LeetCode progress, and recent mock interviews. What placement area should we focus on optimizing today?`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/student/dashboard');
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (err) {
        console.error('Failed to load mentor stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputMessage('');
    setSending(true);

    try {
      // Direct call to Gemini chat route simulation
      setTimeout(() => {
        let reply = "Consistent preparation is key. I recommend scheduling a mock interview round for your target role or solving 2 Medium DSA problems on dynamic programming.";
        if (userText.toLowerCase().includes('resume') || userText.toLowerCase().includes('ats')) {
          reply = `Based on your profile, your resume score is ${dashboardData?.resumeScore || 78}/100. Let's optimize the project description sections using active action verbs and ensure Docker/AWS deployment is explicitly mentioned.`;
        } else if (userText.toLowerCase().includes('code') || userText.toLowerCase().includes('dsa') || userText.toLowerCase().includes('leet')) {
          reply = `You have completed ${dashboardData?.codingProgress?.total || 46} problems. Let's aim to boost your Medium solves ratio by taking on the daily coding goals. Focus on Tree DFS algorithms today!`;
        } else if (userText.toLowerCase().includes('interview') || userText.toLowerCase().includes('mock')) {
          reply = "Your communication score is strong. Let's schedule a Technical Mock Interview in CareerOS today to practice system scalability calculations under pressure.";
        }
        setChatMessages((prev) => [...prev, { sender: 'mentor', text: reply }]);
        setSending(false);
      }, 1000);

    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'mentor', text: 'Connecting error. Please try again.' }]);
      setSending(false);
    }
  };

  const radarChartData = {
    labels: ['Communication', 'DSA Coding', 'System Design', 'Behavioral', 'Resume Score', 'Certifications'],
    datasets: [
      {
        label: 'Placement Competencies',
        data: [
          78, 
          dashboardData?.codingProgress?.total ? Math.min(100, dashboardData.codingProgress.total * 1.8) : 60, 
          70, 
          75, 
          dashboardData?.resumeScore || 72, 
          dashboardData?.applicationsCount ? 80 : 50
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
      },
    ],
  };

  const getMentorRecommendation = () => {
    const resumeScore = dashboardData?.resumeScore || 78;
    if (resumeScore < 75) {
      return {
        priority: 'High',
        task: 'Optimize Resume Sections',
        description: 'Your ATS score is currently below the target threshold. Utilize the AI Resume Analyzer to append matching keywords.',
        time: '30 mins'
      };
    }
    return {
      priority: 'Medium',
      task: 'Mock Interview Prep',
      description: 'Strengthen System Design and microservice scaling structures before your scheduled Google prep round.',
      time: '45 mins'
    };
  };

  const rec = getMentorRecommendation();

  return (
    <div className="space-y-8 font-sans pb-10 max-w-6xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-500" /> AI Daily Mentor
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Your personal cognitive career companion monitoring your milestones and reviewing daily, weekly, and monthly performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Tabs & Review Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            {['daily', 'weekly', 'monthly', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-800 text-indigo-505 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab} Review
              </button>
            ))}
          </div>

          {/* TAB 1: DAILY GUIDANCE */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              {/* Daily Assessment */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-slate-850 dark:text-white text-sm">Today's Progress Assessment</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Excellent work on maintaining your streak of <strong>{dashboardData?.dailyStreak || 1} days</strong>! I monitored your latest activity: your code solves are solid, but we need to verify that your AWS containerization knowledge matches recruiter expectations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Identified Weakness</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1">Docker & AWS ECS Deployments</h4>
                  </div>
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Target Level</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1">Level {dashboardData?.level || 1} Prep Rank</h4>
                  </div>
                </div>
              </div>

              {/* Next Task Recommendation */}
              <div className="p-6 bg-gradient-to-r from-indigo-900/40 to-slate-950/40 border border-indigo-500/20 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Suggested Next Task</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{rec.task}</h4>
                    </div>
                  </div>
                  <span className="text-[9px] bg-rose-500/10 text-rose-450 border border-rose-500/20 px-2 py-0.5 rounded font-bold uppercase">
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-350 leading-relaxed">
                  {rec.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Estimated Completion: {rec.time}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEEKLY AUDIT */}
          {activeTab === 'weekly' && (
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-850 dark:text-white text-sm">Weekly Performance Audit</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="border-l-2 border-indigo-500 pl-4 py-1 space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-white">Coding Milestones:</h4>
                  <p className="text-slate-400">Solved 14 coding problems. Great correctness stats; aim to challenge Hard-rated algorithms next.</p>
                </div>
                <div className="border-l-2 border-amber-500 pl-4 py-1 space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-white">Mock Interview Frequency:</h4>
                  <p className="text-slate-400">Completed 2 virtual sessions. Your speech filler rate has decreased by 18%! Excellent pitch moderation.</p>
                </div>
                <div className="border-l-2 border-emerald-500 pl-4 py-1 space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-white">Application Pipeline:</h4>
                  <p className="text-slate-400">Submitted 5 applications. Expected follow-up rate is currently high based on current ATS scores.</p>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-xl border border-indigo-500/10 text-xs text-indigo-555 dark:text-indigo-350">
                <strong>AI Mentor Tip:</strong> Book an interview slot for Amazon mock rounds before Sunday to finalize this week's communication goal.
              </div>
            </div>
          )}

          {/* TAB 3: MONTHLY REVIEW */}
          {activeTab === 'monthly' && (
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-850 dark:text-white text-sm">Monthly Progress Report</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border rounded-xl">
                  <span className="text-2xl font-black text-slate-850 dark:text-white">+180</span>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Total XP Earned</p>
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border rounded-xl">
                  <span className="text-2xl font-black text-emerald-500">+12%</span>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Readiness Gain</p>
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-2xl font-black text-slate-855 dark:text-white">Level 4</span>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Current Standing</p>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-400">
                <p>
                  Your profile readiness score has increased by <strong>+12%</strong> since last month, primarily driven by resume score updates (+15 points) and interview accuracy gains.
                </p>
                <p>
                  <strong>Next Month Goal:</strong> Standardize SQL databases schema normalization techniques and compile a clean architecture portfolio site.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: PERFORMANCE GRAPH */}
          {activeTab === 'analytics' && (
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-bold text-slate-850 dark:text-white text-sm mb-4">Competency Map</h3>
              <div className="aspect-square max-w-sm mx-auto">
                <Radar data={radarChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Live Chat with AI Mentor */}
        <div className="glass-panel rounded-2xl flex flex-col h-[520px] overflow-hidden border">
          {/* Chat Header */}
          <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b flex items-center gap-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
            <h3 className="font-extrabold text-slate-855 dark:text-white text-xs">Chat with AI Mentor</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`p-2.5 rounded-xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-650 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-800/50'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-1.5 py-1 text-slate-400">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            )}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t bg-slate-50 dark:bg-slate-950 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask for recommendations..."
              className="flex-1 bg-white dark:bg-slate-900 border rounded-lg px-3 text-xs outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={sending}
              className="p-2.5 bg-indigo-650 hover:bg-indigo-750 disabled:bg-indigo-650/50 text-white rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DailyMentor;
