import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { authStart, authSuccess, authFailure } from '../../redux/slices/authSlice.js';
import API from '../../services/api.js';
import { Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setFormError('Please enter all credentials');
      return;
    }
    setFormError('');
    dispatch(authStart());
    try {
      const { data } = await API.post('/auth/login', formData);
      if (data.success) {
        dispatch(authSuccess({ user: data.user, token: data.token }));
        // Redirect according to roles
        if (data.user.role === 'recruiter') navigate('/recruiter');
        else if (data.user.role === 'mentor') navigate('/mentor');
        else if (data.user.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      } else {
        dispatch(authFailure(data.message));
      }
    } catch (err) {
      dispatch(authFailure(err.response?.data?.message || 'Login request failed'));
    }
  };

  const handleGoogleLogin = async () => {
    dispatch(authStart());
    try {
      // Mock Google SSO Callback
      const mockPayload = {
        googleId: 'g123456789',
        name: 'Sujan',
        email: 'sujan@careeros.com',
        avatar: '',
      };
      const { data } = await API.post('/auth/google', mockPayload);
      if (data.success) {
        dispatch(authSuccess({ user: data.user, token: data.token }));
        navigate('/dashboard');
      }
    } catch (err) {
      dispatch(authFailure('Google login simulation failed'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-650/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-650/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-950/70 border border-slate-800 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-600 text-white p-3 rounded-2xl font-black text-2xl shadow-xl shadow-indigo-600/30 mb-3">
            OS
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to CareerOS</h2>
          <p className="text-slate-400 text-xs mt-1.5">AI-Powered Placement & Career Development Platform</p>
        </div>

        {/* Action errors */}
        {(error || formError) && (
          <div className="mb-5 bg-rose-950/30 border border-rose-900/60 p-3 rounded-lg text-rose-350 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-550 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-semibold">Password</label>
              <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-550 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-indigo-600/30 transition-all text-xs flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs">or continue with</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Google SSO Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white font-semibold py-3 rounded-lg transition-all text-xs flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Simulate Google Sign-In</span>
        </button>

        {/* Links */}
        <p className="text-center text-slate-400 text-xs mt-8">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
