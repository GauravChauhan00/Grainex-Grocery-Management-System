import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Building,
  Boxes,
  Database,
  IndianRupee,
  LogOut,
  Search,
  Shield,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog actions
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, storesRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminStores(search),
      ]);
      setStats(statsRes.data);
      setStores(storesRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load system administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic route protection at execution level
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadAdminData();
  }, [user, search]);

  const handleStatusToggle = async () => {
    if (!statusTarget) return;
    setStatusBusy(true);
    const newStatus = statusTarget.status === 'active' ? 'suspended' : 'active';
    try {
      await api.updateStoreStatus(statusTarget.id, newStatus);
      toast.success(`Store "${statusTarget.name}" status updated to ${newStatus}.`);
      setStatusTarget(null);
      await loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to update store status.');
    } finally {
      setStatusBusy(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await api.deleteStore(deleteTarget.id);
      toast.success(`Store "${deleteTarget.name}" and all records permanently deleted.`);
      setDeleteTarget(null);
      await loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete store.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Super Admin logged out.');
    navigate('/login');
  };

  if (loading && !stats) {
    return (
      <div className="admin-layout-wrapper">
        <LoadingState rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout-wrapper">
        <ErrorState message={error} onRetry={loadAdminData} />
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header__brand">
          <div className="admin-badge">
            <Shield size={18} />
            <span>Super Admin</span>
          </div>
          <h1>Grainex Controller</h1>
        </div>
        <div className="admin-header__actions">
          <button className="button button--secondary" type="button" onClick={loadAdminData}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="button button--danger" type="button" onClick={handleLogout}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon"><Building size={20} /></div>
          <div className="stat-card__content">
            <span className="stat-card__label">Total Registered Stores</span>
            <strong className="stat-card__value">{stats.total_stores}</strong>
            <span className="stat-card__helper">All time creations</span>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__icon"><Activity size={20} /></div>
          <div className="stat-card__content">
            <span className="stat-card__label">Active Store Tenants</span>
            <strong className="stat-card__value">{stats.active_stores}</strong>
            <span className="stat-card__helper">{stats.suspended_stores} suspended accounts</span>
          </div>
        </div>

        <div className="stat-card stat-card--violet">
          <div className="stat-card__icon"><Boxes size={20} /></div>
          <div className="stat-card__content">
            <span className="stat-card__label">Total System Products</span>
            <strong className="stat-card__value">{stats.total_products}</strong>
            <span className="stat-card__helper">Sum of all store item catalog groups</span>
          </div>
        </div>

        <div className="stat-card stat-card--amber">
          <div className="stat-card__icon"><Database size={20} /></div>
          <div className="stat-card__content">
            <span className="stat-card__label">Total Sales Recorded</span>
            <strong className="stat-card__value">{stats.total_sales}</strong>
            <span className="stat-card__helper">System-wide transaction counts</span>
          </div>
        </div>
      </section>

      {/* Main Stores Directory Table */}
      <section className="panel panel--table admin-panel">
        <div className="panel__header panel__header--padded">
          <div>
            <span className="panel__eyebrow">Directory</span>
            <h3>Registered Grocery Stores</h3>
          </div>
          <div className="toolbar-card toolbar-card--admin">
            <label className="search-field">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search store name, owner, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Store Details</th>
                <th>Owner Info</th>
                <th>Email</th>
                <th>Status</th>
                <th>Billing Tier</th>
                <th>Created At</th>
                <th className="align-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center muted-cell py-6">
                    No grocery store accounts found matching criteria.
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className={store.status === 'suspended' ? 'table-row--danger' : ''}>
                    <td><strong>#{store.id}</strong></td>
                    <td>
                      <div className="product-cell">
                        <div className="product-avatar"><Building size={16} /></div>
                        <strong>{store.name}</strong>
                      </div>
                    </td>
                    <td>{store.owner_name}</td>
                    <td>{store.email}</td>
                    <td>
                      <span className={`status-badge status-badge--${store.status === 'active' ? 'green' : 'red'}`}>
                        {store.status}
                      </span>
                    </td>
                    <td>
                      <span className="plan-chip">{store.plan.toUpperCase()}</span>
                    </td>
                    <td className="muted-cell">{store.created_at}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className={`icon-button ${store.status === 'active' ? 'icon-button--warning' : 'icon-button--success'}`}
                          type="button"
                          onClick={() => setStatusTarget(store)}
                          title={store.status === 'active' ? 'Suspend Store' : 'Activate Store'}
                        >
                          {store.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button
                          className="icon-button icon-button--delete"
                          type="button"
                          onClick={() => setDeleteTarget(store)}
                          title="Delete Store"
                          disabled={store.id === 1} // Protect default seeded store
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Future Expansion Planners (Monetization & Plans Placeholders) */}
      <section className="dashboard-grid dashboard-grid--admin">
        <article className="panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Monetization Controls</span>
              <h3>Subscription Plans</h3>
            </div>
            <Coins className="trophy-icon" size={22} />
          </div>
          <div className="alert-list">
            <div className="alert-item">
              <div>
                <strong>Free Basic Tier</strong>
                <span>Allows up to 100 products and basic POS.</span>
              </div>
              <span className="plan-badge">Default</span>
            </div>
            <div className="alert-item">
              <div>
                <strong>Pro Shop Tier</strong>
                <span>Unlimited products, CSV export, multi-user.</span>
              </div>
              <span className="plan-badge plan-badge--green">₹1,499/mo</span>
            </div>
            <div className="alert-item">
              <div>
                <strong>Enterprise Franchise</strong>
                <span>Multi-location sync, dedicated SLA.</span>
              </div>
              <span className="plan-badge plan-badge--violet">Custom Quote</span>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Analytics Roadmap</span>
              <h3>Future Revenue Pipelines</h3>
            </div>
            <Activity className="warning-icon" size={22} />
          </div>
          <div className="info-card">
            <AlertTriangle size={22} />
            <div>
              <strong>Payment Gateways & Billing Integration</strong>
              <p>
                In the next launch phase, Stripe Subscriptions and Razorpay invoice generation nodes will bind directly here, letting admins adjust rates, issue promotional discounts, and check payment status registers automatically.
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Dialog: Status Toggle */}
      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={statusTarget?.status === 'active' ? 'Suspend Store Account?' : 'Activate Store Account?'}
        message={
          statusTarget
            ? `Are you sure you want to change the status of "${statusTarget.name}"? Suspended stores cannot log in or record sales until reactivated.`
            : ''
        }
        confirmLabel={statusTarget?.status === 'active' ? 'Suspend' : 'Activate'}
        busy={statusBusy}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusToggle}
      />

      {/* Dialog: Delete Store */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Permanently Delete Store?"
        message={
          deleteTarget
            ? `WARNING: This will permanently delete store "${deleteTarget.name}" and all associated products, categories, and sales transactions. This action CANNOT be undone.`
            : ''
        }
        confirmLabel="Delete Permanently"
        busy={deleteBusy}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteStore}
      />
    </div>
  );
}
