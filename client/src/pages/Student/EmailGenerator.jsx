import React, { useState } from 'react';
import { Mail, Copy, Check, Send, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import API from '../../services/api.js';

const EmailGenerator = () => {
  const [emailType, setEmailType] = useState('Referral Request');
  const [details, setDetails] = useState({
    recipientName: '',
    companyName: '',
    roleName: '',
    keyContext: '',
  });
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const emailTypes = [
    'Referral Request',
    'Follow-up Email',
    'Thank You Email',
    'Offer Acceptance',
    'Offer Rejection',
    'HR Reply',
    'Networking Email',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedEmail('');
    setCopied(false);

    try {
      const { data } = await API.post('/ai/email-writer', {
        emailType,
        details,
      });

      if (data.success) {
        setGeneratedEmail(data.data);
      } else {
        setError('Failed to generate email text.');
      }
    } catch (err) {
      setError('Connection failed. Operating in fallback offline mode.');
      // Local fallback simulator if API fails
      setTimeout(() => {
        let subject = '';
        let body = '';
        if (emailType === 'Referral Request') {
          subject = `Referral Request: ${details.roleName || 'Software Engineer'} at ${details.companyName || 'Target Company'}`;
          body = `Hi ${details.recipientName || 'Name'},\n\nI hope this email finds you well.\n\nI have been following the growth of ${details.companyName || 'Target Company'} and noticed an opening for a ${details.roleName || 'Software Developer'}. Given my background in MERN full-stack development and consistent problem-solving progress, I believe I would be a strong fit for the team.\n\nWould you be open to introducing me or referring me for this position? I have attached my resume for your reference. Any guidance or referral you could provide would be highly appreciated.\n\nThank you for your time,\n[Your Name]`;
        } else if (emailType === 'Follow-up Email') {
          subject = `Follow-up: ${details.roleName || 'Software Engineer'} Application`;
          body = `Dear ${details.recipientName || 'Hiring Team'},\n\nI hope you are doing well.\n\nI am writing to express my continued interest in the ${details.roleName || 'Software Engineer'} position at ${details.companyName || 'Target Company'}. I wanted to follow up on the status of my application submitted recently.\n\nPlease let me know if you need any additional credentials or references from my end. I look forward to hearing back.\n\nBest regards,\n[Your Name]`;
        } else {
          subject = `${emailType}: ${details.roleName || 'Software Developer'} Role`;
          body = `Dear ${details.recipientName || 'Team'},\n\nThank you for this update regarding the ${details.roleName || 'Software Developer'} position at ${details.companyName || 'Target Company'}.\n\nContext details: ${details.keyContext || 'Standard reply'}.\n\nBest regards,\n[Your Name]`;
        }
        setGeneratedEmail(`Subject: ${subject}\n\n${body}`);
        setLoading(false);
      }, 1000);
    } finally {
      if (!error) setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 font-sans pb-10 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-indigo-505" /> AI Email Writer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate high-conversion outreach emails, referral pitches, thank you notes, and HR replies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Setup Panel */}
        <div className="glass-card p-6 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-slate-850 dark:text-white text-sm">Configure Parameters</h3>
          </div>

          {error && (
            <div className="bg-rose-950/20 border border-rose-900/60 p-3 rounded-xl text-rose-350 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            {/* Email Category */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Email Category</label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border rounded-lg p-2.5 font-medium"
              >
                {emailTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Recipient / Contact Name</label>
              <input
                type="text"
                name="recipientName"
                value={details.recipientName}
                onChange={handleInputChange}
                placeholder="e.g. John Doe (Recruiter / Alumni)"
                className="w-full bg-slate-100 dark:bg-slate-900 border rounded-lg p-2.5"
                required
              />
            </div>

            {/* Company Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={details.companyName}
                onChange={handleInputChange}
                placeholder="e.g. Google, Zoho"
                className="w-full bg-slate-100 dark:bg-slate-900 border rounded-lg p-2.5"
                required
              />
            </div>

            {/* Role Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Job Title / Role</label>
              <input
                type="text"
                name="roleName"
                value={details.roleName}
                onChange={handleInputChange}
                placeholder="e.g. Full Stack Developer, Frontend Engineer"
                className="w-full bg-slate-100 dark:bg-slate-900 border rounded-lg p-2.5"
                required
              />
            </div>

            {/* Custom Context */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Custom Highlights / Context (Optional)</label>
              <textarea
                name="keyContext"
                value={details.keyContext}
                onChange={handleInputChange}
                placeholder="e.g. Met John at React Conf 2026. Explicitly mention my 3 solid MERN projects."
                className="w-full bg-slate-100 dark:bg-slate-900 border rounded-lg p-2.5 min-h-20 leading-relaxed resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-650/50 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-650/15 flex items-center justify-center gap-1.5"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{loading ? 'Composing email...' : 'Compose Email with AI'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Output Panel */}
        <div className="glass-panel rounded-2xl flex flex-col h-[495px] overflow-hidden border">
          {/* Header */}
          <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b flex justify-between items-center">
            <span className="font-extrabold text-slate-850 dark:text-white text-xs">AI Composer Workspace</span>
            {generatedEmail && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-650 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            )}
          </div>

          {/* Workspace Body */}
          <div className="flex-1 p-4 bg-white dark:bg-slate-950/40 overflow-y-auto leading-relaxed text-xs text-slate-700 dark:text-slate-200">
            {generatedEmail ? (
              <pre className="font-sans whitespace-pre-wrap">{generatedEmail}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-2">
                <Mail className="w-10 h-10 text-slate-300 dark:text-slate-800 animate-pulse" />
                <p>Fill in the configurations and click Compose.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailGenerator;
