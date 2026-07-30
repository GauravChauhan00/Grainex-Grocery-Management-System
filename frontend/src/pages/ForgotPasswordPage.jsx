import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/ToastContext';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const response = await api.forgotPassword({ email });
      setSuccess(true);
      toast.success(response.message || 'Recovery instructions generated.');
    } catch (err) {
      setError(err.message || 'Failed to submit recovery request.');
      toast.error(err.message || 'Request failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card animate-fade-in">
        <div className="auth-card__header">
          <a 
            className="auth-logo" 
            href="/" 
            onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
            title="Reload Home Page"
          >
            <span className="brand-logo-icon">🍏</span>
            <strong>Grainex</strong>
          </a>
          <h2>Reset Password</h2>
          <p>Retrieve access to your store database profile</p>
        </div>

        {success ? (
          <div className="auth-success-state">
            <CheckCircle size={48} className="success-icon" />
            <h3>Check Server Console</h3>
            <p>
              Since we are in a sandbox development environment, we have logged the simulated password reset link directly in your backend terminal console.
            </p>
            <Link className="button button--primary button--full" to="/login">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="auth-error-banner">
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-stack">
                <label className="form-field">
                  <span>Registered Email Address</span>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={busy}
                    />
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="button button--primary button--full button--auth"
                disabled={busy}
              >
                {busy ? 'Verifying Email…' : 'Send Reset Link'}
              </button>
            </form>

            <div className="auth-card__footer">
              <Link className="text-link text-link--sm" to="/login">
                Cancel and return to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
