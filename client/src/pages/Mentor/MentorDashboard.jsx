import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
import {
  Users,
  Award,
  FileText,
  Video,
  PlusCircle,
  X,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const MentorDashboard = ({ activeTab: initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'review'
  
  // Cohort Students List
  const [students, setStudents] = useState([]);
  
  // Selected Student Performance Detail
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentReport, setStudentReport] = useState(null);

  // Assign Task Form
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    studentId: '',
    taskDescription: '',
    category: 'revision', // 'coding' | 'resume' | 'revision'
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchCohort = async () => {
    try {
      const { data } = await API.get('/recruiter/students'); // reuse student query endpoint
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCohort();
  }, []);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setStudentReport(null);
    setTaskForm({ ...taskForm, studentId: student._id });
    try {
      const { data } = await API.get(`/mentor/students/${student._id}/report`);
      if (data.success) {
        setStudentReport(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskForm.taskDescription) {
      setError('Please provide task instructions.');
      return;
    }
    setError('');
    try {
      const { data } = await API.post('/mentor/assign-task', taskForm);
      if (data.success) {
        setMsg('Challenge successfully assigned to student daily planner!');
        setShowTaskModal(false);
        setTaskForm({
          studentId: selectedStudent?._id || '',
          taskDescription: '',
          category: 'revision',
        });
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
        });
      }
    } catch (err) {
      setError('Failed to assign task milestone.');
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10 max-w-6xl">
      {/* Header Info */}
      <div className="flex justify-between items-center border-b pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-855 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" /> Mentor Workspace Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track student portfolio statistics, audit automated resume reports, and assign custom challenge milestones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cohort Students list */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
            Cohort Candidates ({students.length})
          </h3>
          <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-2">
            {students.map((st) => {
              const isSelected = selectedStudent?._id === st._id;
              return (
                <button
                  key={st._id}
                  onClick={() => handleSelectStudent(st)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                      : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-xs">{st.name}</h4>
                    <p className={`text-[10px] ${isSelected ? 'text-slate-200' : 'text-slate-400'} mt-0.5`}>
                      Level {st.level} • XP {st.xp}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Selected Student Report details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent ? (
            <div className="space-y-6">
              
              {/* Header card with Assign Button */}
              <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-850 dark:text-white">
                    {selectedStudent.name} Performance Audit
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedStudent.email}</p>
                </div>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  <PlusCircle className="w-4 h-4" /> Assign Planner Milestone
                </button>
              </div>

              {/* Success Alert */}
              {msg && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl text-emerald-500 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 animate-bounce" />
                  <span>{msg}</span>
                </div>
              )}

              {/* Scorecard detail */}
              {studentReport ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resume Audit Card */}
                  <div className="glass-card p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-500" /> Resume Analyzer Metrics
                    </h4>
                    {studentReport.resumeReport ? (
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-200/20">
                          <span>Overall Score</span>
                          <span className="font-bold text-indigo-500">{studentReport.resumeReport.resumeScore}/100</span>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Missing Key Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {studentReport.resumeReport.missingSkills?.map((s, idx) => (
                              <span key={idx} className="bg-slate-150 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded font-semibold text-slate-655 dark:text-slate-350">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Resume not analyzed by student yet.</p>
                    )}
                  </div>

                  {/* Mock Interview Records Card */}
                  <div className="glass-card p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Video className="w-4.5 h-4.5 text-indigo-500" /> Virtual Mock rounds ({studentReport.interviewsHistory?.length || 0})
                    </h4>
                    <div className="space-y-3.5 max-h-48 overflow-y-auto pr-2">
                      {studentReport.interviewsHistory?.map((item) => (
                        <div key={item._id} className="p-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-200/20 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-indigo-500">{item.company} Mock</span>
                            <span className="text-slate-400">{item.isCompleted ? 'Completed' : 'Scheduled'}</span>
                          </div>
                          {item.scorecard && (
                            <div className="flex gap-3 text-[9px] text-slate-500 font-bold">
                              <span>Comm: {item.scorecard.communication}</span>
                              <span>Tech: {item.scorecard.technical}</span>
                              <span>Overall: {item.scorecard.overall}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {(!studentReport.interviewsHistory || studentReport.interviewsHistory.length === 0) && (
                        <p className="text-xs text-slate-400 italic">No mock rounds scheduled yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 animate-pulse text-slate-400 text-xs">
                  Loading detailed reports database...
                </div>
              )}

            </div>
          ) : (
            <div className="glass-card p-8 rounded-2xl text-center h-[350px] flex flex-col justify-center items-center text-slate-400">
              <Users className="w-12 h-12 text-indigo-500/20 mb-3" />
              <h4 className="font-bold text-slate-800 dark:text-white">Active cohort reviewer desk</h4>
              <p className="text-xs mt-2 max-w-xs leading-relaxed">
                Select a candidate from the cohort directory on the left to review their detailed scorecard, resume report, and scheduling profiles.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Task Assignment Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-500" /> Assign Planner Milestone
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 p-2.5 rounded-lg text-rose-500 text-[10px]">
                {error}
              </div>
            )}

            <form onSubmit={handleAssignTask} className="space-y-4 text-xs text-slate-700 dark:text-slate-200">
              <div className="space-y-1">
                <label className="font-semibold">Candidate Target</label>
                <input
                  type="text"
                  value={selectedStudent?.name || ''}
                  className="w-full p-2 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-400"
                  disabled
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Planner Category</label>
                <select
                  value={taskForm.category}
                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                >
                  <option value="coding">Coding Challenge (Sync Solves)</option>
                  <option value="resume">Resume Edit Action</option>
                  <option value="revision">Technical Syllabus Revision</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Instructions / Task Description *</label>
                <textarea
                  placeholder="Detail the challenge or topic goals for today..."
                  value={taskForm.taskDescription}
                  onChange={(e) => setTaskForm({ ...taskForm, taskDescription: e.target.value })}
                  rows="3"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow"
              >
                Assign Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
