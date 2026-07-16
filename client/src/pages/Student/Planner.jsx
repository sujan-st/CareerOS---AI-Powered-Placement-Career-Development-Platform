import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateGamificationStats } from '../../redux/slices/authSlice.js';
import API from '../../services/api.js';
import {
  CheckSquare,
  Clock,
  Award,
  Sparkles,
  Flame,
  HelpCircle,
  CheckCircle,
  RotateCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Planner = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlanner = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/ai/planner');
      if (data.success) {
        setPlanner(data.data);
      }
    } catch (err) {
      setError('Failed to fetch daily planner checklist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner();
  }, []);

  const handleTaskCheck = async (taskKey) => {
    if (!planner || planner.completedTasks.includes(taskKey)) return;

    try {
      const updatedTasks = [...planner.completedTasks, taskKey];
      
      // Update local UI state
      setPlanner({ ...planner, completedTasks: updatedTasks });

      // Save in MongoDB via our new PUT endpoint
      await API.put('/ai/planner', { completedTasks: updatedTasks });

      // Trigger Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
      });

      // Claim Gamification Stats: Award 20 XP and 10 Coins
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

      dispatch(updateGamificationStats({
        xp: nextXp,
        coins: nextCoins,
        level: nextLevel,
        badges,
      }));

    } catch (err) {
      console.error('Failed to update task state:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse p-4">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        <div className="space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const tasks = [
    { key: 'codingGoal', label: 'Daily Coding Objective', desc: planner?.codingGoal || 'Solve 3 Array exercises' },
    { key: 'resumeTask', label: 'Resume Improvement Step', desc: planner?.resumeTask || 'Update projects section description' },
    { key: 'revisionTopic', label: 'Revision Knowledge Check', desc: planner?.revisionTopic || 'Revise React Hooks lifecycle details' },
    { key: 'mockInterviewGoal', label: 'Virtual Interview Challenge', desc: planner?.mockInterviewGoal || 'Run a quick Behavioral mockup round' },
    { key: 'jobApplicationGoal', label: 'Job Application Milestone', desc: planner?.jobApplicationGoal || 'Submit 2 customized applications' },
  ];

  const totalCount = tasks.length;
  const completedCount = planner?.completedTasks.length || 0;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-8 font-sans pb-10 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-855 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" /> AI Daily Planner
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete daily objectives customized by the AI agent to boost placement probability statistics.
          </p>
        </div>
        <button
          onClick={fetchPlanner}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all self-start sm:self-center"
        >
          <RotateCw className="w-3.5 h-3.5" /> Re-Sync
        </button>
      </div>

      {/* Date Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 to-slate-950 p-6 rounded-2xl text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Motivation of the Day</span>
            <p className="text-sm font-semibold italic max-w-2xl leading-relaxed text-slate-200">
              "{planner?.dailyMotivation || 'Keep consistent. Small code changes result in massive placement accomplishments over time.'}"
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl self-start">
            <Flame className="w-6 h-6 text-rose-500 animate-bounce" />
            <div>
              <p className="text-lg font-black leading-none">{user?.dailyStreak || 1}</p>
              <p className="text-[9px] uppercase font-bold text-slate-350 mt-1">Streak days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Tracker Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between col-span-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Progress Vector</span>
            <p className="text-3xl font-black text-slate-850 dark:text-white mt-1">{completionPercentage}%</p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
              <div
                className="bg-indigo-650 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-4">
            Completed {completedCount} out of {totalCount} goals. Earn <strong className="text-emerald-500">+20 XP</strong> per completed item!
          </div>
        </div>

        {/* Estimated Time Card */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 col-span-1">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Effort</span>
            <p className="text-2xl font-black text-slate-855 dark:text-white mt-1">
              {planner?.estimatedCompletionTimeMinutes || 90} mins
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Estimated timeline checklist duration.</p>
          </div>
        </div>

        {/* Level Reward Card */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 col-span-1">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Prep Rank</span>
            <p className="text-2xl font-black text-slate-855 dark:text-white mt-1">Level {user?.level}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{user?.xp % 100}/100 XP to next level.</p>
          </div>
        </div>
      </div>

      {/* Task list checkpoints */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
          Daily Checklist Goals
        </h3>
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = planner?.completedTasks.includes(task.key);
            return (
              <div
                key={task.key}
                onClick={() => handleTaskCheck(task.key)}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer select-none ${
                  isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <CheckCircle className={`w-5 h-5 ${isCompleted ? 'fill-emerald-500 text-white dark:text-slate-950' : 'text-slate-200'}`} />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-850 dark:text-white'}`}>
                      {task.label}
                    </h4>
                    <p className={`text-[11px] mt-1 ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-550 dark:text-slate-400'}`}>
                      {task.desc}
                    </p>
                  </div>
                </div>
                {isCompleted && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Checked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Planner;
