import { useEffect, useState } from 'react';
import {
  Boxes,
  Filter,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastContext';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const emptyForm = {
  product_name: '',
  category_id: '',
  quantity: '0',
  unit_price: '',
  supplier_name: '',
  expiry_date: '',
  low_stock_threshold: '10',
};

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', category_id: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getProducts(filters);
      setProducts(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadProducts, 250);
    return () => window.clearTimeout(timer);
  }, [filters.search, filters.category_id, filters.status]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      product_name: product.product_name,
      category_id: String(product.category_id),
      quantity: String(product.quantity),
      unit_price: String(product.unit_price),
      supplier_name: product.supplier_name || '',
      expiry_date: product.expiry_date || '',
      low_stock_threshold: String(product.low_stock_threshold),
    });
    setModalOpen(true);
  };

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      category_id: Number(form.category_id),
      quantity: Number(form.quantity),
      unit_price: Number(form.unit_price),
      low_stock_threshold: Number(form.low_stock_threshold),
      expiry_date: form.expiry_date || null,
    };

    try {
      const response = editingProduct
        ? await api.updateProduct(editingProduct.id, payload)
        : await api.createProduct(payload);
      toast.success(response.message);
      setModalOpen(false);
      await loadProducts();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await api.deleteProduct(deleteTarget.id);
      toast.success(response.message);
      setDeleteTarget(null);
      await loadProducts();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Inventory Management"
        title="Product Management"
        description="Manage the store inventory, track quantities, and supervise stock levels."
        actions={
          <button className="button button--primary" type="button" onClick={openCreateModal}>
            <Plus size={17} /> Add product
          </button>
        }
      />

      <section className="toolbar-card">
        <label className="search-field">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search product, supplier or category…"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
        </label>
        <div className="filter-field">
          <Filter size={17} />
          <select
            value={filters.category_id}
            onChange={(event) => setFilters((current) => ({ ...current, category_id: event.target.value }))}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <Boxes size={17} />
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="">All stock levels</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
        <div className="result-count"><strong>{products.length}</strong> result(s)</div>
      </section>

      {error ? (
        <ErrorState message={error} onRetry={loadProducts} />
      ) : loading ? (
        <section className="panel"><LoadingState rows={6} /></section>
      ) : products.length === 0 ? (
        <section className="panel">
          <EmptyState
            title="No products match these filters"
            message="Clear the filters or add a new product to the inventory."
            action={<button className="button button--primary" type="button" onClick={openCreateModal}><PackagePlus size={17} /> Add product</button>}
          />
        </section>
      ) : (
        <section className="panel panel--table">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th><th>Category</th><th>Stock</th><th>Unit price</th>
                  <th>Supplier</th><th>Expiry</th><th>Status</th><th className="align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className={product.quantity === 0 ? 'table-row--danger' : ''}>
                    <td>
                      <div className="product-cell">
                        <div className="product-avatar product-avatar--green"><Boxes size={17} /></div>
                        <div><strong>{product.product_name}</strong><span>SKU #{String(product.id).padStart(4, '0')}</span></div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td><strong>{product.quantity}</strong><span className="cell-subtext"> (Min. threshold: {product.low_stock_threshold})</span></td>
                    <td><strong>{formatCurrency(product.unit_price)}</strong></td>
                    <td>{product.supplier_name || '—'}</td>
                    <td>{formatDate(product.expiry_date)}</td>
                    <td><StatusBadge status={product.stock_status} /></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-button icon-button--edit" type="button" onClick={() => openEditModal(product)} aria-label={`Edit ${product.product_name}`}><Pencil size={16} /></button>
                        <button className="icon-button icon-button--delete" type="button" onClick={() => setDeleteTarget(product)} aria-label={`Delete ${product.product_name}`}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add a New Product'}
        description="Specify product details. Fields marked with an asterisk (*) are required."
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">
              <span>Product name *</span>
              <input name="product_name" value={form.product_name} onChange={updateForm} required maxLength="120" placeholder="Example: Premium Basmati Rice" />
            </label>
            <label className="form-field">
              <span>Category *</span>
              <select name="category_id" value={form.category_id} onChange={updateForm} required>
                <option value="">Select category</option>
                {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Supplier name</span>
              <input name="supplier_name" value={form.supplier_name} onChange={updateForm} maxLength="120" placeholder="Example: Fresh Farm Traders" />
            </label>
            <label className="form-field">
              <span>Quantity *</span>
              <input type="number" name="quantity" value={form.quantity} onChange={updateForm} required min="0" step="1" />
            </label>
            <label className="form-field">
              <span>Unit price (₹) *</span>
              <input type="number" name="unit_price" value={form.unit_price} onChange={updateForm} required min="0" step="0.01" placeholder="0.00" />
            </label>
            <label className="form-field">
              <span>Low-stock threshold *</span>
              <input type="number" name="low_stock_threshold" value={form.low_stock_threshold} onChange={updateForm} required min="0" step="1" />
              <small>Triggers a low-stock alert when the quantity falls to or below this level.</small>
            </label>
            <label className="form-field">
              <span>Expiry date</span>
              <input type="date" name="expiry_date" value={form.expiry_date} onChange={updateForm} />
            </label>
          </div>
          <div className="modal__actions">
            <button className="button button--secondary" type="button" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
            <button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editingProduct ? 'Save changes' : 'Add product'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        message={deleteTarget ? `Delete “${deleteTarget.product_name}”? Products with sale history are protected and cannot be removed.` : ''}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
