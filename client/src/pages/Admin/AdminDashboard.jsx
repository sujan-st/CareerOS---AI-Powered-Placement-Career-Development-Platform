import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import {
  Shield,
  Activity,
  Users,
  Trophy,
  BarChart,
  Video,
  Award,
  Circle,
  Database
} from 'lucide-react';

const AdminDashboard = ({ activeTab: initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'users'
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      try {
        const { data } = await API.get('/admin/metrics');
        if (data.success) {
          setMetrics(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse p-4">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-96">
          <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-10 max-w-5xl">
      {/* Header Info */}
      <div className="flex justify-between items-center border-b pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-855 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" /> Admin System Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global platform metrics tracker, AI API quota balances, and student top performers rankings.
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-700 dark:text-slate-200">
        
        {/* Total Students */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Students Cohort</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{metrics?.users?.students || 0}</p>
          </div>
          <Users className="w-8 h-8 text-indigo-500/20" />
        </div>

        {/* Total Recruiters */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recruiters Listed</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{metrics?.users?.recruiters || 0}</p>
          </div>
          <Users className="w-8 h-8 text-emerald-500/20" />
        </div>

        {/* Total Interviews */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Mock Rounds</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{metrics?.interviews?.total || 0}</p>
          </div>
          <Video className="w-8 h-8 text-amber-500/20" />
        </div>

        {/* Placement Offers */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Placement Offers</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{metrics?.placements?.offers || 0}</p>
          </div>
          <Award className="w-8 h-8 text-rose-500/20" />
        </div>
      </div>

      {/* Aggregates Split details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4.5 h-4.5 text-yellow-500" /> Platform Top Performers
            </h3>

            <div className="space-y-3 text-xs">
              {metrics?.topPerformers?.map((st, idx) => (
                <div key={st._id} className="p-3 bg-slate-100/30 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-indigo-500/10 text-indigo-500 font-extrabold text-[10px] flex items-center justify-center rounded-full border border-indigo-500/20">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-850 dark:text-white">{st.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{st.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-850 dark:text-white">Lvl {st.level}</span>
                    <p className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">{st.xp} XP</p>
                  </div>
                </div>
              ))}
              {(!metrics?.topPerformers || metrics.topPerformers.length === 0) && (
                <p className="text-center py-6 text-slate-400 text-xs">No students registered yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: AI Resources balances */}
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Database className="w-4.5 h-4.5 text-indigo-500" /> API Quotas & Token Balance
            </h3>

            <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span>Gemini flash 1.5 Tokens</span>
                  <span>{metrics?.aiUsageMockCount * 1200 || 12000} / 500k</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-650 h-full rounded-full w-1/12" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span>SMTP Outbound Emails</span>
                  <span>{metrics?.placements?.offers + metrics?.interviews?.total || 5} / 1000</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full w-2/12" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
