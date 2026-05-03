import { motion } from 'framer-motion';
import { Briefcase, Plus, Save, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  createProjectRequest,
  deleteProjectRequest,
  getProjectsRequest,
  updateProjectRequest
} from '../services/projectService.js';
import { getMembersRequest } from '../services/userService.js';
import { getErrorMessage } from '../utils/errors.js';

const emptyProject = { name: '', description: '', teamMembers: [] };

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [projectsResponse, membersResponse] = await Promise.all([
        getProjectsRequest(),
        isAdmin ? getMembersRequest() : Promise.resolve({ data: [] })
      ]);
      setProjects(projectsResponse.data);
      setMembers(membersResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const toggleMember = (memberId) => {
    setForm((current) => ({
      ...current,
      teamMembers: current.teamMembers.includes(memberId)
        ? current.teamMembers.filter((id) => id !== memberId)
        : [...current.teamMembers, memberId]
    }));
  };

  const reset = () => {
    setForm(emptyProject);
    setEditingId('');
  };

  const submitProject = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateProjectRequest(editingId, form);
      } else {
        await createProjectRequest(form);
      }
      reset();
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const editProject = (project) => {
    setEditingId(project._id);
    setForm({
      name: project.name,
      description: project.description || '',
      teamMembers: project.teamMembers?.map((member) => member._id) || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project and its tasks?')) return;
    try {
      await deleteProjectRequest(projectId);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-1 bg-violet-600 rounded-full"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">
            {isAdmin ? 'System Architecture' : 'Assigned Domains'}
          </p>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          {isAdmin ? 'Project Configuration' : 'Active Projects'}
        </h1>
        <p className="mt-2 text-slate-400 font-medium max-w-2xl">
          {isAdmin 
            ? 'Initialize and coordinate project parameters, team allocation, and operational objectives.' 
            : 'Access and monitor projects currently integrated into your operational workflow.'}
        </p>
      </motion.section>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 font-bold text-rose-400 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          {error}
        </div>
      )}

      {isAdmin && (
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submitProject} 
          className="rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center text-violet-400">
              <Briefcase size={20} />
            </div>
            <h3 className="text-xl font-black text-white">
              {editingId ? 'Modify Project Parameters' : 'Initialize New Project'}
            </h3>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Project Designation</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="e.g., Project Alpha"
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-violet-500 transition-all font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Operational Scope</label>
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Brief mission summary..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-violet-500 transition-all font-bold"
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-slate-500" />
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Personnel Allocation</label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member) => (
                <label 
                  key={member._id} 
                  className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition-all duration-300 ${
                    form.teamMembers.includes(member._id)
                      ? 'bg-violet-600/10 border-violet-600/50 text-white'
                      : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.teamMembers.includes(member._id)}
                    onChange={() => toggleMember(member._id)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    form.teamMembers.includes(member._id) ? 'bg-violet-600 border-violet-600' : 'border-slate-700'
                  }`}>
                    {form.teamMembers.includes(member._id) && <Plus size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-bold truncate">{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 pt-6 border-t border-white/5">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-violet-600/20 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {editingId ? <Save size={18} /> : <Plus size={18} />}
                  {editingId ? 'Apply Modifications' : 'Commit Initialization'}
                </>
              )}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={reset} 
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all"
              >
                Cancel Protocol
              </button>
            )}
          </div>
        </motion.form>
      )}

      {/* Projects Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project, index) => (
          <motion.article 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            key={project._id} 
            className="group rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-sm p-8 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-500"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full"></div>
                  <h2 className="text-2xl font-black text-white group-hover:text-violet-400 transition-colors">{project.name}</h2>
                </div>
                <p className="text-slate-400 font-medium leading-relaxed mb-6">{project.description || 'No operational summary provided.'}</p>
              </div>
              
              {isAdmin && (
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => editProject(project)} 
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-violet-600 flex items-center justify-center text-white transition-all shadow-lg"
                    title="Edit Protocol"
                  >
                    <Save size={16} />
                  </button>
                  <button 
                    onClick={() => deleteProject(project._id)} 
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-rose-600 flex items-center justify-center text-white transition-all shadow-lg"
                    title="Terminate Project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-3">
                <Users size={12} className="text-slate-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Assigned Personnel</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.teamMembers?.map((member) => (
                  <span 
                    key={member._id} 
                    className="rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:border-violet-500/30 transition-all"
                  >
                    {member.name}
                  </span>
                ))}
                {(!project.teamMembers || project.teamMembers.length === 0) && (
                  <span className="text-[10px] font-bold italic text-slate-600 tracking-wider">Unassigned</span>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
          <Briefcase size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No Active Deployments Detected</p>
        </div>
      )}
    </div>
  );
};

export default Projects;

