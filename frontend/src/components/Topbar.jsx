import { Bell, Menu, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageNames = {
  '/dashboard': 'Dashboard',
  '/products': 'Product Management',
  '/categories': 'Category Management',
  '/sales': 'Sales Management',
  '/reports': 'Sales Reporting',
};

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const pageName = pageNames[location.pathname] || 'Grocery Management';
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const name = user?.name || 'Store Admin';
  const roleText = user?.role === 'admin' ? 'System Admin' : 'Store Admin';
  const storeName = user?.store_name || 'Grocery Management Store';

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="icon-button mobile-menu" type="button" onClick={onMenuClick}>
          <Menu size={21} />
        </button>
        <div className="topbar__brand-container">
          <div className="topbar__store-badge animate-fade-in">
            <span className="store-badge-icon">🏪</span>
            <span className="store-badge-name">{storeName}</span>
          </div>
          <h1>{pageName}</h1>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__date">{formattedDate}</div>
        <Link className="icon-button topbar-search" to="/products" aria-label="Open product search">
          <Search size={19} />
        </Link>
        <button className="icon-button notification-button" type="button" aria-label="Notifications">
          <Bell size={19} />
          <span />
        </button>
        <div className="user-chip">
          <div className="user-chip__avatar">{name.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{name}</strong>
            <span>{roleText}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
