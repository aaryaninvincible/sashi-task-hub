import { motion } from 'framer-motion';
import { FolderKanban, KeyRound, Mail, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../services/authService.js';
import { getErrorMessage } from '../utils/errors.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResetUrl('');
    setLoading(true);
    try {
      const { data } = await forgotPasswordRequest(email);
      setMessage(data.message);
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] overflow-hidden relative items-center justify-center px-6">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/5 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-4">
              <KeyRound size={24} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-white text-center tracking-tight">Security Recovery</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 text-center">Generate temporary access protocols</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-bold">
              <ShieldAlert size={18} />
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              {message}
            </div>
          )}

          {resetUrl && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-6 p-4 bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">DEBUG: Temporary Reset Link</p>
              <a href={resetUrl} className="text-xs font-bold text-violet-400 break-all hover:underline italic">
                {resetUrl}
              </a>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Operational Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all font-bold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-violet-600/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <KeyRound size={20} />
                  Authorize Reset
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <Link 
              to="/login" 
              className="text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
            >
              Return to Control Center
            </Link>
          </div>
        </div>
        
        <p className="text-center mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
          Engineered by <span className="text-slate-500">Sashi Intelligence Systems</span>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

