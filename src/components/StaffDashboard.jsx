import React, { useState, useEffect, useCallback } from 'react';
import { auditApi } from '../api/audit.api';
import { SubmitCountModal } from './SubmitCountModal';
import { SessionDetailModal } from './SessionDetailModal';
import {
  UserCheck,
  ClipboardList,
  RefreshCw,
  Search,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText
} from './Icons';

export const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await auditApi.getAllSessions();
      if (res.success) {
        setSessions(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar sesi audit');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Filter pending vs history
  const pendingSessions = sessions.filter((s) => s.status === 'INITIATED');
  const historySessions = sessions.filter((s) => s.status !== 'INITIATED');

  // Active list based on tab
  const displayedSessions = (activeTab === 'pending' ? pendingSessions : historySessions).filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.sessionCode.toLowerCase().includes(q) ||
      (s.notes && s.notes.toLowerCase().includes(q)) ||
      (s.createdBy?.name && s.createdBy.name.toLowerCase().includes(q))
    );
  });

  const handleOpenSubmit = (sessionId) => {
    setSelectedSessionId(sessionId);
    setIsSubmitOpen(true);
  };

  const handleOpenDetail = (sessionId) => {
    setSelectedSessionId(sessionId);
    setIsDetailOpen(true);
  };

  const handleCountSubmitted = () => {
    fetchSessions();
    setActiveTab('history');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'INITIATED':
        return <span className="status-badge status-initiated">Menunggu Input Fisik</span>;
      case 'COUNT_SUBMITTED':
        return <span className="status-badge status-submitted">Sudah Disubmit (Review Manager)</span>;
      case 'RECONCILING':
        return <span className="status-badge status-reconciling">Proses Rekonsiliasi...</span>;
      case 'APPROVED':
        return <span className="status-badge status-approved">Disetujui & Selesai</span>;
      case 'REJECTED':
        return <span className="status-badge status-rejected">Ditolak / Hitung Ulang</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="manager-dashboard">
      {/* Header Banner */}
      <div className="dashboard-header-card">
        <div className="header-info">
          <div className="header-badge" style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
            <UserCheck size={16} color="#059669" />
            <span>Warehouse Staff Console</span>
          </div>
          <h1 className="header-title">Tugas Stock Opname & Perhitungan Fisik</h1>
          <p className="header-desc">
            Lihat sesi audit yang ditugaskan oleh Manager, lakukan perhitungan fisik riil di rak gudang, dan kirimkan data hitungan secara batch.
          </p>
        </div>
        <div className="header-actions">
          <button onClick={fetchSessions} className="btn-secondary" title="Segarkan Data">
            <RefreshCw size={16} />
            <span>Segarkan Sesi</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-subtle">
            <Clock size={20} color="#d97706" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{pendingSessions.length}</div>
            <div className="stat-label">Tugas Perlu Dihitung Segera</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-subtle">
            <ClipboardList size={20} color="#2563eb" />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {sessions.filter((s) => s.status === 'COUNT_SUBMITTED').length}
            </div>
            <div className="stat-label">Telah Disubmit (Menunggu Review)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-subtle">
            <CheckCircle2 size={20} color="#059669" />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {sessions.filter((s) => s.status === 'APPROVED').length}
            </div>
            <div className="stat-label">Selesai & Disetujui</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={16} />
          <span>Tugas Perlu Dihitung ({pendingSessions.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FileText size={16} />
          <span>Riwayat Sesi Dikerjakan ({historySessions.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-panel">
        <div className="table-controls">
          <div className="search-bar">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Cari kode sesi atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="alert-box alert-danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <RefreshCw size={24} className="spin-icon" color="#059669" />
            <p>Memuat daftar sesi audit...</p>
          </div>
        ) : displayedSessions.length === 0 ? (
          <div className="empty-state">
            <Package size={40} color="#cbd5e1" />
            <h3>
              {activeTab === 'pending'
                ? 'Tidak ada tugas hitung aktif saat ini'
                : 'Belum ada riwayat sesi yang disubmit'}
            </h3>
            <p>
              {activeTab === 'pending'
                ? 'Semua sesi audit telah dihitung atau belum ada penugasan sesi baru dari Manager.'
                : 'Hasil perhitungan yang telah Anda submit akan muncul di tab ini.'}
            </p>
          </div>
        ) : (
          <div className="table-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Kode Sesi</th>
                    <th>Tanggal Penugasan</th>
                    <th style={{ textAlign: 'center' }}>Jumlah Item</th>
                    <th>Status</th>
                    <th>Manager Inisiator</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedSessions.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>
                          {session.sessionCode}
                        </div>
                        {session.notes && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            {session.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                        {new Date(session.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge-pill">{session.items?.length || 0} item</span>
                      </td>
                      <td>{getStatusBadge(session.status)}</td>
                      <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {session.createdBy?.name || 'Manager'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {session.status === 'INITIATED' ? (
                          <button
                            onClick={() => handleOpenSubmit(session.id)}
                            className="btn-success"
                            style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <ClipboardList size={14} />
                            <span>Input Hitungan Fisik</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDetail(session.id)}
                            className="btn-secondary btn-sm"
                          >
                            <Eye size={14} />
                            <span>Lihat Rincian</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SubmitCountModal
        sessionId={selectedSessionId}
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSuccess={handleCountSubmitted}
      />

      <SessionDetailModal
        sessionId={selectedSessionId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdated={fetchSessions}
      />
    </div>
  );
};
