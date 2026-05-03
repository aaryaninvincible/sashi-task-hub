import { motion } from 'framer-motion';
import { Activity, BarChart3, Clock, LayoutDashboard, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import TaskCard from '../components/TaskCard.jsx';
import { TASK_STATUSES } from '../constants/taskOptions.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getDashboardRequest } from '../services/dashboardService.js';
import { updateTaskStatusRequest } from '../services/taskService.js';
import { getErrorMessage } from '../utils/errors.js';

const Dashboard = () => {
  const { isAdmin, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const { data } = await getDashboardRequest();
      setDashboard(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const updateStatus = async (taskId, status) => {
    try {
      await updateTaskStatusRequest(taskId, status);
      fetchDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (error) return (
    <div className="rounded-[2rem] bg-rose-500/10 border border-rose-500/20 p-8 flex items-center gap-6 text-rose-400">
      <div className="p-4 bg-rose-500/20 rounded-2xl"><Activity size={32} /></div>
      <div>
        <p className="font-black text-xl uppercase tracking-tighter">System Malfunction</p>
        <p className="text-sm font-bold opacity-80 mt-1">{error}</p>
      </div>
    </div>
  );

  if (!dashboard) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Initializing Hub Systems...</p>
    </div>
  );

  const pieData = Object.entries(dashboard.priorityCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#8b5cf6', '#6366f1', '#f59e0b', '#ef4444'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-10"
    >
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-1 bg-violet-600 rounded-full"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">
              {isAdmin ? 'Operational Overview' : 'Workspace Interface'}
            </p>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white leading-none">
            {isAdmin ? 'Hub Intelligence' : `Welcome, ${user.name.split(' ')[0]}`}
          </h1>
          <p className="mt-4 text-slate-400 font-bold max-w-2xl text-lg leading-relaxed">
            {isAdmin 
              ? 'Synchronized monitoring of project lifecycles, resource allocation, and mission-critical objectives.' 
              : 'Execute your assigned objectives and monitor real-time completion metrics.'}
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-[1.5rem] backdrop-blur-xl shadow-2xl">
          <Clock size={18} className="text-violet-500" />
          <span className="text-xs font-black text-white uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Objectives', value: dashboard.summary.totalTasks, icon: Target, color: 'violet', glow: 'shadow-violet-600/20' },
          { label: 'Domains Underway', value: dashboard.summary.totalProjects, icon: LayoutDashboard, color: 'indigo', glow: 'shadow-indigo-600/20' },
          { label: 'Overdue Protocol', value: dashboard.summary.overdueTasks, icon: Activity, color: 'rose', glow: 'shadow-rose-600/20' },
          { label: 'System Efficiency', value: `${dashboard.summary.completionRate}%`, icon: TrendingUp, color: 'emerald', glow: 'shadow-emerald-600/20' },
        ].map((stat) => (
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            key={stat.label} 
            className="bg-white/5 p-8 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-sm group transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl ${stat.glow}`}>
              <stat.icon className={`text-${stat.color}-500`} size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-4xl font-black text-white mt-2 tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </section>

      {/* Main Analytics Row */}
      <section className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/5 p-1">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          
          <div className="relative p-12 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-2 w-12 bg-violet-600 rounded-full"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-500">Live Mission Insights</p>
            </div>
            <h2 className="text-4xl font-black text-white max-w-xl leading-tight tracking-tighter">
              {dashboard.summary.overdueTasks
                ? `Immediate intervention required for ${dashboard.summary.overdueTasks} critical directives.`
                : 'Workspace operational integrity is at optimal capacity.'}
            </h2>
            
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(dashboard.priorityCounts).map(([priority, count]) => (
                <div key={priority} className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl group hover:bg-white/[0.06] transition-colors">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">{priority}</p>
                  <p className="text-4xl font-black text-white">{count}</p>
                  <div className="h-1.5 w-full mt-6 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / (dashboard.summary.totalTasks || 1)) * 100}%` }}
                      className="h-full rounded-full bg-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-[3rem] border border-white/5 p-10 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-8 left-10 flex items-center gap-3">
            <BarChart3 size={18} className="text-violet-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Priority Logic</p>
          </div>
          <div className="h-72 w-full mt-8 group-hover:scale-105 transition-transform duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ fontWeight: '900', fontSize: '12px', color: '#fff', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Task Execution Row */}
      <section className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black text-white tracking-tighter">Active Directives</h2>
              <span className="px-4 py-1 bg-violet-600/10 border border-violet-600/20 rounded-full text-[10px] font-black uppercase text-violet-400 tracking-widest">
                {dashboard.summary.totalTasks} System Records
              </span>
            </div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {TASK_STATUSES.map((status) => (
              <div key={status} className="space-y-6">
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>
                    {status}
                  </h3>
                  <span className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
                    {dashboard.grouped[status]?.length || 0}
                  </span>
                </div>
                <div className="space-y-6">
                  {(dashboard.grouped[status] || []).slice(0, 3).map((task) => (
                    <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />
                  ))}
                  {!dashboard.grouped[status]?.length && (
                    <div className="h-32 rounded-[2.5rem] border-2 border-dashed border-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-700">
                      Zero Directives in segment
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-black text-white tracking-tighter">Telemetry Log</h2>
          <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-8 shadow-2xl backdrop-blur-sm divide-y divide-white/5">
            {dashboard.recentActivity?.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item._id || `${item.task._id}-${item.createdAt}`} 
                className="py-5 first:pt-0 last:pb-0"
              >
                <div className="flex gap-5">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-violet-600 flex-shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.6)]"></div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tighter mb-1.5 leading-tight">{item.action}</p>
                    <p className="text-[11px] font-bold text-slate-500 truncate w-full">{item.task.title}</p>
                    <div className="mt-3 px-3 py-1 bg-white/[0.03] rounded-lg inline-block border border-white/5">
                      <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {!dashboard.recentActivity?.length && (
              <div className="py-16 text-center">
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Telemetry idle</p>
              </div>
            )}
          </div>

          {dashboard.overdue.length > 0 && (
            <div className="p-8 bg-rose-600/5 rounded-[2.5rem] border border-rose-500/20 shadow-2xl shadow-rose-600/5">
              <h3 className="text-rose-500 font-black uppercase tracking-[0.3em] text-[10px] mb-6">Mission Critical</h3>
              <div className="space-y-4">
                {dashboard.overdue.slice(0, 2).map(task => (
                  <div key={task._id} className="bg-white/5 p-5 rounded-2xl border border-rose-500/10 backdrop-blur-xl group hover:bg-rose-500/10 transition-colors">
                    <p className="text-xs font-black text-white tracking-tighter uppercase">{task.title}</p>
                    <p className="text-[10px] font-black text-rose-500 mt-2 uppercase tracking-widest">Breach: {Math.ceil((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24))} Days</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;


