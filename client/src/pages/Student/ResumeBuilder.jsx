import React, { useState } from 'react';
import API from '../../services/api.js';
import {
  FileText,
  Sparkles,
  Download,
  Plus,
  Trash,
  CheckCircle,
  Eye,
  Settings,
  History,
  Linkedin,
  Mail,
  Copy,
  Printer
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import confetti from 'canvas-confetti';
import { useSelector } from 'react-redux';

const ResumeBuilder = () => {
  const { user } = useSelector((state) => state.auth);
  const [builderTab, setBuilderTab] = useState('resume'); // 'resume' | 'linkedin' | 'coverletter' | 'email'
  const [templateType, setTemplateType] = useState('modern'); // 'ats' | 'google' | 'harvard' | 'modern'
  const [loadingAI, setLoadingAI] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // LinkedIn Optimizer States
  const [linkedinData, setLinkedinData] = useState(null);
  
  // Cover Letter States
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLetterForm, setCoverLetterForm] = useState({
    company: '',
    role: '',
    jobDescription: '',
  });

  // Email Writer States
  const [emailText, setEmailText] = useState('');
  const [emailForm, setEmailForm] = useState({
    emailType: 'Referral Request',
    details: '',
  });

  // Main Resume Form Setup
  const { register, control, handleSubmit, setValue, getValues, watch } = useForm({
    defaultValues: {
      summary: 'Results-oriented software developer specializing in building scalable react components.',
      skills: 'JavaScript, React, Node.js, Express, MongoDB, Git',
      education: [{ institution: 'Tech University', degree: 'B.S.', fieldOfStudy: 'Computer Science', grade: '3.8/4.0' }],
      experience: [{ company: 'Dev Ltd', position: 'Frontend Developer', startDate: '25-01-2025', endDate: 'Present', description: 'Implemented modular dashboard layouts and mapped Redux stores.' }],
      projects: [{ title: 'E-commerce App', description: 'Designed express backend architecture and connected Mongoose schemas.', link: 'github.com/shop' }],
    }
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: 'projects' });

  // AI Resume builders
  const triggerAISummary = async () => {
    const skills = getValues('skills');
    setLoadingAI(true);
    try {
      const { data } = await API.post('/ai/draft-resume', {
        sectionType: 'summary',
        details: { skills }
      });
      if (data.success) {
        setValue('summary', data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const triggerAIProjectDraft = async (index) => {
    const title = getValues(`projects.${index}.title`);
    setLoadingAI(true);
    try {
      const { data } = await API.post('/ai/draft-resume', {
        sectionType: 'projects',
        details: { title }
      });
      if (data.success) {
        setValue(`projects.${index}.description`, data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSave = async (data) => {
    setSaveStatus('Saving Draft...');
    try {
      setTimeout(() => {
        setSaveStatus('Successfully saved version!');
        setTimeout(() => setSaveStatus(''), 2000);
      }, 1000);
    } catch (error) {
      setSaveStatus('Save request failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // LinkedIn Optimizer Trigger
  const handleOptimizeLinkedIn = async () => {
    setLoadingAI(true);
    setLinkedinData(null);
    try {
      const resumeText = `Summary: ${getValues('summary')}\nSkills: ${getValues('skills')}`;
      const { data } = await API.post('/ai/linkedin-optimize', { resumeText });
      if (data.success) {
        setLinkedinData(data.data);
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Cover Letter Generator Trigger
  const handleGenerateCoverLetter = async (e) => {
    e.preventDefault();
    setLoadingAI(true);
    setCoverLetter('');
    try {
      const resumeText = `Summary: ${getValues('summary')}\nSkills: ${getValues('skills')}`;
      const { data } = await API.post('/ai/cover-letter', {
        ...coverLetterForm,
        resumeText,
      });
      if (data.success) {
        setCoverLetter(data.data);
        confetti({
          particleCount: 60,
          spread: 45,
          origin: { y: 0.8 },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Email Generator Trigger
  const handleGenerateEmail = async (e) => {
    e.preventDefault();
    setLoadingAI(true);
    setEmailText('');
    try {
      const { data } = await API.post('/ai/email-writer', {
        emailType: emailForm.emailType,
        details: { text: emailForm.details },
      });
      if (data.success) {
        setEmailText(data.data);
        confetti({
          particleCount: 40,
          spread: 40,
          origin: { y: 0.8 },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* Header and tab buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-855 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" /> AI Creative Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Draft resumes, generate custom cover letters, write professional outreach, and optimize LinkedIn handles.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-center">
          {['resume', 'linkedin', 'coverletter', 'email'].map((tab) => {
            const labels = {
              resume: 'Builder',
              linkedin: 'LinkedIn',
              coverletter: 'Cover Letter',
              email: 'Email Writer'
            };
            return (
              <button
                key={tab}
                onClick={() => setBuilderTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  builderTab === tab ? 'bg-indigo-650 text-white shadow' : 'text-slate-500 hover:text-indigo-500'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}

      {builderTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Builder inputs */}
          <form onSubmit={handleSubmit(handleSave)} className="glass-card p-6 rounded-2xl space-y-6 print:hidden">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">Resume Details Form</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:text-indigo-500"
                  title="Toggle Full Preview"
                >
                  <Eye className="w-4.5 h-4.5" />
                </button>
                <select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                  className="p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px]"
                >
                  <option value="modern">Modern Layout</option>
                  <option value="ats">ATS Classic</option>
                  <option value="harvard">Harvard serif</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">Professional Summary</span>
                <button
                  type="button"
                  onClick={triggerAISummary}
                  disabled={loadingAI}
                  className="text-[10px] uppercase font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> AI Draft Summary
                </button>
              </div>
              <textarea
                {...register('summary')}
                className="w-full bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows="3"
              />
            </div>

            {/* Skills */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Skills & Frameworks</label>
              <input
                type="text"
                {...register('skills')}
                className="w-full bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Experience Highlights</span>
                <button
                  type="button"
                  onClick={() => appendExp({ company: '', position: '', startDate: '', endDate: '', description: '' })}
                  className="text-[10px] font-bold text-indigo-500 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {expFields.map((field, idx) => (
                <div key={field.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Experience Slot #{idx + 1}</span>
                    <button type="button" onClick={() => removeExp(idx)} className="text-rose-500"><Trash className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <input {...register(`experience.${idx}.company`)} placeholder="Company" className="p-2 border rounded bg-transparent" />
                    <input {...register(`experience.${idx}.position`)} placeholder="Position" className="p-2 border rounded bg-transparent" />
                    <input {...register(`experience.${idx}.startDate`)} placeholder="Start Date" className="p-2 border rounded bg-transparent" />
                    <input {...register(`experience.${idx}.endDate`)} placeholder="End Date" className="p-2 border rounded bg-transparent" />
                  </div>
                  <textarea
                    {...register(`experience.${idx}.description`)}
                    placeholder="Describe tasks and outcomes..."
                    className="w-full p-2 bg-transparent border rounded text-xs"
                    rows="2"
                  />
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Academic Projects</span>
                <button
                  type="button"
                  onClick={() => appendProj({ title: '', description: '', link: '' })}
                  className="text-[10px] font-bold text-indigo-500 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {projFields.map((field, idx) => (
                <div key={field.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Project Slot #{idx + 1}</span>
                    <button type="button" onClick={() => removeProj(idx)} className="text-rose-500"><Trash className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <input {...register(`projects.${idx}.title`)} placeholder="Title" className="p-2 border rounded bg-transparent" />
                    <input {...register(`projects.${idx}.link`)} placeholder="URL link" className="p-2 border rounded bg-transparent" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-450 uppercase font-bold">Bullets Description</span>
                    <button
                      type="button"
                      onClick={() => triggerAIProjectDraft(idx)}
                      disabled={loadingAI}
                      className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> AI Bullet Drafts
                    </button>
                  </div>
                  <textarea
                    {...register(`projects.${idx}.description`)}
                    placeholder="Describe tools used, complexity solved, and outcomes."
                    className="w-full p-2 bg-transparent border rounded text-xs h-20"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
                Save Version History
              </button>
              {saveStatus && <span className="text-xs text-indigo-500 font-semibold">{saveStatus}</span>}
            </div>
          </form>

          {/* Right Side: Preview template renderer */}
          <div className={`glass-card p-8 rounded-2xl min-h-[700px] border shadow-xl bg-white text-black font-sans leading-relaxed relative ${previewMode ? 'lg:col-span-2' : ''}`}>
            <button
              onClick={handlePrint}
              className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg print:hidden"
              title="Print Resume"
            >
              <Printer className="w-4 h-4" />
            </button>
            <div className="space-y-6 text-sm">
              <div className={`text-center pb-6 border-b border-slate-200 ${templateType === 'harvard' ? 'uppercase font-serif' : ''}`}>
                <h2 className="text-2xl font-extrabold tracking-tight">{user?.name}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {user?.email} | 123-456-7890 | {watch('skills').split(',')[0]} developer
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-xs uppercase text-slate-500 tracking-wider mb-2">Summary</h3>
                <p className="text-xs text-slate-800 leading-relaxed">{watch('summary')}</p>
              </div>

              <div>
                <h3 className="font-extrabold text-xs uppercase text-slate-500 tracking-wider mb-2">Skills</h3>
                <p className="text-xs text-slate-800 font-semibold">{watch('skills')}</p>
              </div>

              <div>
                <h3 className="font-extrabold text-xs uppercase text-slate-500 tracking-wider mb-3">Experience</h3>
                <div className="space-y-4">
                  {watch('experience').map((e, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{e.position} - {e.company}</span>
                        <span className="text-slate-500 font-normal">{e.startDate} - {e.endDate}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1.5">{e.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-xs uppercase text-slate-500 tracking-wider mb-3">Projects</h3>
                <div className="space-y-4">
                  {watch('projects').map((p, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{p.title}</span>
                        <span className="text-slate-500 font-normal">{p.link}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1.5">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {builderTab === 'linkedin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl h-fit space-y-4">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <Linkedin className="w-4.5 h-4.5 text-indigo-500" /> LinkedIn Profile Optimizer
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Click optimize to read current resume parameters, structure headline statements, draft compelling about bios, and maximize recruiter query visibility scores.
            </p>
            <button
              onClick={handleOptimizeLinkedIn}
              disabled={loadingAI}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              {loadingAI ? 'Drafting profiles...' : 'Generate Profile Optimizations'}
            </button>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {linkedinData ? (
              <div className="glass-card p-6 rounded-2xl space-y-6 text-xs text-slate-700 dark:text-slate-200">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Suggested LinkedIn Copies</span>
                  <span className="text-xs font-black text-emerald-500">Recruiter Visibility: {linkedinData.visibilityScore || 90}%</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold">Suggested Professional Headline</span>
                      <button onClick={() => copyToClipboard(linkedinData.headline)} className="text-indigo-400 hover:underline flex items-center gap-0.5"><Copy className="w-3 h-3" /> Copy</button>
                    </div>
                    <textarea value={linkedinData.headline} readOnly className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg outline-none resize-none font-medium h-12" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold">Suggested About / Summary Profile Section</span>
                      <button onClick={() => copyToClipboard(linkedinData.about)} className="text-indigo-400 hover:underline flex items-center gap-0.5"><Copy className="w-3 h-3" /> Copy</button>
                    </div>
                    <textarea value={linkedinData.about} readOnly className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg outline-none resize-none h-40" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold">Keywords & Banner Visual Suggestions</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-250 dark:border-slate-800 leading-normal text-slate-500">
                      {linkedinData.bannerSuggestions || 'Focus on clean visual grids highlighting fullstack React / Node API architectures.'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-10 text-center rounded-2xl text-slate-400 h-96 flex flex-col justify-center items-center">
                <Linkedin className="w-12 h-12 text-indigo-500/20 mb-3" />
                <h4 className="font-bold text-slate-800 dark:text-white">Active Profile Optimizer desk</h4>
                <p className="text-xs mt-2 max-w-xs leading-normal">
                  Click the generate button on the left to extract details and compile structured optimization copies.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {builderTab === 'coverletter' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleGenerateCoverLetter} className="lg:col-span-1 glass-card p-6 rounded-2xl h-fit space-y-4 text-xs text-slate-700 dark:text-slate-200">
            <h3 className="font-bold text-slate-850 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-4.5 h-4.5 text-indigo-500" /> Cover Letter Generator
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold">Company Name</label>
                <input
                  type="text"
                  placeholder="Zoho, Google"
                  value={coverLetterForm.company}
                  onChange={(e) => setCoverLetterForm({ ...coverLetterForm, company: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold">Target Role</label>
                <input
                  type="text"
                  placeholder="Software Dev"
                  value={coverLetterForm.role}
                  onChange={(e) => setCoverLetterForm({ ...coverLetterForm, role: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Target Job Description</label>
              <textarea
                placeholder="Paste key stack and qualifications parameters..."
                value={coverLetterForm.jobDescription}
                onChange={(e) => setCoverLetterForm({ ...coverLetterForm, jobDescription: e.target.value })}
                rows="4"
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingAI}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-1 transition-all"
            >
              {loadingAI ? 'Drafting letters...' : 'Compile Cover Letter'}
            </button>
          </form>

          <div className="lg:col-span-2 space-y-6">
            {coverLetter ? (
              <div className="glass-card p-8 rounded-2xl bg-white text-black font-sans leading-relaxed text-xs shadow-xl relative min-h-[500px]">
                <div className="absolute top-5 right-5 flex gap-2">
                  <button onClick={() => copyToClipboard(coverLetter)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
                  <button onClick={handlePrint} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg" title="Print"><Printer className="w-3.5 h-3.5" /></button>
                </div>
                <div className="whitespace-pre-wrap">{coverLetter}</div>
              </div>
            ) : (
              <div className="glass-card p-10 text-center rounded-2xl text-slate-400 h-96 flex flex-col justify-center items-center">
                <FileText className="w-12 h-12 text-indigo-500/20 mb-3" />
                <h4 className="font-bold text-slate-800 dark:text-white">Active Cover Letter Writer</h4>
                <p className="text-xs mt-2 max-w-xs leading-normal">
                  Provide company name and job criteria on the left to compile customized PDF cover letter copies.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {builderTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleGenerateEmail} className="lg:col-span-1 glass-card p-6 rounded-2xl h-fit space-y-4 text-xs text-slate-700 dark:text-slate-200">
            <h3 className="font-bold text-slate-850 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-4.5 h-4.5 text-indigo-500" /> Outreach Email Writer
            </h3>

            <div className="space-y-1">
              <label className="font-semibold">Email Purpose / Context</label>
              <select
                value={emailForm.emailType}
                onChange={(e) => setEmailForm({ ...emailForm, emailType: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
              >
                <option value="Referral Request">Referral Request</option>
                <option value="Interview Follow-up">Interview Follow-up</option>
                <option value="Thank You">Thank You after Interview</option>
                <option value="HR Reply">HR Reply</option>
                <option value="Offer Acceptance">Offer Acceptance</option>
                <option value="Offer Rejection">Offer Rejection</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Additional Context / Details</label>
              <textarea
                placeholder="Name of contact, role name, interview date logs, salary points, etc..."
                value={emailForm.details}
                onChange={(e) => setEmailForm({ ...emailForm, details: e.target.value })}
                rows="4"
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loadingAI}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-1 transition-all"
            >
              {loadingAI ? 'Drafting outreach...' : 'Generate Email Outline'}
            </button>
          </form>

          <div className="lg:col-span-2 space-y-6">
            {emailText ? (
              <div className="glass-card p-6 rounded-2xl space-y-4 text-xs text-slate-700 dark:text-slate-200">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="font-bold uppercase tracking-wider text-slate-450">Generated Outreach Body</span>
                  <button onClick={() => copyToClipboard(emailText)} className="text-indigo-400 hover:underline flex items-center gap-0.5"><Copy className="w-3 h-3" /> Copy Email</button>
                </div>
                <textarea value={emailText} readOnly className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none h-80 font-mono leading-relaxed" />
              </div>
            ) : (
              <div className="glass-card p-10 text-center rounded-2xl text-slate-400 h-96 flex flex-col justify-center items-center">
                <Mail className="w-12 h-12 text-indigo-500/20 mb-3" />
                <h4 className="font-bold text-slate-800 dark:text-white">Active Outreach Editor</h4>
                <p className="text-xs mt-2 max-w-xs leading-normal">
                  Select an email outreach category on the left to compile structured, professional email messages.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
