import { motion } from 'framer-motion';
import { ShieldAlert, Trash2, Users, Lock, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getUsersRequest, removeUserRequest } from '../services/userService.js';
import { getErrorMessage } from '../utils/errors.js';

const MAIN_ADMIN_EMAIL = 'vlistenmusic@gmail.com';

const Team = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const loadUsers = async () => {
    try {
      const { data } = await getUsersRequest();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const removeUser = async (targetUser) => {
    const password = passwords[targetUser._id];
    if (!password) {
      setError('System override code required for personnel termination.');
      return;
    }

    if (!window.confirm(`Neutralize ${targetUser.name}? All associated intelligence data will be purged.`)) return;

    setError('');
    setMessage('');
    setLoadingId(targetUser._id);
    try {
      const { data } = await removeUserRequest(targetUser._id, password);
      setMessage(data.message);
      setPasswords((current) => ({ ...current, [targetUser._id]: '' }));
      loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingId(null);
    }
  };

  const currentUserIsMainAdmin = user.email?.toLowerCase() === MAIN_ADMIN_EMAIL;

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.section 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-1 bg-amber-500 rounded-full"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Personnel Management</p>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Intelligence Network</h1>
      </motion.section>

      {/* Security Notice */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-amber-500/10 bg-amber-500/[0.03] backdrop-blur-md p-6"
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="text-amber-500" size={24} />
          </div>
          <div>
            <p className="text-amber-400 font-black text-sm uppercase tracking-widest mb-1">High Security Protocol</p>
            <p className="text-amber-500/80 text-xs font-bold leading-relaxed">
              Only the root administrator ({MAIN_ADMIN_EMAIL}) holds termination privileges. 
              Each personnel removal requires a unique system override password for verification.
            </p>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 font-bold text-rose-400 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 font-bold text-emerald-400 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          {message}
        </div>
      )}

      {/* Personnel Table */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] border border-white/5 bg-white/5 shadow-2xl backdrop-blur-sm overflow-hidden"
      >
        <div className="flex items-center gap-4 px-8 py-6 border-b border-white/5 bg-white/[0.01]">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
            <Users className="text-violet-400" size={20} />
          </div>
          <h2 className="text-xl font-black text-white">Active Operators</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operator Details</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Access Level</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Security Override</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-white/[0.01]">
              {users.map((item) => {
                const isMainAdminAccount = item.email?.toLowerCase() === MAIN_ADMIN_EMAIL;
                const canRemove = currentUserIsMainAdmin && !isMainAdminAccount;

                return (
                  <tr key={item._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${isMainAdminAccount ? 'bg-amber-500/20 text-amber-500' : 'bg-violet-500/20 text-violet-400'}`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-white">{item.name}</p>
                          <p className="text-xs font-bold text-slate-500">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 w-fit ${isMainAdminAccount ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                        {isMainAdminAccount ? <ShieldCheck size={12} /> : null}
                        {item.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {canRemove ? (
                        <div className="relative max-w-xs">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                          <input
                            type="password"
                            value={passwords[item._id] || ''}
                            onChange={(event) => setPasswords({ ...passwords, [item._id]: event.target.value })}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-xs focus:outline-none focus:border-rose-500 transition-all font-bold placeholder:text-slate-700"
                            placeholder="Override code"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-2 rounded-xl w-fit">
                          <Lock size={12} />
                          {isMainAdminAccount ? 'System Protected' : 'Restricted Access'}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {canRemove ? (
                        <button
                          type="button"
                          onClick={() => removeUser(item)}
                          disabled={loadingId === item._id}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 ml-auto"
                        >
                          {loadingId === item._id ? (
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Trash2 size={14} />
                              Neutralize
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-slate-700 text-[9px] font-black uppercase tracking-widest">
                          <ShieldCheck size={12} />
                          Authenticated
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
};

export default Team;

