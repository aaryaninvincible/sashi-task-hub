import { motion } from 'framer-motion';
import { Bell, FolderKanban, LayoutDashboard, Link2, ListTodo, LogOut, Menu, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getOverdueNotificationsRequest } from '../services/notificationService.js';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListTodo }
];

const AppLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ count: 0, notifications: [] });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const visibleNavItems = isAdmin
    ? [
        ...navItems,
        { to: '/team', label: 'Team', icon: Users },
        { to: '/invites', label: 'Invite Links', icon: Link2 }
      ]
    : navItems;

  useEffect(() => {
    getOverdueNotificationsRequest()
      .then(({ data }) => setNotifications(data))
      .catch(() => setNotifications({ count: 0, notifications: [] }));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-violet-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-80 border-r border-white/5 bg-[#020617]/50 backdrop-blur-3xl px-6 py-8 lg:block shadow-2xl z-50">
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-600/20 mb-4"
          >
            <FolderKanban size={32} className="text-white" />
          </motion.div>
          <p className="text-2xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Sashi's Task Hub
          </p>
          <div className="mt-3 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
              {isAdmin ? 'System Intelligence' : 'Operator Access'}
            </span>
          </div>
        </div>
        
        <nav className="space-y-2">
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300 group ${
                  isActive 
                    ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/30 scale-[1.02]' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={20} className="group-hover:scale-110 transition-transform" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-8 left-6 right-6 space-y-6">
          {/* Notifications Card */}
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Bell size={14} className="text-violet-500" />
                Strategic Alerts
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg shadow-rose-500/30">
                {notifications.count}
              </span>
            </div>
            <div className="space-y-3">
              {notifications.notifications.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                  <div className="w-1 h-1 rounded-full bg-violet-500"></div>
                  <span className="truncate">{item.title}</span>
                </div>
              ))}
              {!notifications.count && <p className="text-[11px] text-slate-600 italic">No urgent directives.</p>}
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-black text-white truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tighter">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 hover:bg-rose-600 px-6 py-4 text-sm font-black text-white transition-all duration-300 border border-white/5 group active:scale-95"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Terminate Session
          </button>
          
          <div className="pt-4 border-t border-white/5">
            <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-slate-700">
              Engineered by <span className="text-violet-600">Sashi Intelligence</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-[60] bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FolderKanban size={20} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-black text-white tracking-tighter leading-none mb-1">Sashi's Hub</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">{isAdmin ? 'Admin' : 'Member'}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-3 bg-white/5 rounded-xl border border-white/10 text-white"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:hidden fixed inset-0 z-50 bg-[#020617] p-8 pt-24"
        >
          <nav className="space-y-4">
            {visibleNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-2xl px-6 py-5 text-lg font-black transition-all ${
                    isActive ? 'bg-violet-600 text-white shadow-xl' : 'text-slate-400'
                  }`
                }
              >
                <Icon size={24} />
                {label}
              </NavLink>
            ))}
          </nav>
          
          <div className="absolute bottom-12 left-8 right-8">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-rose-600 px-6 py-5 text-lg font-black text-white shadow-xl"
            >
              <LogOut size={24} />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="lg:pl-80 pt-0 lg:pt-0">
        <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
t;
