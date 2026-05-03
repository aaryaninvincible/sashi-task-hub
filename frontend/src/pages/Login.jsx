import { motion } from 'framer-motion';
import { FolderKanban, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/errors.js';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse transition-all duration-1000"></div>
      </div>

      <div className="flex w-full max-w-7xl mx-auto items-center justify-center lg:justify-between px-6 z-10">
        {/* Left Side - Brand Identity */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col max-w-xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-600/30">
              <FolderKanban size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">Sashi's Hub</h1>
          </div>
          <h2 className="text-6xl font-black text-white leading-tight mb-6">
            The next generation of <span className="text-violet-500">team intelligence</span>.
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            Streamline your operations with Sashi's high-performance task management ecosystem. 
            Designed for teams that demand precision and speed.
          </p>
          
          <div className="mt-12 flex gap-10">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">99.9%</span>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Uptime</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">256-bit</span>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Security</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">2.0ms</span>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Latency</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50">
            <div className="flex flex-col items-center mb-8">
              <div className="lg:hidden w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-4">
                <FolderKanban size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-white text-center">Operational Access</h3>
              <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">Identify yourself to continue</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-bold"
              >
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="Workspace Email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Secure Password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <Link to="/forgot-password" size="sm" className="text-xs font-black text-slate-500 hover:text-violet-400 transition-colors uppercase tracking-widest">
                  Secure Recovery
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-violet-600/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn size={20} />
                    Establish Connection
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">New Operator?</p>
              <Link 
                to="/signup" 
                className="text-violet-400 hover:text-violet-300 font-black text-sm uppercase tracking-[0.15em] transition-colors"
              >
                Request Authorization
              </Link>
            </div>
          </div>
          
          <p className="text-center mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
            Engineered by <span className="text-slate-500">Sashi Intelligence Systems</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

