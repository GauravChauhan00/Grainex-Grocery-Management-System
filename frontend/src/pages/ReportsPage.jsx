import { useEffect, useState } from 'react';
import {
  CalendarRange,
  Download,
  IndianRupee,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Trophy,
} from 'lucide-react';

import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import SalesChart from '../components/SalesChart';
import StatCard from '../components/StatCard';
import { useToast } from '../components/ToastContext';
import { api } from '../services/api';
import {
  formatCurrency,
  formatDateTime,
  monthStartInputValue,
  todayInputValue,
} from '../utils/formatters';

export default function ReportsPage() {
  const toast = useToast();
  const [filters, setFilters] = useState({
    start_date: monthStartInputValue(),
    end_date: todayInputValue(),
    period: 'daily',
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async (activeFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getSalesReport(activeFilters);
      setReport(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleFilter = (event) => {
    event.preventDefault();
    loadReport(filters);
  };

  const exportCsv = () => {
    if (!report?.history?.length) {
      toast.info('There are no report rows to export.');
      return;
    }

    const headers = ['Sale ID', 'Product', 'Category', 'Quantity', 'Price Per Unit', 'Total Amount', 'Sale Date'];
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = report.history.map((sale) => [
      sale.id,
      sale.product_name,
      sale.category,
      sale.quantity_sold,
      sale.price_per_unit,
      sale.total_amount,
      sale.sale_date,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sales-report-${filters.start_date}-to-${filters.end_date}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('CSV report exported.');
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Analytics Dashboard"
        title="Sales Reporting"
        description="Review revenue, transaction history, and top-selling products for any date range."
        actions={<button className="button button--secondary" type="button" onClick={exportCsv}><Download size={17} /> Export CSV</button>}
      />

      <form className="report-filter" onSubmit={handleFilter}>
        <div className="report-filter__title"><CalendarRange size={20} /><div><strong>Filter Records</strong><span>Specify date ranges and interval groupings to analyze performance.</span></div></div>
        <label className="form-field form-field--inline"><span>From</span><input type="date" value={filters.start_date} onChange={(event) => setFilters((current) => ({ ...current, start_date: event.target.value }))} required /></label>
        <label className="form-field form-field--inline"><span>To</span><input type="date" value={filters.end_date} onChange={(event) => setFilters((current) => ({ ...current, end_date: event.target.value }))} required /></label>
        <label className="form-field form-field--inline"><span>Group by</span><select value={filters.period} onChange={(event) => setFilters((current) => ({ ...current, period: event.target.value }))}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
        <button className="button button--primary" type="submit">Apply filters</button>
      </form>

      {error ? (
        <ErrorState message={error} onRetry={() => loadReport(filters)} />
      ) : loading ? (
        <section className="panel"><LoadingState rows={7} /></section>
      ) : report ? (
        <>
          <section className="stats-grid">
            <StatCard label="Report Sales" value={formatCurrency(report.summary.total_sales)} helper="Revenue in selected range" icon={IndianRupee} tone="green" />
            <StatCard label="Transactions" value={report.summary.total_transactions} helper="Completed sale records" icon={ReceiptText} tone="blue" />
            <StatCard label="Items Sold" value={report.summary.total_items_sold} helper="Combined quantity sold" icon={ShoppingBag} tone="violet" />
            <StatCard label="Average Sale" value={formatCurrency(report.summary.average_sale)} helper="Average transaction value" icon={PackageCheck} tone="amber" />
          </section>

          <section className="dashboard-grid dashboard-grid--main">
            <article className="panel panel--wide">
              <div className="panel__header"><div><span className="panel__eyebrow">Selected range</span><h3>Sales performance</h3></div><span className="count-badge">{report.filters.period}</span></div>
              <SalesChart data={report.trend} />
            </article>
            <article className="panel">
              <div className="panel__header"><div><span className="panel__eyebrow">Product ranking</span><h3>Top sellers</h3></div><Trophy className="trophy-icon" size={22} /></div>
              {report.top_products.length === 0 ? (
                <EmptyState title="No top products" message="No sales exist for this date range." />
              ) : (
                <div className="ranking-list">
                  {report.top_products.map((product, index) => (
                    <div className="ranking-item" key={product.product_id}>
                      <div className="ranking-item__number">{index + 1}</div>
                      <div className="ranking-item__content"><strong>{product.product_name}</strong><span>{product.category} · {product.quantity_sold} sold</span></div>
                      <strong>{formatCurrency(product.revenue)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="panel panel--table">
            <div className="panel__header panel__header--padded"><div><span className="panel__eyebrow">Detailed records</span><h3>Sales history</h3></div><span className="count-badge">{report.history.length} rows</span></div>
            {report.history.length === 0 ? (
              <EmptyState title="No sales in this date range" message="Try a wider date range or record a new sale." />
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>ID</th><th>Product</th><th>Category</th><th>Quantity</th><th>Unit price</th><th>Total</th><th>Date</th></tr></thead>
                  <tbody>
                    {report.history.map((sale) => (
                      <tr key={sale.id}>
                        <td><span className="sale-id">#{String(sale.id).padStart(4, '0')}</span></td>
                        <td><strong>{sale.product_name}</strong></td>
                        <td>{sale.category}</td>
                        <td>{sale.quantity_sold}</td>
                        <td>{formatCurrency(sale.price_per_unit)}</td>
                        <td><strong>{formatCurrency(sale.total_amount)}</strong></td>
                        <td className="muted-cell">{formatDateTime(sale.sale_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
