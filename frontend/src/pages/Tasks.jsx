import { motion } from 'framer-motion';
import { Calendar, Filter, MessageSquare, Plus, Save, Search, Target, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PriorityBadge from '../components/PriorityBadge.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { ALL_FILTER, TASK_PRIORITIES, TASK_STATUSES } from '../constants/taskOptions.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getProjectsRequest } from '../services/projectService.js';
import {
  addTaskCommentRequest,
  createTaskRequest,
  deleteTaskRequest,
  getTasksRequest,
  updateTaskRequest,
  updateTaskStatusRequest
} from '../services/taskService.js';
import { getMembersRequest } from '../services/userService.js';
import { getErrorMessage } from '../utils/errors.js';
import { parseTags, taskMatchesFilters } from '../utils/taskHelpers.js';

const emptyTask = {
  title: '',
  description: '',
  status: 'Todo',
  priority: 'Medium',
  tags: '',
  dueDate: '',
  project: '',
  assignedTo: ''
};

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState('');
  const [filters, setFilters] = useState({ status: ALL_FILTER, priority: ALL_FILTER, query: '' });
  const [commentText, setCommentText] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === form.project),
    [projects, form.project]
  );

  const assignableMembers = selectedProject?.teamMembers || members;
  const filteredTasks = tasks.filter((task) => taskMatchesFilters(task, filters));

  const load = async () => {
    try {
      const [tasksResponse, projectsResponse, membersResponse] = await Promise.all([
        getTasksRequest(),
        getProjectsRequest(),
        isAdmin ? getMembersRequest() : Promise.resolve({ data: [] })
      ]);
      setTasks(tasksResponse.data);
      setProjects(projectsResponse.data);
      setMembers(membersResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const reset = () => {
    setForm(emptyTask);
    setEditingId('');
  };

  const submitTask = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateTaskRequest(editingId, { ...form, tags: parseTags(form.tags) });
      } else {
        await createTaskRequest({ ...form, tags: parseTags(form.tags) });
      }
      reset();
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const editTask = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'Medium',
      tags: task.tags?.join(', ') || '',
      dueDate: task.dueDate.slice(0, 10),
      project: task.project?._id || '',
      assignedTo: task.assignedTo?._id || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTaskRequest(taskId);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const changeStatus = async (taskId, status) => {
    try {
      await updateTaskStatusRequest(taskId, status);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addComment = async (taskId) => {
    const body = commentText[taskId]?.trim();
    if (!body) return;
    try {
      await addTaskCommentRequest(taskId, body);
      setCommentText((current) => ({ ...current, [taskId]: '' }));
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
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-1 bg-violet-600 rounded-full"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">
            {isAdmin ? 'Mission Control' : 'Assigned Objectives'}
          </p>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          {isAdmin ? 'Task Orchestration' : 'Current Task Flow'}
        </h1>
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
          onSubmit={submitTask} 
          className="rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center text-violet-400">
              <Target size={20} />
            </div>
            <h3 className="text-xl font-black text-white">
              {editingId ? 'Modify Task Directives' : 'Initialize New Objective'}
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Objective Title</label>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Task title..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Assigned Domain</label>
              <select
                value={form.project}
                onChange={(event) => setForm({ ...form, project: event.target.value, assignedTo: '' })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold appearance-none"
                required
              >
                <option value="" className="bg-slate-900">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id} className="bg-slate-900">
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Assigned Operator</label>
              <select
                value={form.assignedTo}
                onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold appearance-none"
                required
              >
                <option value="" className="bg-slate-900">Select Member</option>
                {assignableMembers.map((member) => (
                  <option key={member._id} value={member._id} className="bg-slate-900">
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Deadline</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Current Status</label>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold appearance-none"
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status} className="bg-slate-900">
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Priority Level</label>
              <select
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold appearance-none"
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority} className="bg-slate-900">
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Brief Summary</label>
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Description..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Metadata Tags</label>
              <input
                value={form.tags}
                onChange={(event) => setForm({ ...form, tags: event.target.value })}
                placeholder="design, launch, qa"
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-white/5">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-violet-600/20 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {editingId ? <Save size={16} /> : <Plus size={16} />}
                  {editingId ? 'Save Directive' : 'Create Objective'}
                </>
              )}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={reset} 
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all"
              >
                Cancel Protocol
              </button>
            )}
          </div>
        </motion.form>
      )}

      {/* Filters Section */}
      <section className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md p-6 shadow-xl">
        <div className="grid gap-4 md:grid-cols-[1fr_200px_200px]">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all font-bold"
              placeholder="Search by title, project, or description..."
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold appearance-none"
            >
              <option className="bg-slate-900">All Statuses</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} className="bg-slate-900">{status}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={filters.priority}
              onChange={(event) => setFilters({ ...filters, priority: event.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold appearance-none"
            >
              <option className="bg-slate-900">All Priorities</option>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} className="bg-slate-900">{priority}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Tasks Table */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 shadow-2xl backdrop-blur-sm"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Objective</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Domain</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operator</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Deadline</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Priority</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Progress</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Collaboration</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-white/[0.01]">
              {filteredTasks.map((task) => (
                <tr key={task._id} className="group hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-white group-hover:text-violet-400 transition-colors">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                    {task.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-md bg-violet-600/10 border border-violet-600/20 text-[9px] font-black uppercase tracking-widest text-violet-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-300">{task.project?.name}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-indigo-600/30">
                        {task.assignedTo?.name?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-300">{task.assignedTo?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} className="text-slate-600" />
                      <span className="text-xs font-bold tracking-tighter">{task.dueDate?.slice(0, 10)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-6 py-5">
                    {isAdmin ? (
                      <StatusBadge status={task.status} />
                    ) : (
                      <select
                        value={task.status}
                        onChange={(event) => changeStatus(task._id, event.target.value)}
                        className="bg-slate-900/50 border border-white/10 rounded-xl px-3 py-1 text-xs font-bold text-white focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer"
                      >
                        {TASK_STATUSES.map((status) => (
                          <option key={status} value={status} className="bg-slate-900">{status}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="w-64 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <MessageSquare size={12} />
                          {task.comments?.length || 0} Communications
                        </div>
                      </div>
                      <div className="space-y-2 max-h-20 overflow-y-auto scrollbar-hide pr-1">
                        {task.comments?.slice(-2).map((comment) => (
                          <div key={comment._id} className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-violet-400 mb-1">{comment.user?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-400 leading-tight">{comment.body}</p>
                          </div>
                        ))}
                        {(!task.comments || task.comments.length === 0) && (
                          <p className="text-[10px] italic text-slate-600">No active comms.</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={commentText[task._id] || ''}
                          onChange={(event) => setCommentText({ ...commentText, [task._id]: event.target.value })}
                          className="flex-1 bg-slate-900/50 border border-white/5 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
                          placeholder="Transmit message..."
                        />
                        <button
                          type="button"
                          onClick={() => addComment(task._id)}
                          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {isAdmin ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => editTask(task)} 
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-violet-600 flex items-center justify-center text-white transition-all shadow-lg"
                        >
                          <Save size={14} />
                        </button>
                        <button 
                          onClick={() => deleteTask(task._id)} 
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 flex items-center justify-center text-white transition-all shadow-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Target size={40} className="text-slate-700 mb-3" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No Objectives Found in current scope</p>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default Tasks;

