import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../../services/api.js';
import {
  Sparkles,
  TrendingUp,
  Brain,
  Award,
  AlertTriangle,
  Building,
  Target,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Copilot = () => {
  const { user } = useSelector((state) => state.auth);
  const [copilotData, setCopilotData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected company simulation
  const [activeCompany, setActiveCompany] = useState('Google');

  const companyStats = {
    Google: {
      probability: 78,
      dsaRequired: 'High',
      systemsRequired: 'High',
      strengths: ['Robust MERN fullstack architecture competence', 'Good coding consistency'],
      weaknesses: ['Advanced graphs & dynamic programming', 'Missing containerization (Docker)', 'Missing cloud services (AWS)'],
      improvementActions: [
        { task: 'Complete 15 Medium DSA challenges on LeetCode', impact: '+7%' },
        { task: 'Dockerize your CareerOS backend and push to AWS ECS', impact: '+5%' },
        { task: 'Enhance resume summary section with active verbs', impact: '+2%' }
      ],
      expectedGain: 12
    },
    Zoho: {
      probability: 88,
      dsaRequired: 'Medium',
      systemsRequired: 'Medium',
      strengths: ['Excellent JavaScript core expertise', 'High projects count'],
      weaknesses: ['Java foundations', 'Relational database schemas normalization'],
      improvementActions: [
        { task: 'Implement SQL normalization challenge', impact: '+6%' },
        { task: 'Review OOPS concepts in Java', impact: '+4%' }
      ],
      expectedGain: 10
    },
    Microsoft: {
      probability: 72,
      dsaRequired: 'High',
      systemsRequired: 'High',
      strengths: ['Clean architectural pattern practices', 'Solid OS fundamentals'],
      weaknesses: ['System Design scalability calculations', 'Low Hard solves ratio'],
      improvementActions: [
        { task: 'Draft a mock TinyURL architecture diagram', impact: '+8%' },
        { task: 'Perform mock behavioral round practices', impact: '+5%' }
      ],
      expectedGain: 13
    },
    Infosys: {
      probability: 92,
      dsaRequired: 'Low',
      systemsRequired: 'Low',
      strengths: ['Great communication scorecard', 'Strong frontend projects'],
      weaknesses: ['Basic SQL indexing', 'No significant weaknesses for entry criteria'],
      improvementActions: [
        { task: 'Complete standard database indexing tutorials', impact: '+4%' }
      ],
      expectedGain: 4
    },
    TCS: {
      probability: 95,
      dsaRequired: 'Low',
      systemsRequired: 'Low',
      strengths: ['Consistently high academic records', 'React web apps portfolio'],
      weaknesses: ['None for priority criteria'],
      improvementActions: [
        { task: 'Run a mock aptitude round', impact: '+3%' }
      ],
      expectedGain: 3
    }
  };

  useEffect(() => {
    const fetchCopilotData = async () => {
      try {
        const { data } = await API.get('/student/copilot');
        if (data.success) {
          setCopilotData(data.data);
        }
      } catch (err) {
        console.error('Copilot API fail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCopilotData();
  }, []);

  const triggerCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse p-4">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const selectedStats = companyStats[activeCompany] || companyStats.Google;

  return (
    <div className="space-y-8 font-sans pb-10 max-w-6xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-500" /> AI Placement Copilot
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Your central cognitive agent compiling resume scores, coding consistency, and interview analytics to predict landing probabilities.
        </p>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: General Profile Status & Company Cards */}
        <div className="space-y-6 lg:col-span-1">
          {/* Overall Scorecard Dial */}
          <div className="glass-card p-6 rounded-2xl text-center flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-wider">
              Profile Readiness Vector
            </h3>
            
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="76"
                  stroke="rgba(99, 102, 241, 0.1)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="76"
                  stroke="#4f46e5"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 76}
                  strokeDashoffset={2 * Math.PI * 76 * (1 - 0.78)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="text-center z-10">
                <span className="text-4xl font-black text-slate-850 dark:text-white">78%</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Excellent</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 leading-relaxed">
              Your score is computed from your <strong className="text-indigo-500">Resume score (78)</strong>, active coding solves, and completed mock rounds.
            </p>
            <button
              onClick={triggerCelebrate}
              className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Claim Calibration XP
            </button>
          </div>

          {/* Company Target List */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
              Target Company Probabilities
            </h4>
            {Object.keys(companyStats).map((name) => {
              const item = companyStats[name];
              const isSelected = activeCompany === name;
              return (
                <button
                  key={name}
                  onClick={() => setActiveCompany(name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-650/20'
                      : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <Building className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div>
                      <span className="font-bold text-xs">{name}</span>
                      <p className={`text-[10px] ${isSelected ? 'text-slate-200' : 'text-slate-400'} mt-0.5`}>
                        Difficulty: {item.dsaRequired === 'High' ? 'Tier-1 DSA' : 'Standard'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs">{item.probability}%</span>
                    <p className={`text-[9px] ${isSelected ? 'text-slate-200' : 'text-slate-500'} uppercase font-semibold mt-0.5`}>
                      Match
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Predictions & AI Explanations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detailed Diagnosis Card */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-2xl" />
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-5 mb-6">
              <div>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  AI Fit Assessment
                </span>
                <h3 className="text-xl font-extrabold text-slate-850 dark:text-white mt-3 flex items-center gap-2">
                  {activeCompany} Placement Analytics
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Target className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-lg font-black text-slate-850 dark:text-white leading-none">{selectedStats.probability}%</p>
                  <p className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-400 mt-0.5">Success Likelihood</p>
                </div>
              </div>
            </div>

            {/* Sub-grid of insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Strengths
                </h4>
                <div className="space-y-2">
                  {selectedStats.strengths.map((str, idx) => (
                    <div key={idx} className="p-3 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-xl text-[11px] text-slate-650 dark:text-emerald-350 font-medium leading-relaxed">
                      {str}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Core Skill Gaps
                </h4>
                <div className="space-y-2">
                  {selectedStats.weaknesses.map((weak, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-500/10 rounded-xl text-[11px] text-slate-650 dark:text-amber-350 font-medium leading-relaxed">
                      {weak}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action items roadmap planner */}
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-500" /> Recommended Calibration Roadmap
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Completing these specific items will bridge the skills gaps and yield immediate probability calibration gains.
              </p>
            </div>

            <div className="space-y-3">
              {selectedStats.improvementActions.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-slate-100/30 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-indigo-500/10 text-indigo-500 font-extrabold text-[10px] flex items-center justify-center rounded-full border border-indigo-500/20">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-700 dark:text-slate-350 font-semibold">{act.task}</span>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-bold">
                    {act.impact}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/50 dark:bg-slate-950/50 border border-slate-250 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="font-bold text-indigo-200">Target Readiness Upgrade</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Estimated probability score after tasks verification.</p>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-400">
                {selectedStats.probability + selectedStats.expectedGain}% (+{selectedStats.expectedGain}%)
              </span>
            </div>
          </div>

          {/* AI Placement Copilot Memory Insights */}
          {copilotData && (
            <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-indigo-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Active Placement Copilot Recommendations</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Focus suggestion: <strong className="text-indigo-400 font-semibold">{copilotData.suggestedFocus}</strong>
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Copilot;
