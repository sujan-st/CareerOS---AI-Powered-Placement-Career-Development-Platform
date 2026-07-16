import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateGamificationStats } from '../../redux/slices/authSlice.js';
import API from '../../services/api.js';
import {
  Sparkles,
  Trophy,
  Calendar,
  Flame,
  Award,
  PlusCircle,
  TrendingUp,
  Brain,
  ThumbsUp,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import confetti from 'canvas-confetti';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [dbData, setDbData] = useState(null);
  const [planner, setPlanner] = useState(null);
  const [copilot, setCopilot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const resDashboard = await API.get('/student/dashboard');
        const resPlanner = await API.get('/ai/planner');
        const resCopilot = await API.get('/student/copilot');

        if (resDashboard.data.success) setDbData(resDashboard.data.data);
        if (resPlanner.data.success) setPlanner(resPlanner.data.data);
        if (resCopilot.data.success) setCopilot(resCopilot.data.data);
      } catch (err) {
        console.error('Dashboard Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleTaskComplete = async (taskKey) => {
    if (!planner || planner.completedTasks.includes(taskKey)) return;

    try {
      // Optimistic state update
      const updatedTasks = [...planner.completedTasks, taskKey];
      setPlanner({ ...planner, completedTasks: updatedTasks });

      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });

      // Claim gamification points: Award 20 XP and 10 Coins
      const nextXp = user.xp + 20;
      const nextCoins = user.coins + 10;
      let nextLevel = user.level;
      let badges = [...user.badges];

      if (nextXp >= user.level * 100) {
        nextLevel += 1;
        badges.push({
          name: `Level ${nextLevel} Achiever`,
          icon: 'award',
          description: `Unlocked by completing daily goals!`,
        });
      }

      dispatch(updateGamificationStats({ xp: nextXp, coins: nextCoins, level: nextLevel, badges }));
      
      // Update DB planner completions
      // API call to track checked task
    } catch (error) {
      console.error(error);
    }
  };

  // Mocking Charts configuration
  const codingChartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Solved Problems',
        data: dbData?.codingProgress ? [dbData.codingProgress.easy, dbData.codingProgress.medium, dbData.codingProgress.hard] : [15, 25, 6],
        backgroundColor: ['rgba(52, 211, 153, 0.7)', 'rgba(251, 191, 36, 0.7)', 'rgba(239, 68, 68, 0.7)'],
        borderColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 1.5,
      },
    ],
  };

  const trendChartData = {
    labels: ['May', 'June', 'July'],
    datasets: [
      {
        label: 'Resume ATS Compatibility Score',
        data: [65, 72, dbData?.resumeScore || 78],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const radarChartData = {
    labels: ['Communication', 'Coding Correctness', 'System Design', 'Behavioral', 'Confidence', 'Problem Solving'],
    datasets: [
      {
        label: 'Student Core Skills Vector',
        data: [76, 80, 70, 72, 77, 78],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse p-4">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-60 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-60 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-60 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 to-indigo-950 p-8 rounded-2xl text-white shadow-xl shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              Hello, {user?.name}! <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              You are currently ranked in the top 15% of your class. Check today's Daily Planner below to keep your streak burning!
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 backdrop-blur px-5 py-3.5 rounded-xl self-start">
            <Flame className="w-8 h-8 text-rose-500 animate-bounce" />
            <div>
              <p className="text-2xl font-black leading-none">{dbData?.dailyStreak || 0}</p>
              <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider mt-1">Daily Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core stats metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profile Strength */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">Profile Strength</span>
            <p className="text-3xl font-black text-slate-850 dark:text-white mt-1">{dbData?.profileStrength || 75}%</p>
            <p className="text-xs text-indigo-500 font-semibold mt-2.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +5% this week
            </p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center font-bold text-sm relative">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent" />
            {dbData?.profileStrength || 75}%
          </div>
        </div>

        {/* ATS score */}
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">Resume Score</span>
          <p className="text-3xl font-black text-slate-850 dark:text-white mt-1">
            {dbData?.resumeScore ? `${dbData.resumeScore}/100` : 'N/A'}
          </p>
          <p className="text-xs text-amber-500 font-semibold mt-2.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> 3 missing keywords
          </p>
        </div>

        {/* Coding tracker */}
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">Coding Solves</span>
          <p className="text-3xl font-black text-slate-850 dark:text-white mt-1">
            {dbData?.codingProgress ? dbData.codingProgress.total : 46}
          </p>
          <p className="text-xs text-emerald-500 font-semibold mt-2.5 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Active LeetCode sync
          </p>
        </div>

        {/* Applications */}
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">Active Jobs CRM</span>
          <p className="text-3xl font-black text-slate-850 dark:text-white mt-1">{dbData?.applicationsCount || 0}</p>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-2.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {dbData?.interviewsCount || 0} scheduled preps
          </p>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Daily planner and schedule */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Daily Planner */}
          <div className="glass-card p-6 rounded-2xl relative">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-850 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" /> AI Daily Planner
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Tasks generated dynamically based on your profile gaps</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Clock className="w-4 h-4" />
                <span>{planner?.estimatedCompletionTimeMinutes || 180} mins</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {planner &&
                ['codingGoal', 'resumeTask', 'revisionTopic', 'mockInterviewGoal', 'jobApplicationGoal'].map((key) => {
                  const val = planner[key];
                  if (!val) return null;
                  const isDone = planner.completedTasks.includes(key);

                  return (
                    <div
                      key={key}
                      onClick={() => handleTaskComplete(key)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isDone
                          ? 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 opacity-60 line-through'
                          : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-500/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        readOnly
                        className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 pointer-events-none"
                      />
                      <div>
                        <p className="text-xs uppercase font-bold text-indigo-500 text-[9px] tracking-widest leading-none">
                          {key.replace('Goal', '').replace('Task', '').replace('Topic', '')}
                        </p>
                        <p className="text-xs font-semibold text-slate-750 dark:text-slate-200 mt-1">{val}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
            <p className="text-[10px] italic text-slate-400 mt-4 text-center">
              "{planner?.dailyMotivation || 'Believe in yourself and keep leveling up!'}"
            </p>
          </div>

          {/* Charts Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-5 rounded-2xl">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Coding Problem Stats</h4>
              <div className="h-44 flex items-center justify-center">
                <Bar data={codingChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4">ATS Compatibility Growth</h4>
              <div className="h-44 flex items-center justify-center">
                <Line data={trendChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Placement Copilot & Speed prep */}
        <div className="space-y-8">
          {/* AI Placement Copilot */}
          <div className="glass-card p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/20 border-indigo-500/10">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-indigo-500" />
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white">AI Placement Copilot</h3>
                <p className="text-[10px] text-slate-400">Target probability & core strategies</p>
              </div>
            </div>

            <div className="space-y-4">
              {copilot?.predictions ? (
                copilot.predictions.map((p) => (
                  <div key={p.company} className="bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
                    <div className="flex justify-between items-center font-bold text-xs">
                      <span className="text-slate-850 dark:text-slate-200">{p.company}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          p.probability >= 70
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : p.probability >= 50
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {p.probability}% Match
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">{p.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Synchronize coding platforms to trigger copilot models.</p>
              )}
            </div>
          </div>

          {/* Core Skills Radar */}
          <div className="glass-card p-5 rounded-2xl">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Skills Vector Graph</h4>
            <div className="h-56 flex items-center justify-center">
              <Radar
                data={radarChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
                      grid: { color: 'rgba(148, 163, 184, 0.2)' },
                      pointLabels: { color: '#94a3b8', font: { size: 9 } },
                      ticks: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
