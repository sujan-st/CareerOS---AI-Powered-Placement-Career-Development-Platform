import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import {
  Briefcase,
  Search,
  Users,
  CheckSquare,
  TrendingUp,
  Plus,
  ArrowUpRight,
  UserCheck,
  AlertCircle,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

const RecruiterDashboard = ({ activeTab: initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'jobs' | 'search'
  
  // Job Postings State
  const [jobs, setJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: 'Zoho',
    location: '',
    salary: '',
    skillsRequired: '',
    description: '',
  });

  // Candidate Search State
  const [students, setStudents] = useState([]);
  const [searchParams, setSearchParams] = useState({
    search: '',
    skills: '',
    minXp: '100',
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      const { data } = await API.get('/recruiter/jobs');
      if (data.success) {
        setJobs(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(searchParams).toString();
      const { data } = await API.get(`/recruiter/students?${query}`);
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchStudents();
  }, []);

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.skillsRequired) {
      setError('Please fill in required fields.');
      return;
    }
    setError('');
    try {
      const { data } = await API.post('/recruiter/jobs', {
        ...jobForm,
        skillsRequired: jobForm.skillsRequired.split(',').map((s) => s.trim()),
      });
      if (data.success) {
        setJobs([data.data, ...jobs]);
        setMsg('Job posting successfully listed!');
        setJobForm({
          title: '',
          company: 'Zoho',
          location: '',
          salary: '',
          skillsRequired: '',
          description: '',
        });
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
        });
      }
    } catch (err) {
      setError('Failed to create job posting.');
    }
  };

  const handleShortlist = async (jobId, studentId) => {
    try {
      const { data } = await API.post(`/recruiter/jobs/${jobId}/shortlist`, { studentId });
      if (data.success) {
        alert('Student successfully shortlisted for this opening!');
        fetchJobs();
      }
    } catch (err) {
      alert('Shortlist action failed.');
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10 max-w-6xl">
      {/* Header Info */}
      <div className="flex justify-between items-center border-b pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-855 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" /> Recruiter Desk Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish open postings, search matching student skill vectors, and coordinate shortlist pipelines.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {['overview', 'jobs', 'search'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                activeTab === t
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Sections switcher */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary metrics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Listed Openings</span>
                  <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{jobs.length}</p>
                </div>
                <Briefcase className="w-8 h-8 text-indigo-500/20" />
              </div>
              <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Calibrated Candidates</span>
                  <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-emerald-500/20" />
              </div>
            </div>

            {/* Quick list of jobs */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                Active Job Postings
              </h3>
              <div className="space-y-3.5">
                {jobs.map((jb) => (
                  <div key={jb._id} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-white">{jb.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{jb.company} • {jb.location || 'Chennai'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded font-bold">
                        {jb.shortlistedStudents.length} Shortlisted
                      </span>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <p className="text-center py-6 text-slate-400 text-xs">No active postings. Create one under the Jobs tab.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Post form */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl h-fit space-y-4">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-500" /> Create Job Listing
            </h3>

            {msg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg text-emerald-500 text-xs">
                {msg}
              </div>
            )}
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg text-rose-500 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleJobSubmit} className="space-y-3.5 text-xs text-slate-700 dark:text-slate-200">
              <div className="space-y-1">
                <label className="font-semibold">Job Title *</label>
                <input
                  type="text"
                  placeholder="Senior React Developer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold">Location</label>
                  <input
                    type="text"
                    placeholder="Chennai"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Salary Package</label>
                  <input
                    type="text"
                    placeholder="15 LPA"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Skills Required (comma-separated) *</label>
                <input
                  type="text"
                  placeholder="JavaScript, React, Node.js"
                  value={jobForm.skillsRequired}
                  onChange={(e) => setJobForm({ ...jobForm, skillsRequired: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Role Description</label>
                <textarea
                  placeholder="Brief summary of duties..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  rows="3"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
              >
                Publish Posting
              </button>
            </form>
          </div>

          {/* Jobs postings detailed layout */}
          <div className="lg:col-span-2 space-y-4">
            {jobs.map((jb) => (
              <div key={jb._id} className="glass-card p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">{jb.title}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{jb.company} • {jb.location || 'Chennai'}</p>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold">
                    {jb.salary || 'Competitive Package'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[9px] font-bold">
                  {jb.skillsRequired.map((s, idx) => (
                    <span key={idx} className="bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Candidate list component */}
                <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Shortlisted Applicants</p>
                  <div className="space-y-2">
                    {jb.shortlistedStudents.map((stId, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-350">Candidate ID: {stId}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Shortlisted</span>
                      </div>
                    ))}
                    {jb.shortlistedStudents.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic">No candidates shortlisted yet. Use Student Finder tab.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filtering sidebar */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl h-fit space-y-4">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <Search className="w-4 h-4 text-indigo-500" /> Filter Criteria
            </h3>

            <div className="space-y-3.5 text-xs text-slate-750 dark:text-slate-200">
              <div className="space-y-1">
                <label className="font-semibold">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sujan"
                  value={searchParams.search}
                  onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="JavaScript, React"
                  value={searchParams.skills}
                  onChange={(e) => setSearchParams({ ...searchParams, skills: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Minimum XP</label>
                <input
                  type="number"
                  placeholder="100"
                  value={searchParams.minXp}
                  onChange={(e) => setSearchParams({ ...searchParams, minXp: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                />
              </div>

              <button
                onClick={fetchStudents}
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
              >
                Query Database
              </button>
            </div>
          </div>

          {/* Students matched list */}
          <div className="lg:col-span-2 space-y-4">
            {students.map((st) => (
              <div key={st._id} className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center gap-1.5">
                      {st.name} <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded">Level {st.level}</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{st.email}</p>
                  </div>
                  <div className="flex gap-4 text-[10px] text-slate-500 font-medium">
                    <span>XP: {st.xp}</span>
                    <span>Badges Count: {st.badges?.length || 0}</span>
                  </div>
                </div>

                {/* Shortlist actions */}
                <div className="flex gap-2 self-start sm:self-center">
                  <select
                    id={`job-select-${st._id}`}
                    className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none text-slate-850 dark:text-white"
                  >
                    <option value="">Select Job Opening...</option>
                    {jobs.map((jb) => (
                      <option key={jb._id} value={jb._id}>{jb.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const selectEl = document.getElementById(`job-select-${st._id}`);
                      if (selectEl && selectEl.value) {
                        handleShortlist(selectEl.value, st._id);
                      } else {
                        alert('Please select a job opening to shortlist for.');
                      }
                    }}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold"
                  >
                    Shortlist
                  </button>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-center py-10 text-slate-400 text-xs">No matching candidate profiles found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
