const StatCard = ({ label, value, tone = 'default' }) => {
  const tones = {
    default: 'bg-white border-slate-200 text-slate-900',
    danger: 'bg-rose-50 border-rose-100 text-rose-600',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    warn: 'bg-amber-50 border-amber-100 text-amber-600'
  };

  return (
    <div className={`rounded-3xl border p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 ${tones[tone]}`}>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value ?? 0}</p>
    </div>
  );
};

export default StatCard;

