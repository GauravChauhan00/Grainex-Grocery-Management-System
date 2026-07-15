import { AlertTriangle } from 'lucide-react';

import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={busy ? () => {} : onClose} size="small">
      <div className="confirm-dialog">
        <div className="confirm-dialog__icon"><AlertTriangle size={24} /></div>
        <p>{message}</p>
      </div>
      <div className="modal__actions">
        <button className="button button--secondary" type="button" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button className="button button--danger" type="button" onClick={onConfirm} disabled={busy}>
          {busy ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
