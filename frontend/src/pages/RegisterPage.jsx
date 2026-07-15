import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, Lock, Mail, Phone, ShieldAlert, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setBusy(true);
    try {
      await register({
        store_name: storeName,
        owner_name: ownerName,
        email,
        phone,
        password,
      });
      toast.success(`Store "${storeName}" registered successfully!`);
      navigate('/dashboard');
    } catch (regError) {
      setError(regError.message || 'Registration failed. Please check details.');
      toast.error(regError.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card animate-fade-in">
        <div className="auth-card__header">
          <Link className="auth-logo" to="/">
            <span className="brand-logo-icon">🍏</span>
            <strong>Grainex</strong>
          </Link>
          <h2>Create Store Account</h2>
          <p>Register your grocery store and initialize your dashboard</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-stack">
            <label className="form-field">
              <span>Store Name *</span>
              <div className="input-with-icon">
                <Building2 size={18} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="Example: Fresh Mart Grocery"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  disabled={busy}
                  maxLength={80}
                  autoComplete="organization"
                />
              </div>
            </label>

            <label className="form-field">
              <span>Owner Full Name *</span>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="Example: Sanjay Kumar"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  disabled={busy}
                  maxLength={80}
                  autoComplete="name"
                />
              </div>
            </label>

            <label className="form-field">
              <span>Email Address *</span>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="form-field">
              <span>Phone Number</span>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  placeholder="9876543210 (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={busy}
                  maxLength={15}
                />
              </div>
            </label>

            <label className="form-field">
              <span>Password *</span>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="form-field">
              <span>Confirm Password *</span>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={busy}
                  autoComplete="new-password"
                />
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="button button--primary button--full button--auth"
            disabled={busy}
          >
            {busy ? 'Creating Store...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-card__footer">
          <p>
            Already have a store registered?{' '}
            <Link className="text-link" to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
