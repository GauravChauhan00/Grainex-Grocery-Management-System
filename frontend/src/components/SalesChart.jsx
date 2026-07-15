import { chartLabel, formatCurrency } from '../utils/formatters';
import EmptyState from './EmptyState';

export default function SalesChart({ data = [], compact = false }) {
  if (!data.length) {
    return <EmptyState title="No chart data" message="Record sales or change the selected date range." />;
  }

  const maximum = Math.max(...data.map((item) => Number(item.total || 0)), 1);

  return (
    <div className={`bar-chart ${compact ? 'bar-chart--compact' : ''}`}>
      <div className="bar-chart__plot">
        {data.map((item) => {
          const total = Number(item.total || 0);
          const height = total === 0 ? 3 : Math.max(8, (total / maximum) * 100);
          return (
            <div className="bar-chart__item" key={item.period}>
              <div className="bar-chart__value">{formatCurrency(total)}</div>
              <div className="bar-chart__track">
                <div className="bar-chart__bar" style={{ height: `${height}%` }} />
              </div>
              <span>{chartLabel(item.period)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
