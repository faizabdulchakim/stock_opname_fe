import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, LogIn, AlertCircle, ShieldCheck, UserCheck } from './Icons';

export const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login gagal, periksa email dan password Anda');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-badge">
            <ShieldCheck size={16} />
            <span>Stock Opname System</span>
          </div>
          <h1 className="auth-title">Masuk ke Akun</h1>
          <p className="auth-subtitle">Sistem Manajemen & Rekonsiliasi Stok Gudang</p>
        </div>

        {error && (
          <div className="alert-box alert-danger" data-testid="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email Address
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="nama@warehouse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
              Password
            </label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            <LogIn size={18} />
            <span>{loading ? 'Memproses...' : 'Masuk Sekarang'}</span>
          </button>
        </form>

        <div className="demo-preset-section">
          <div className="demo-title">Akun Demo Cepat (1-Click Fill)</div>
          <div className="demo-buttons-grid">
            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickFill('manager@warehouse.com', 'password123')}
            >
              <ShieldCheck size={16} />
              <span>Manager Gudang</span>
              <span className="role-name">WAREHOUSE_MANAGER</span>
            </button>

            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickFill('staff@warehouse.com', 'password123')}
            >
              <UserCheck size={16} />
              <span>Staf Gudang</span>
              <span className="role-name">WAREHOUSE_STAFF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
