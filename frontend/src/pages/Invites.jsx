import { motion } from 'framer-motion';
import { Check, Copy, Link2, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  cancelInviteRequest,
  clearInviteHistoryRequest,
  createInviteRequest,
  deleteInviteRequest,
  getInvitesRequest
} from '../services/inviteService.js';
import { getErrorMessage } from '../utils/errors.js';

const isInviteActive = (invite) => !invite.acceptedAt && !invite.cancelledAt && new Date(invite.expiresAt) > new Date();

const Invites = () => {
  const [invites, setInvites] = useState([]);
  const [form, setForm] = useState({ email: '', role: 'member' });
  const [latestLink, setLatestLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inactiveInviteCount = invites.filter((invite) => !isInviteActive(invite)).length;

  const loadInvites = async () => {
    try {
      const { data } = await getInvitesRequest();
      setInvites(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const submitInvite = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    setLatestLink('');
    setCopied(false);
    try {
      const { data } = await createInviteRequest(form);
      setNotice(data.emailMessage || 'Directives successfully transmitted.');
      if (data.inviteUrl) setLatestLink(data.inviteUrl);
      setForm({ email: '', role: 'member' });
      loadInvites();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const copyLatestLink = async () => {
    setError('');
    try {
      await navigator.clipboard.writeText(latestLink);
      setCopied(true);
      setNotice('Invite credentials duplicated to clipboard.');
    } catch (_err) {
      setError('Duplication failed. Manual extraction required.');
    }
  };

  const cancelInvite = async (inviteId) => {
    if (!window.confirm('Terminate this invite? The access link will be permanently neutralized.')) return;
    setError('');
    try {
      await cancelInviteRequest(inviteId);
      loadInvites();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const removeInvite = async (inviteId) => {
    if (!window.confirm('Purge this record from system history?')) return;
    setError('');
    try {
      await deleteInviteRequest(inviteId);
      loadInvites();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const clearInviteHistory = async () => {
    if (!inactiveInviteCount) return;
    if (!window.confirm(`Purge ${inactiveInviteCount} inactive records? Pending authorizations will remain intact.`)) return;
    setError('');
    try {
      const { data } = await clearInviteHistoryRequest();
      setNotice(`${data.deletedCount || 0} records purged from memory.`);
      loadInvites();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getInviteStatus = (invite) => {
    if (invite.acceptedAt) return { label: 'Verified', class: 'text-emerald-400 bg-emerald-500/10' };
    if (invite.cancelledAt) return { label: 'Neutralized', class: 'text-rose-400 bg-rose-500/10' };
    return isInviteActive(invite) 
      ? { label: 'Awaiting', class: 'text-violet-400 bg-violet-500/10' } 
      : { label: 'Expired', class: 'text-slate-500 bg-white/5' };
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-1 bg-violet-600 rounded-full"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">Authorization Portal</p>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Access Link Generation</h1>
      </motion.section>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 font-bold text-rose-400 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 font-bold text-emerald-400 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          {notice}
        </div>
      )}

      {/* Creation Form */}
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submitInvite} 
        className="rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
      >
        <div className="grid gap-6 md:grid-cols-[1fr_200px_auto]">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Target Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="operator@sashi-intel.com"
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">System Privilege</label>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="member" className="bg-slate-900">Workspace Member</option>
              <option value="admin" className="bg-slate-900">System Admin</option>
            </select>
          </div>
          <button 
            disabled={loading}
            className="mt-6 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-violet-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Link2 size={18} />
                Generate Access
              </>
            )}
          </button>
        </div>

        {latestLink && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Authenticated Link Ready</p>
                <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 truncate font-mono text-sm text-slate-300">
                  {latestLink}
                </div>
              </div>
              <button
                type="button"
                onClick={copyLatestLink}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Extract Link'}
              </button>
            </div>
          </motion.div>
        )}
      </motion.form>

      {/* History Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-[2.5rem] border border-white/5 bg-white/5 shadow-2xl backdrop-blur-sm overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-black text-white">Directive Logs</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{inactiveInviteCount} records in cache</p>
          </div>
          <button
            type="button"
            onClick={clearInviteHistory}
            disabled={!inactiveInviteCount}
            className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-rose-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest text-slate-400 disabled:opacity-20 flex items-center gap-2"
          >
            <Trash2 size={14} />
            Purge Memory
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Target Operator</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Privilege</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Expirations</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-white/[0.01]">
              {invites.map((invite) => {
                const status = getInviteStatus(invite);
                return (
                  <tr key={invite.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5 text-sm font-black text-white">{invite.email}</td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                        {invite.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">
                      {new Date(invite.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        {isInviteActive(invite) && (
                          <button
                            onClick={() => cancelInvite(invite.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-white transition-all shadow-lg"
                            title="Neutralize"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => removeInvite(invite.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-lg"
                          title="Purge"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {invites.length === 0 && (
            <div className="py-20 text-center">
              <Link2 size={40} className="mx-auto text-slate-700 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">No generated authorizations found</p>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Invites;

