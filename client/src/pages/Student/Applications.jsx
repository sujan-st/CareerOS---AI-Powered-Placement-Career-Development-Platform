import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import {
  Trello,
  Plus,
  Briefcase,
  TrendingUp,
  MapPin,
  Calendar,
  X,
  Trash2,
  ChevronRight,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Applications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Form parameters
  const [form, setForm] = useState({
    companyName: '',
    role: '',
    status: 'Applied',
    location: '',
    salaryPackage: '',
    jobDescription: '',
  });

  const fetchApplications = async () => {
    try {
      const { data } = await API.get('/student/applications');
      if (data.success) {
        setApps(data.data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddApplication = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.role) {
      setError('Company Name and Role are required.');
      return;
    }
    setError('');
    try {
      const { data } = await API.post('/student/applications', form);
      if (data.success) {
        setApps([data.data, ...apps]);
        setShowModal(false);
        setForm({
          companyName: '',
          role: '',
          status: 'Applied',
          location: '',
          salaryPackage: '',
          jobDescription: '',
        });
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
        });
      }
    } catch (err) {
      setError('Failed to record job application.');
    }
  };

  const handleAdvanceStatus = async (appId, currentStatus) => {
    let nextStatus = 'Applied';
    if (currentStatus === 'Applied') nextStatus = 'Interviewing';
    else if (currentStatus === 'Interviewing') nextStatus = 'Offer';
    else if (currentStatus === 'Offer') nextStatus = 'Joined';

    try {
      const { data } = await API.put(`/student/applications/${appId}`, { status: nextStatus });
      if (data.success) {
        setApps(apps.map((a) => (a._id === appId ? data.data : a)));
        if (nextStatus === 'Offer') {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
          });
        }
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleRejectStatus = async (appId) => {
    try {
      const { data } = await API.put(`/student/applications/${appId}`, { status: 'Rejected' });
      if (data.success) {
        setApps(apps.map((a) => (a._id === appId ? data.data : a)));
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm('Remove this application record?')) return;
    try {
      const { data } = await API.delete(`/student/applications/${appId}`);
      if (data.success) {
        setApps(apps.filter((a) => a._id !== appId));
      }
    } catch (err) {
      alert('Error deleting application.');
    }
  };

  const getAppsByStatus = (statusName) => {
    return apps.filter((a) => a.status === statusName);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse p-4">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-96">
          <div className="bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Statistics heuristics
  const offersCount = apps.filter((a) => a.status === 'Offer' || a.status === 'Joined').length;
  const interviewsCount = apps.filter((a) => a.status === 'Interviewing').length;

  return (
    <div className="space-y-8 font-sans pb-10 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
            <Trello className="w-6 h-6 text-indigo-500" /> Applications CRM Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Keep tabs on target listings, interviews pipeline schedules, and contract offer agreements.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/20"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total Pipeline</span>
            <p className="text-2xl font-black text-slate-850 dark:text-white mt-1">{apps.length}</p>
          </div>
          <Briefcase className="w-8 h-8 text-indigo-500/20" />
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Active Interviews</span>
            <p className="text-2xl font-black text-slate-850 dark:text-white mt-1">{interviewsCount}</p>
          </div>
          <Calendar className="w-8 h-8 text-amber-500/20" />
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Offers Secured</span>
            <p className="text-2xl font-black text-slate-850 dark:text-white mt-1">{offersCount}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-500/20" />
        </div>
      </div>

      {/* Kanban Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['Applied', 'Interviewing', 'Offer', 'Rejected'].map((status) => {
          const colApps = getAppsByStatus(status);
          const colColors = {
            Applied: 'border-t-indigo-500',
            Interviewing: 'border-t-amber-500',
            Offer: 'border-t-emerald-500',
            Rejected: 'border-t-rose-500',
          };
          return (
            <div
              key={status}
              className={`bg-white/30 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex flex-col min-h-[480px] border-t-4 ${colColors[status]}`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                  {status}
                </span>
                <span className="px-2 py-0.5 bg-slate-200/50 dark:bg-slate-800 text-[10px] font-bold rounded-full text-slate-500">
                  {colApps.length}
                </span>
              </div>

              <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[500px]">
                {colApps.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-250 dark:border-slate-800 rounded-xl text-slate-400 text-[10px]">
                    No entries
                  </div>
                ) : (
                  colApps.map((a) => (
                    <div
                      key={a._id}
                      className="glass-card p-4 rounded-xl border relative hover:shadow-md transition-shadow group space-y-3"
                    >
                      <button
                        onClick={() => handleDeleteApplication(a._id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        <h4 className="font-extrabold text-xs text-slate-850 dark:text-white">{a.companyName}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{a.role}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[9px] text-slate-550 dark:text-slate-400">
                        {a.location && (
                          <span className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded">
                            <MapPin className="w-2.5 h-2.5" /> {a.location}
                          </span>
                        )}
                        {a.salaryPackage && (
                          <span className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded">
                            <DollarSign className="w-2.5 h-2.5 text-emerald-500" /> {a.salaryPackage}
                          </span>
                        )}
                      </div>

                      {/* Transition button */}
                      {status !== 'Rejected' && status !== 'Joined' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleAdvanceStatus(a._id, a.status)}
                            className="flex-1 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 hover:bg-indigo-650 hover:text-white rounded text-[9px] font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <span>Move Next</span> <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRejectStatus(a._id)}
                            className="py-1.5 px-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 hover:bg-rose-650 hover:text-white rounded text-[9px] font-bold transition-all"
                            title="Mark as Rejected"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Add Job Application
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 p-2.5 rounded-lg text-rose-500 text-[10px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddApplication} className="space-y-3.5 text-xs text-slate-700 dark:text-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleInputChange}
                    placeholder="Google, Zoho"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Target Role *</label>
                  <input
                    type="text"
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    placeholder="MERN Stack Dev"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    placeholder="Remote, Chennai"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Salary Package (LPA / $)</label>
                  <input
                    type="text"
                    name="salaryPackage"
                    value={form.salaryPackage}
                    onChange={handleInputChange}
                    placeholder="12 LPA"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Status Stage</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Job Description / Notes</label>
                <textarea
                  name="jobDescription"
                  value={form.jobDescription}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Paste details or interview round logs here..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md"
              >
                Create Application Card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
