import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ label, value, helper, icon: Icon, tone = 'blue' }) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon size={22} />
      </div>
      <div className="stat-card__content">
        <span className="stat-card__label">{label}</span>
        <strong>{value}</strong>
        {helper && (
          <span className="stat-card__helper">
            <ArrowUpRight size={14} /> {helper}
          </span>
        )}
      </div>
    </article>
  );
}
