import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  PackageCheck,
  Plus,
  RefreshCw,
  ShoppingCart,
  Tags,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import SalesChart from '../components/SalesChart';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getDashboardSummary();
      setSummary(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader title="Store overview" description="Loading inventory and sales information…" />
        <LoadingState rows={7} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadSummary} />;
  }

  const stock = summary.stock_distribution || {};
  const totalStockGroups =
    Number(stock.in_stock || 0) + Number(stock.low_stock || 0) + Number(stock.out_of_stock || 0) || 1;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Live Operations"
        title="Welcome back, Gaurav"
        description="Monitor inventory health, sales performance, and products needing attention in real time."
        actions={
          <>
            <button className="button button--secondary" type="button" onClick={loadSummary}>
              <RefreshCw size={17} /> Refresh
            </button>
            <Link className="button button--primary" to="/sales">
              <Plus size={17} /> Record sale
            </Link>
          </>
        }
      />

      <section className="stats-grid">
        <StatCard
          label="Total Products"
          value={summary.total_products}
          helper={`${summary.total_items_sold} items sold overall`}
          icon={Boxes}
          tone="blue"
        />
        <StatCard
          label="Categories"
          value={summary.total_categories}
          helper="Categorized inventory groups"
          icon={Tags}
          tone="violet"
        />
        <StatCard
          label="Low Stock"
          value={summary.low_stock_products}
          helper={`${summary.out_of_stock_products} currently out of stock`}
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard
          label="Total Sales"
          value={formatCurrency(summary.total_sales)}
          helper={`${formatCurrency(summary.sales_today)} sold today`}
          icon={IndianRupee}
          tone="green"
        />
      </section>

      <section className="dashboard-grid dashboard-grid--main">
        <article className="panel panel--wide">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Revenue trend</span>
              <h3>Sales in the last 7 days</h3>
            </div>
            <div className="metric-chip">
              <TrendingUp size={17} /> {formatCurrency(summary.sales_today)} today
            </div>
          </div>
          <SalesChart data={summary.sales_trend} compact />
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Inventory value</span>
              <h3>{formatCurrency(summary.inventory_value)}</h3>
            </div>
            <div className="panel-icon panel-icon--green"><WalletCards size={21} /></div>
          </div>
          <div className="stock-distribution">
            <div className="stock-distribution__row">
              <div><span className="dot dot--green" /> In stock</div>
              <strong>{stock.in_stock || 0}</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${(Number(stock.in_stock || 0) / totalStockGroups) * 100}%` }} />
            </div>
            <div className="stock-distribution__row">
              <div><span className="dot dot--amber" /> Low stock</div>
              <strong>{stock.low_stock || 0}</strong>
            </div>
            <div className="progress-track progress-track--amber">
              <span style={{ width: `${(Number(stock.low_stock || 0) / totalStockGroups) * 100}%` }} />
            </div>
            <div className="stock-distribution__row">
              <div><span className="dot dot--red" /> Out of stock</div>
              <strong>{stock.out_of_stock || 0}</strong>
            </div>
            <div className="progress-track progress-track--red">
              <span style={{ width: `${(Number(stock.out_of_stock || 0) / totalStockGroups) * 100}%` }} />
            </div>
          </div>
          <Link className="text-link" to="/products">Open inventory <PackageCheck size={15} /></Link>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel panel--wide">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Latest activity</span>
              <h3>Recent sales</h3>
            </div>
            <Link className="text-link" to="/reports">View full report</Link>
          </div>
          <div className="table-scroll">
            <table className="data-table data-table--compact">
              <thead>
                <tr><th>Product</th><th>Quantity</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                {summary.recent_sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-avatar"><ShoppingCart size={16} /></div>
                        <strong>{sale.product_name}</strong>
                      </div>
                    </td>
                    <td>{sale.quantity_sold}</td>
                    <td><strong>{formatCurrency(sale.total_amount)}</strong></td>
                    <td className="muted-cell">{formatDateTime(sale.sale_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Needs attention</span>
              <h3>Inventory alerts</h3>
            </div>
            <AlertTriangle className="warning-icon" size={21} />
          </div>
          <div className="alert-list">
            {summary.low_stock_items.map((product) => (
              <div className="alert-item" key={product.id}>
                <div>
                  <strong>{product.product_name}</strong>
                  <span>{product.category}</span>
                </div>
                <div className="alert-item__right">
                  <StatusBadge status={product.stock_status} />
                  <small>{product.quantity} left</small>
                </div>
              </div>
            ))}
          </div>
          <Link className="text-link" to="/products">Manage stock <Boxes size={15} /></Link>
        </article>
      </section>
    </div>
  );
}
