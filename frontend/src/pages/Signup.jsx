import { motion } from 'framer-motion';
import { FolderKanban, Mail, ShieldCheck, User, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { verifyInviteRequest } from '../services/inviteService.js';
import { getErrorMessage } from '../utils/errors.js';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    adminSetupKey: ''
  });
  const [error, setError] = useState('');
  const [invite, setInvite] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!inviteToken) return;

    verifyInviteRequest(inviteToken)
      .then(({ data }) => {
        setInvite(data);
        setForm((current) => ({ ...current, email: data.email, role: data.role }));
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [inviteToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (inviteToken) payload.inviteToken = inviteToken;
      if (payload.role !== 'admin') delete payload.adminSetupKey;
      await signup(payload);
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
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="flex w-full max-w-7xl mx-auto items-center justify-center lg:justify-between px-6 z-10 py-10">
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
            Join the elite <span className="text-violet-500">task force</span> today.
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            Configure your workspace and start managing with industrial-grade efficiency. 
            The hub awaits your presence.
          </p>
          
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400">
                <ShieldCheck size={20} />
              </div>
              <p className="text-slate-300 font-bold">End-to-end operational security</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                <User size={20} />
              </div>
              <p className="text-slate-300 font-bold">Role-based access protocols</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Signup Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl"
        >
          <div className="bg-white/5 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50">
            <div className="flex flex-col items-center mb-8">
              <div className="lg:hidden w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-4">
                <FolderKanban size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-white text-center">Personnel Enrollment</h3>
              <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest text-center">Initialize your profile in the ecosystem</p>
            </div>

            {invite && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Invite Verified: {invite.email} ({invite.role})
              </div>
            )}

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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all font-bold"
                    required
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="Workspace Email"
                    value={form.email}
                    readOnly={Boolean(invite)}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all font-bold disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="Create Secure Password (8+ chars)"
                  minLength={8}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all font-bold"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Clearance Level</label>
                  <select
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value })}
                    disabled={Boolean(invite)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold disabled:opacity-50 appearance-none"
                  >
                    <option value="member">Workspace Member</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
                
                {form.role === 'admin' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-2">Setup Authorization</label>
                    <input
                      type="password"
                      placeholder="Admin Key"
                      value={form.adminSetupKey}
                      onChange={(event) => setForm({ ...form, adminSetupKey: event.target.value })}
                      className="w-full bg-slate-900/50 border border-rose-500/30 rounded-2xl py-4 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all font-bold"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-violet-600/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-4"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Initialize Profile
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Known Entity?</p>
              <Link 
                to="/login" 
                className="text-violet-400 hover:text-violet-300 font-black text-sm uppercase tracking-[0.15em] transition-colors"
              >
                Establish Connection
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

export default Signup;

