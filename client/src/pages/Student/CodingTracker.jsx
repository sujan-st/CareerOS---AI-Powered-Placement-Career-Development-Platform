import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateGamificationStats } from '../../redux/slices/authSlice.js';
import API from '../../services/api.js';
import {
  Trophy,
  Github,
  Award,
  Activity,
  Code2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Globe
} from 'lucide-react';

const CodingTracker = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Usernames form
  const [handles, setHandles] = useState({
    githubUsername: '',
    leetcodeUsername: '',
    codeforcesUsername: '',
    hackerrankUsername: '',
    codechefUsername: '',
  });

  useEffect(() => {
    // Initial fetch of dashboard metrics to seed visual variables
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/student/dashboard');
        if (data.success && data.data.codingProgress) {
          setStats(data.data.codingProgress);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleInputChange = (e) => {
    setHandles({ ...handles, [e.target.name]: e.target.value });
  };

  const handleSyncSubmit = async (e) => {
    e.preventDefault();
    setSyncing(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const { data } = await API.post('/student/coding/sync', handles);
      if (data.success) {
        setStats(data.data.solvedProblems);
        setSuccessMsg('Coding accounts successfully synced! Earned 25 XP.');
        
        // Update gamification stats locally
        dispatch(updateGamificationStats({
          xp: user.xp + 25,
          coins: user.coins + 10,
          level: user.level,
          badges: user.badges,
        }));
      }
    } catch (err) {
      setErrorMsg('Failed to scrape statistics from specified accounts.');
    } finally {
      setSyncing(false);
    }
  };

  // Mock heatmap 30 days grid color resolution
  const heatmapBoxes = Array.from({ length: 35 }, (_, idx) => {
    const weights = [0, 1, 0, 2, 0, 4, 3, 0, 2, 1, 0, 0, 4, 2, 1, 0, 3, 0, 2, 4, 1, 0, 3, 0, 1, 2, 0, 4, 0, 0, 3, 2, 1, 0, 2];
    const weight = weights[idx % weights.length];
    const colors = {
      0: 'bg-slate-100 dark:bg-slate-900',
      1: 'bg-emerald-800/20 text-emerald-800',
      2: 'bg-emerald-800/40 text-emerald-700',
      3: 'bg-emerald-800/60 text-emerald-600',
      4: 'bg-emerald-600 text-white',
    };
    return { day: idx + 1, level: weight, colorClass: colors[weight] };
  });

  return (
    <div className="space-y-8 font-sans pb-10 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-indigo-500" /> Coding Tracker
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Synchronize public coding profiles, monitor daily solved milestones, and unlock preparational rank badges.
        </p>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Solved Stats & Sync Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats widgets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Total solved</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats?.total || 46}</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center border-l-4 border-emerald-500">
              <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Easy solves</span>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{stats?.easy || 15}</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center border-l-4 border-amber-500">
              <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Medium solves</span>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{stats?.medium || 25}</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center border-l-4 border-rose-500">
              <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Hard solves</span>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{stats?.hard || 6}</p>
            </div>
          </div>

          {/* Activity Heatmap Grid */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500" /> Solved Heatmap (Last 30 Days)
            </h3>
            <div className="flex flex-wrap gap-2">
              {heatmapBoxes.map((box) => (
                <div
                  key={box.day}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border border-slate-200/20 ${box.colorClass}`}
                  title={`Day ${box.day}: ${box.level} submissions`}
                >
                  {box.day}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
              <span>Less</span>
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/20 rounded" />
                <span className="w-2.5 h-2.5 bg-emerald-800/20 rounded" />
                <span className="w-2.5 h-2.5 bg-emerald-800/40 rounded" />
                <span className="w-2.5 h-2.5 bg-emerald-800/60 rounded" />
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded" />
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Sync Username Handles Form */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                <Code2 className="w-4.5 h-4.5 text-indigo-500" /> Sync Developer Accounts
              </h3>
              <Globe className="w-4 h-4 text-slate-400" />
            </div>

            {successMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg text-emerald-500 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 p-3 rounded-lg text-rose-500 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSyncSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-300">GitHub handle</label>
                <div className="relative">
                  <Github className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-450" />
                  <input
                    type="text"
                    name="githubUsername"
                    value={handles.githubUsername}
                    onChange={handleInputChange}
                    placeholder="github_dev"
                    className="w-full p-2 pl-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-300">LeetCode Username</label>
                <input
                  type="text"
                  name="leetcodeUsername"
                  value={handles.leetcodeUsername}
                  onChange={handleInputChange}
                  placeholder="leetcode_ninja"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Codeforces Username</label>
                <input
                  type="text"
                  name="codeforcesUsername"
                  value={handles.codeforcesUsername}
                  onChange={handleInputChange}
                  placeholder="forces_guru"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-300">HackerRank Username</label>
                <input
                  type="text"
                  name="hackerrankUsername"
                  value={handles.hackerrankUsername}
                  onChange={handleInputChange}
                  placeholder="hr_master"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={syncing}
                className="w-full sm:col-span-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-650/50 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 mt-2 transition-all shadow-md shadow-indigo-650/15"
              >
                {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{syncing ? 'Syncing profiles...' : 'Sync profiles'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Badges & Achievements */}
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-indigo-500" /> Unlocked achievements
            </h3>
            
            <div className="space-y-3">
              {user?.badges && user.badges.length > 0 ? (
                user.badges.map((badge, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl items-center">
                    <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/20">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-none">{badge.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{badge.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Sync profiles or solve tasks to unlock badges!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CodingTracker;
