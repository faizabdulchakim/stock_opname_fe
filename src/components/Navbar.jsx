import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut, User } from './Icons';

export const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isManager = user.role === 'WAREHOUSE_MANAGER';

  return (
    <nav className="app-navbar">
      <div className="navbar-brand">
        <Package size={20} color="#0f172a" />
        <span>Stock Opname & Reconciliation</span>
      </div>

      <div className="navbar-user-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={15} color="#64748b" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>{user.name}</span>
        </div>

        <span className={`badge-role ${isManager ? 'badge-manager' : 'badge-staff'}`}>
          {user.role}
        </span>

        <button onClick={logout} className="btn-logout" title="Keluar">
          <LogOut size={15} />
          <span>Keluar</span>
        </button>
      </div>
    </nav>
  );
};
