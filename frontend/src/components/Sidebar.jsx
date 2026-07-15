import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  ReceiptIndianRupee,
  ShoppingBasket,
  Tags,
  X,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/sales', label: 'Record Sales', icon: ReceiptIndianRupee },
  { to: '/reports', label: 'Sales Reports', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <div className="brand-mark"><ShoppingBasket size={24} /></div>
          <div>
            <strong>Grainex</strong>
            <span>Store Operations</span>
          </div>
          <button className="sidebar__close" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar__section-label">Workspace</div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__tip">
          <PackagePlus size={22} />
          <div>
            <strong>Inventory tip</strong>
            <p>Review low-stock items before recording new orders.</p>
          </div>
        </div>

        <div className="sidebar__footer">
          <button className="button button--danger button--full sidebar-logout-btn" type="button" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
      {isOpen && <button className="sidebar-overlay" onClick={onClose} aria-label="Close menu" />}
    </>
  );
}
