import { useEffect, useMemo, useState } from 'react';
import {
  BadgeIndianRupee,
  Boxes,
  CheckCircle2,
  PackageCheck,
  ReceiptIndianRupee,
  ShoppingCart,
} from 'lucide-react';

import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastContext';
import { api } from '../services/api';
import { formatCurrency, formatDateTime, todayInputValue } from '../utils/formatters';

export default function SalesPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({ product_id: '', quantity_sold: '1', sale_date: todayInputValue() });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productResponse, salesResponse] = await Promise.all([
        api.getProducts(),
        api.getSales({ limit: 40 }),
      ]);
      setProducts(productResponse.data);
      setSales(salesResponse.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === Number(form.product_id)),
    [products, form.product_id],
  );
  const quantity = Number(form.quantity_sold || 0);
  const calculatedTotal = selectedProduct ? selectedProduct.unit_price * quantity : 0;
  const availableProducts = products.filter((product) => product.quantity > 0);
  const lowStockCount = products.filter(
    (product) => product.quantity > 0 && product.quantity <= product.low_stock_threshold,
  ).length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.createSale({
        product_id: Number(form.product_id),
        quantity_sold: Number(form.quantity_sold),
        sale_date: form.sale_date,
      });
      toast.success(response.message);
      setForm({ product_id: '', quantity_sold: '1', sale_date: todayInputValue() });
      await loadData();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Point of Sale (POS)"
        title="Record a Sale"
        description="Select a product and specify the quantity to record a new transaction. The system automatically calculates totals and updates inventory levels."
      />

      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : loading ? (
        <section className="panel"><LoadingState rows={6} /></section>
      ) : (
        <>
          <section className="sales-layout">
            <article className="panel sales-form-card">
              <div className="panel__header">
                <div><span className="panel__eyebrow">POS Checkout</span><h3>Transaction Details</h3></div>
                <div className="panel-icon panel-icon--green"><ReceiptIndianRupee size={22} /></div>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-stack">
                  <label className="form-field">
                    <span>Product *</span>
                    <select value={form.product_id} onChange={(event) => setForm((current) => ({ ...current, product_id: event.target.value }))} required>
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option value={product.id} key={product.id} disabled={product.quantity === 0}>
                          {product.product_name} — {product.quantity} in stock{product.quantity === 0 ? ' (Out of stock)' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="form-grid">
                    <label className="form-field">
                      <span>Quantity sold *</span>
                      <input type="number" value={form.quantity_sold} min="1" max={selectedProduct?.quantity || undefined} step="1" onChange={(event) => setForm((current) => ({ ...current, quantity_sold: event.target.value }))} required />
                    </label>
                    <label className="form-field">
                      <span>Sale date *</span>
                      <input type="date" value={form.sale_date} onChange={(event) => setForm((current) => ({ ...current, sale_date: event.target.value }))} required />
                    </label>
                  </div>
                </div>

                <div className="sale-preview">
                  <div>
                    <span>Available stock</span>
                    <strong>{selectedProduct ? `${selectedProduct.quantity} units` : 'Select product'}</strong>
                  </div>
                  <div>
                    <span>Price per unit</span>
                    <strong>{selectedProduct ? formatCurrency(selectedProduct.unit_price) : '—'}</strong>
                  </div>
                  <div className="sale-preview__total">
                    <span>Total amount</span>
                    <strong>{formatCurrency(calculatedTotal)}</strong>
                  </div>
                </div>

                {selectedProduct && quantity > selectedProduct.quantity && (
                  <div className="inline-error">Quantity cannot exceed the available stock of {selectedProduct.quantity}.</div>
                )}

                <button className="button button--primary button--full" type="submit" disabled={saving || !selectedProduct || quantity <= 0 || quantity > selectedProduct.quantity}>
                  <CheckCircle2 size={18} /> {saving ? 'Recording sale…' : 'Confirm and record sale'}
                </button>
              </form>
            </article>

            <div className="sales-side-stack">
              <article className="mini-summary-card">
                <div className="mini-summary-card__icon"><PackageCheck size={21} /></div>
                <div><span>Sellable products</span><strong>{availableProducts.length}</strong></div>
              </article>
              <article className="mini-summary-card mini-summary-card--amber">
                <div className="mini-summary-card__icon"><Boxes size={21} /></div>
                <div><span>Low-stock products</span><strong>{lowStockCount}</strong></div>
              </article>
              <article className="mini-summary-card mini-summary-card--violet">
                <div className="mini-summary-card__icon"><BadgeIndianRupee size={21} /></div>
                <div><span>Recent transactions</span><strong>{sales.length}</strong></div>
              </article>
              <article className="info-card">
                <ShoppingCart size={22} />
                <div><strong>Inventory Auto-Sync</strong><p>Stock levels are verified and adjusted in real time during checkout to ensure accuracy and prevent overselling.</p></div>
              </article>
            </div>
          </section>

          <section className="panel panel--table">
            <div className="panel__header panel__header--padded">
              <div><span className="panel__eyebrow">Saved transactions</span><h3>Recent sales history</h3></div>
              <span className="count-badge">{sales.length} records</span>
            </div>
            {sales.length === 0 ? (
              <EmptyState title="No sales recorded" message="Use the form above to create the first sale." />
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>Sale ID</th><th>Product</th><th>Category</th><th>Quantity</th><th>Unit price</th><th>Total</th><th>Date</th></tr></thead>
                  <tbody>
                    {sales.map((sale) => (
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
      )}
    </div>
  );
}
