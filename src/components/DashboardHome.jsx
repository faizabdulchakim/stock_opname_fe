import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ManagerDashboard } from './ManagerDashboard';
import { UserCheck, ShieldCheck } from './Icons';

export const DashboardHome = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'WAREHOUSE_MANAGER';

  if (isManager) {
    return <ManagerDashboard />;
  }

  // Temporary Staff Welcome Banner (Will be replaced with StaffDashboard in the next step)
  return (
    <div className="dashboard-container">
      <div className="welcome-card">
        <h2 className="welcome-title">Selamat Datang, {user?.name}! 👋</h2>
        <p className="welcome-desc">
          Anda berhasil masuk ke sistem manajemen stock opname dan rekonsiliasi inventori gudang.
        </p>

        <div className="role-banner banner-staff">
          <UserCheck size={24} color="#059669" />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
              Mode Warehouse Staff
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
              Hak Akses: Melihat daftar sesi audit aktif yang ditugaskan dan memasukkan hasil hitungan fisik barang secara batch.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ color: '#475569', fontSize: '0.88rem' }}>
            Saat ini Anda login sebagai <strong>Warehouse Staff</strong>. Untuk menguji fitur Inisiasi Sesi, Snapshotting, dan Approval Rekonsiliasi, Anda dapat beralih ke akun <strong>Warehouse Manager</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
