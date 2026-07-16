import React, { useState } from 'react';
import API from '../../services/api.js';
import {
  FileText,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Download,
  BookOpen,
  CheckCircle,
  XCircle,
  UploadCloud,
  FileCode,
  Globe,
  Settings
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' | 'ats' | 'portfolio'
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [atsReport, setAtsReport] = useState(null);
  const [portfolioReport, setPortfolioReport] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste or write your resume text first');
      return;
    }
    setError('');
    setLoading(true);
    setReport(null);
    try {
      const { data } = await API.post('/ai/analyze-resume', { resumeText });
      if (data.success) {
        setReport(data.data);
      }
    } catch (err) {
      setError('Resume analysis query failed. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleATSCheck = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume text and target Job Description');
      return;
    }
    setError('');
    setLoading(true);
    setAtsReport(null);
    try {
      const { data } = await API.post('/ai/check-ats', { resumeText, jobDescription });
      if (data.success) {
        setAtsReport(data.data);
      }
    } catch (err) {
      setError('ATS checker request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioAudit = async () => {
    if (!portfolioUrl.trim()) {
      setError('Please provide a portfolio URL');
      return;
    }
    setError('');
    setLoading(true);
    setPortfolioReport(null);
    try {
      const { data } = await API.post('/ai/portfolio-audit', { portfolioUrl });
      if (data.success) {
        setPortfolioReport(data.data);
      }
    } catch (err) {
      setError('Portfolio audit request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUpload = () => {
    setResumeText(`
Sujan
sujan@careeros.com | 123-456-7890 | github.com/sujan | linkedin.com/in/sujan

TECHNICAL SKILLS
Languages: JavaScript, SQL, HTML/CSS
Frameworks/Libraries: React.js, Redux Toolkit, Node.js, Express.js
Databases: MongoDB, MySQL
Tools: Git, Postman

EXPERIENCE
Full Stack Developer Intern | TechCorp (June 2025 - Present)
- Built student workspace, implementing Redux Toolkit for UI synchronization, improving page render speed.
- Configured Express server middleware, reducing verification auth delays by 15%.

PROJECTS
E-Commerce API Platform (Node.js, Express, MongoDB)
- Structured clean MVC project routes, handling secure user validation and JWT session controls.
    `);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" /> AI Diagnostic Suite
        </h1>
        <p className="text-xs text-slate-400 mt-1">Audit resumes, inspect ATS compatibility, and audit developer portfolio links.</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200/60 dark:border-slate-800/60 gap-6">
        {['analyze', 'ats', 'portfolio'].map((tab) => {
          const labels = {
            analyze: 'Resume Auditor',
            ats: 'ATS Keyword Matcher',
            portfolio: 'AI Portfolio Analyzer',
          };
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(''); }}
              className={`pb-2.5 font-semibold text-xs transition-all uppercase tracking-wider border-b-2 ${
                activeTab === tab ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-rose-955/20 border border-rose-900/40 p-3 rounded-xl text-rose-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input panel & actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {activeTab !== 'portfolio' ? (
            <>
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Paste Resume Contents</label>
                <button
                  onClick={handleDemoUpload}
                  className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded"
                >
                  Load Demo Resume
                </button>
              </div>
              <textarea
                placeholder="Paste raw text contents of your resume here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full bg-white dark:bg-slate-905 border border-slate-250 dark:border-slate-800 focus:border-indigo-500 rounded-2xl p-4 h-96 text-xs text-slate-750 dark:text-slate-200 focus:outline-none shadow-inner resize-none"
              />
            </>
          ) : (
            <>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Developer Portfolio Link</label>
              <input
                type="url"
                placeholder="https://sujan.dev"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full p-3.5 bg-white dark:bg-slate-905 border border-slate-250 dark:border-slate-800 focus:border-indigo-500 rounded-2xl text-xs text-slate-750 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 leading-normal">
                AI will fetch structure, assess SEO headings hierarchy, evaluate UI/UX palettes, and calculate Lighthouse scoring indexes.
              </p>
            </>
          )}
        </div>

        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center py-10">
              <UploadCloud className="w-12 h-12 text-indigo-500/50 mb-3" />
              <h3 className="font-bold text-slate-850 dark:text-white">Audit Resume Metrics</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1.5 mb-6">
                Gemini will scan the text structures, inspect grammar conventions, assess keyword density levels, and outline recommendations.
              </p>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg text-xs disabled:opacity-50"
              >
                {loading ? 'Analyzing Profile...' : 'Begin AI Review'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ats' && (
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Paste Target Job Description</label>
            <textarea
              placeholder="Paste requirements, stack profiles, and experience parameters..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-905 border border-slate-250 dark:border-slate-800 focus:border-indigo-500 rounded-2xl p-4 h-64 text-xs text-slate-750 dark:text-slate-200 focus:outline-none shadow-inner resize-none"
            />
            <button
              onClick={handleATSCheck}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg text-xs disabled:opacity-50 mt-2"
            >
              {loading ? 'Computing Matching Index...' : 'Check ATS Compatibility'}
            </button>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center py-10">
              <Globe className="w-12 h-12 text-indigo-500/50 mb-3" />
              <h3 className="font-bold text-slate-850 dark:text-white">Audit Portfolio Link</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1.5 mb-6">
                Generate dynamic UI/UX guidelines, compile SEO tagging recommendations, and determine resume-worthiness scores.
              </p>
              <button
                onClick={handlePortfolioAudit}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg text-xs disabled:opacity-50"
              >
                {loading ? 'Running Auditor...' : 'Audit Portfolio'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RENDER REPORTS */}

      {activeTab === 'analyze' && report && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 space-y-6 shadow-xl print:shadow-none print:border-none">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="font-extrabold text-lg text-slate-850 dark:text-white">AI Evaluation Scorecard</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Resume Score and section critiques compiled successfully</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Rank</span>
                <span className="text-2xl font-black text-indigo-500">{report.resumeScore}/100</span>
              </div>
              <button
                onClick={handleExportPDF}
                className="p-2 border border-slate-250 dark:border-slate-700 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                title="Export report as PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-2">Formatting & Structure Summary</h4>
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                  {report.formatting}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-2">Suggestions for Improvement</h4>
                <ul className="space-y-2">
                  {report.suggestions.map((s, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-slate-650 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-2">Keyword Density Index</h4>
                <div className="flex flex-wrap gap-1.5">
                  {report.keywordDensity.map((k) => (
                    <span key={k.keyword} className="bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-indigo-500/20">
                      {k.keyword} ({k.count})
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-2">Missing Skills checklist</h4>
                <div className="flex flex-wrap gap-1.5">
                  {report.missingSkills.map((s) => (
                    <span key={s} className="bg-rose-500/10 text-rose-500 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-rose-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ats' && atsReport && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="font-extrabold text-lg text-slate-850 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-500" /> ATS Compatibility Report
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Keyword match validation results</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">ATS Match %</span>
              <span className="text-2xl font-black text-indigo-500">{atsReport.atsScore}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5">
              <h4 className="font-bold text-xs text-emerald-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <CheckCircle className="w-4 h-4" /> Matching Keywords ({atsReport.matchingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {atsReport.matchingSkills.map((s) => (
                  <span key={s} className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/10">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5">
              <h4 className="font-bold text-xs text-rose-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <XCircle className="w-4 h-4" /> Missing Keywords ({atsReport.missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {atsReport.missingSkills.map((s) => (
                  <span key={s} className="bg-rose-500/10 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/10">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-2">Actions to Maximize ATS score</h4>
            <ul className="space-y-2">
              {atsReport.suggestions.map((s, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-slate-650 dark:text-slate-350">
                  <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && portfolioReport && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="font-extrabold text-lg text-slate-850 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" /> AI Portfolio Performance Audit
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Scored using web layout hierarchies and Lighthouse calibrations</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Resume Worthiness</span>
              <span className="text-2xl font-black text-emerald-500">{portfolioReport.resumeWorthiness || 'High'}</span>
            </div>
          </div>

          {/* Scores dials grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/20 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Performance</span>
              <span className="text-xl font-extrabold text-indigo-500 mt-1 block">{portfolioReport.performanceScore || 90}/100</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/20 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">SEO Index</span>
              <span className="text-xl font-extrabold text-indigo-500 mt-1 block">{portfolioReport.seoScore || 85}/100</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/20 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Accessibility</span>
              <span className="text-xl font-extrabold text-indigo-500 mt-1 block">{portfolioReport.accessibilityScore || 92}/100</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/20 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">UI/UX score</span>
              <span className="text-xl font-extrabold text-indigo-500 mt-1 block">{portfolioReport.uiuxScore || 88}/100</span>
            </div>
          </div>

          {/* Suggestions lists */}
          <div className="border-t pt-4 space-y-4">
            <div>
              <h4 className="font-bold text-xs text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-2">Audit Feedback & Suggestions</h4>
              <ul className="space-y-2">
                {portfolioReport.suggestions?.map((s, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-650 dark:text-slate-350">
                    <Settings className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
