import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { authStart, authSuccess, authFailure } from '../../redux/slices/authSlice.js';
import API from '../../services/api.js';
import { User, Mail, Lock, Briefcase, AlertCircle } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });

  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Please fill in all details');
      return;
    }
    setFormError('');
    dispatch(authStart());
    try {
      const { data } = await API.post('/auth/register', formData);
      if (data.success) {
        setSuccessMsg(data.message);
        dispatch(authSuccess({ user: data.user, token: data.token }));
        setTimeout(() => {
          if (data.user.role === 'recruiter') navigate('/recruiter');
          else if (data.user.role === 'mentor') navigate('/mentor');
          else navigate('/dashboard');
        }, 1500);
      } else {
        dispatch(authFailure(data.message));
      }
    } catch (err) {
      dispatch(authFailure(err.response?.data?.message || 'Registration failed'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-650/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-650/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-950/70 border border-slate-800 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-600 text-white p-3 rounded-2xl font-black text-2xl shadow-xl shadow-indigo-600/30 mb-3">
            OS
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create your Account</h2>
          <p className="text-slate-400 text-xs mt-1.5">Join CareerOS placement and mentorship ecosystem</p>
        </div>

        {/* Display actions feedback */}
        {(error || formError) && (
          <div className="mb-5 bg-rose-950/30 border border-rose-900/60 p-3 rounded-lg text-rose-350 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 bg-emerald-950/30 border border-emerald-900/60 p-3 rounded-lg text-emerald-305 text-xs">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-550 focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                name="email"
                placeholder="you@domain.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-550 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-550 focus:outline-none"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">I want to register as a</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-550 focus:outline-none appearance-none"
              >
                <option value="student">Student / Placement Candidate</option>
                <option value="recruiter">Recruiter / Employer</option>
                <option value="mentor">Mentor / Advisor</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-indigo-600/30 transition-all text-xs flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
