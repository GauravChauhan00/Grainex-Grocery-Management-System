import { useEffect, useState } from 'react';
import { FolderOpen, Pencil, Plus, Tags, Trash2 } from 'lucide-react';

import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useToast } from '../components/ToastContext';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';

const emptyForm = { name: '', description: '' };

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getCategories();
      setCategories(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setForm({ name: category.name, description: category.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = editingCategory
        ? await api.updateCategory(editingCategory.id, form)
        : await api.createCategory(form);
      toast.success(response.message);
      setModalOpen(false);
      await loadCategories();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await api.deleteCategory(deleteTarget.id);
      toast.success(response.message);
      setDeleteTarget(null);
      await loadCategories();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Product Categories"
        title="Category Management"
        description="Manage and organize the product catalog into structured departments."
        actions={<button className="button button--primary" type="button" onClick={openCreate}><Plus size={17} /> Add category</button>}
      />

      {error ? (
        <ErrorState message={error} onRetry={loadCategories} />
      ) : loading ? (
        <section className="panel"><LoadingState rows={5} /></section>
      ) : categories.length === 0 ? (
        <section className="panel"><EmptyState title="No categories yet" message="Create your first category before adding products." action={<button className="button button--primary" type="button" onClick={openCreate}><Plus size={17} /> Add category</button>} /></section>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <article className="category-card" key={category.id}>
              <div className="category-card__top">
                <div className="category-card__icon"><Tags size={22} /></div>
                <div className="row-actions">
                  <button className="icon-button icon-button--edit" type="button" onClick={() => openEdit(category)} aria-label={`Edit ${category.name}`}><Pencil size={16} /></button>
                  <button className="icon-button icon-button--delete" type="button" onClick={() => setDeleteTarget(category)} aria-label={`Delete ${category.name}`}><Trash2 size={16} /></button>
                </div>
              </div>
              <h3>{category.name}</h3>
              <p>{category.description || 'No description added.'}</p>
              <div className="category-card__footer">
                <span><FolderOpen size={16} /> {category.product_count} product(s)</span>
                <small>Added {formatDate(category.created_at)}</small>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add a New Category'}
        description="Provide a clear, recognizable name and optional description to categorize products."
      >
        <form onSubmit={handleSubmit}>
          <div className="form-stack">
            <label className="form-field">
              <span>Category name *</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required maxLength="80" placeholder="Example: Personal Care" />
            </label>
            <label className="form-field">
              <span>Description</span>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} maxLength="250" rows="4" placeholder="A short explanation of products in this category" />
              <small>{form.description.length}/250 characters</small>
            </label>
          </div>
          <div className="modal__actions">
            <button className="button button--secondary" type="button" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
            <button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editingCategory ? 'Save changes' : 'Add category'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        message={deleteTarget ? `Delete “${deleteTarget.name}”? A category that still contains products cannot be deleted.` : ''}
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
