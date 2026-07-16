import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Building,
  Briefcase,
  Layers,
  Award,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Roadmaps = () => {
  const [role, setRole] = useState('Fullstack');
  const [company, setCompany] = useState('Google');
  const [completedWeeks, setCompletedWeeks] = useState([]);

  const roadmapData = {
    Fullstack: [
      { week: 1, topic: 'Advanced React Core & State Syncing', goals: ['Master Redux Toolkit slices', 'Build high-performance React Context components', 'Optimize render paths'] },
      { week: 2, topic: 'Node.js & Express MVC Architecture', goals: ['Configure helmet security policies', 'Implement MVC routing patterns', 'Write robust custom error middleware'] },
      { week: 3, topic: 'MongoDB Aggregations & Schema Normalization', goals: ['Draft schemas using Mongoose refs', 'Write lookup aggregate queries', 'Tune index performance'] },
      { week: 4, topic: 'Socket.io Core Real-Time Streams', goals: ['Establish client-server socket channels', 'Broadcast smart notifications', 'Implement message typing indicators'] },
      { week: 5, topic: 'Cloud Architectures & Containers', goals: ['Write multi-stage Dockerfiles', 'Deploy services to AWS ECS/EC2 instances', 'Configure Nginx reverse proxy'] }
    ],
    Frontend: [
      { week: 1, topic: 'Modern Styling Systems & Flex Grid', goals: ['Configure Tailwind configuration values', 'Build fully responsive mobile flex layouts', 'Write vanilla CSS glassmorphism styles'] },
      { week: 2, topic: 'Component Design Patterns', goals: ['Implement reusable compound elements', 'Control component memoization techniques', 'Write custom data hooks'] },
      { week: 3, topic: 'API Client Layer & Interceptors', goals: ['Establish Axios interceptor patterns', 'Synchronize browser cookies/headers', 'Handle auth token expiration redirects'] }
    ],
    Backend: [
      { week: 1, topic: 'Database Normalization & Query Tuning', goals: ['Design tables in third normal forms', 'Draft complex JOIN queries', 'Index query search bottlenecks'] },
      { week: 2, topic: 'RESTful API Standards & Validation', goals: ['Write validate-body middlewares', 'Enforce secure JWT session parameters', 'Document APIs using Swagger'] },
      { week: 3, topic: 'Queues & Memory Cache Tuning', goals: ['Configure Redis key expiration models', 'Coordinate background queues', 'Build rate limiter filters'] }
    ],
    AI: [
      { week: 1, topic: 'Prompt Engineering & Generative AI Models', goals: ['Call Gemini generative Flash engines', 'Write structured system instructions', 'Parse JSON text fallbacks'] },
      { week: 2, topic: 'Machine Learning Pipelines', goals: ['Clean feature vectors', 'Train simple regression model paths', 'Evaluate predictions accuracy'] }
    ]
  };

  const activeWeeks = roadmapData[role] || roadmapData.Fullstack;

  const handleToggleWeek = (weekNum) => {
    if (completedWeeks.includes(weekNum)) {
      setCompletedWeeks(completedWeeks.filter((w) => w !== weekNum));
    } else {
      const nextWeeks = [...completedWeeks, weekNum];
      setCompletedWeeks(nextWeeks);
      
      // Celebrate if checking off a week
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.8 },
      });

      if (nextWeeks.length === activeWeeks.length) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    }
  };

  const progressPercentage = Math.round((completedWeeks.length / activeWeeks.length) * 100) || 0;

  return (
    <div className="space-y-8 font-sans pb-10 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-855 dark:text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-500" /> AI Skill Gap Roadmap
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select target career paths and dream company filters to generate a weekly syllabus tailored by CareerOS algorithms.
        </p>
      </div>

      {/* Selectors Form */}
      <div className="glass-card p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
          <label className="font-bold flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-indigo-500" /> Target Role Specialization
          </label>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setCompletedWeeks([]);
            }}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
          >
            <option value="Fullstack">Fullstack MERN Engineer</option>
            <option value="Frontend">Frontend Specialist</option>
            <option value="Backend">Backend API Architect</option>
            <option value="AI">AI/ML Solutions Architect</option>
          </select>
        </div>

        <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
          <label className="font-bold flex items-center gap-1.5">
            <Building className="w-4 h-4 text-indigo-500" /> Target Company Filter
          </label>
          <select
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              setCompletedWeeks([]);
            }}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
          >
            <option value="Google">Google (Tier-1 DSA + System Design)</option>
            <option value="Zoho">Zoho (Hands-on JS/Java Rounds)</option>
            <option value="Microsoft">Microsoft (Data Structures + Scalability)</option>
          </select>
        </div>
      </div>

      {/* Progress tracker widget */}
      <div className="glass-card p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="sm:col-span-2">
          <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
            <Layers className="w-4.5 h-4.5 text-indigo-500" /> Syllabus Progress Metrics
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Complete weekly topics to verify required developer checkpoints.
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-indigo-650 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <div className="text-center sm:text-right">
          <span className="text-3xl font-black text-slate-855 dark:text-white">{progressPercentage}%</span>
          <p className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Syllabus Covered</p>
        </div>
      </div>

      {/* Weekly timeline checklist */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
          Syllabus Timeline Weeks
        </h3>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 pl-6 ml-3 space-y-8">
          {activeWeeks.map((wk) => {
            const isDone = completedWeeks.includes(wk.week);
            return (
              <div key={wk.week} className="relative">
                {/* Timeline Dot Indicator */}
                <button
                  onClick={() => handleToggleWeek(wk.week)}
                  className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-400 hover:border-indigo-500'
                  }`}
                  title="Check off Week"
                >
                  {isDone ? <CheckCircle className="w-3.5 h-3.5 fill-white text-emerald-500" /> : <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-800 rounded-full" />}
                </button>

                {/* Content Panel */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-400'
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Week {wk.week}
                    </span>
                    {isDone && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Week Completed
                      </span>
                    )}
                  </div>

                  <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-850 dark:text-white'}`}>
                    {wk.topic}
                  </h4>

                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                      Weekly Focus Checkpoints
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      {wk.goals.map((goal, gIdx) => (
                        <li key={gIdx} className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className={isDone ? 'line-through text-slate-400' : 'text-slate-650 dark:text-slate-350'}>
                            {goal}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Roadmaps;
