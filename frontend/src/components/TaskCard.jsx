import { format, isBefore } from 'date-fns';
import { CalendarDays, ChevronRight, MessageSquare, Sparkles, User2 } from 'lucide-react';
import { TASK_STATUSES } from '../constants/taskOptions.js';
import { useAuth } from '../context/AuthContext.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import StatusBadge from './StatusBadge.jsx';

const TaskCard = ({ task, onStatusChange }) => {
  const { isAdmin } = useAuth();
  const overdue = task.status !== 'Done' && isBefore(new Date(task.dueDate), new Date());

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <FolderKanban size={40} className="text-violet-600" />
      </div>
      
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-violet-600 transition-colors">{task.title}</h3>
              <p className="text-xs font-bold text-violet-500 uppercase tracking-widest flex items-center gap-1">
                {task.project?.name || 'Unassigned'}
                <ChevronRight size={10} />
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          {task.description && (
            <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {task.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm">
                  <Sparkles size={10} className="text-violet-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <User2 size={14} className="text-slate-500" />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned To</p>
                <p className="text-xs font-bold text-slate-700">{task.assignedTo?.name || 'Pending'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 ${overdue ? 'text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm' : 'text-slate-400'}`}>
                <CalendarDays size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <MessageSquare size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{task.comments?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Transition State</p>
            <select
              value={task.status}
              onChange={(event) => onStatusChange(task._id, event.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all cursor-pointer"
              disabled={!onStatusChange}
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TaskCard;

