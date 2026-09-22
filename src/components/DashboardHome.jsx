import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, CheckCircle2 } from './Icons';

export const DashboardHome = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'WAREHOUSE_MANAGER';

  return (
    <div className="dashboard-container">
      <div className="welcome-card">
        <h2 className="welcome-title">Selamat Datang, {user?.name}! 👋</h2>
        <p className="welcome-desc">
          Anda berhasil masuk ke sistem manajemen stock opname dan rekonsiliasi inventori gudang.
        </p>

        {isManager ? (
          <div className="role-banner banner-manager">
            <ShieldCheck size={24} color="#2563eb" />
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                Mode Warehouse Manager
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                Hak Akses: Inisiasi sesi audit baru (snapshot baseline stok), review hasil hitungan fisik, dan melakukan persetujuan (approval) rekonsiliasi stok resmi.
              </p>
            </div>
          </div>
        ) : (
          <div className="role-banner banner-staff">
            <UserCheck size={24} color="#059669" />
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                Mode Warehouse Staff
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                Hak Akses: Melihat daftar sesi audit yang ditugaskan dan memasukkan hasil hitungan fisik barang secara batch.
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '14px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.82rem' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>Autentikasi JWT dan Session Hook aktif. Tahap selanjutnya: integrasi form inisiasi dan batch count submission.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
