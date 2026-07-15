import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'No data found', message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><PackageOpen size={28} /></div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
