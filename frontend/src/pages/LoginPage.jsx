import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const user = await login(email, password);
      toast.success(user.role === 'admin' ? 'Logged in as Administrator.' : `Welcome back to ${user.store_name}!`);
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    } catch (loginError) {
      setError(loginError.message || 'Invalid email or password.');
      toast.error(loginError.message || 'Login failed.');
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
          <h2>Welcome Back</h2>
          <p>Access your store dashboard or administration panel</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-stack">
            <label className="form-field">
              <span>Email Address</span>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="form-field">
              <div className="form-field__label-row">
                <span>Password</span>
                <Link className="text-link text-link--sm" to="/forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
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
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={busy}
              />
              <span>Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            className="button button--primary button--full button--auth"
            disabled={busy}
          >
            {busy ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-card__footer">
          <p>
            New to Grainex?{' '}
            <Link className="text-link" to="/register">
              Create a store account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
