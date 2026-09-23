import React, { useState, useEffect, useCallback } from 'react';
import { auditApi } from '../api/audit.api';
import { productApi } from '../api/product.api';
import { CreateSessionModal } from './CreateSessionModal';
import { SessionDetailModal } from './SessionDetailModal';
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Package,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  Layers
} from './Icons';

export const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'products' | 'logs'
  const [sessions, setSessions] = useState([]);
  const [products, setProducts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await auditApi.getAllSessions(statusFilter || undefined);
      if (res.success) {
        setSessions(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar sesi audit');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchProducts = async () => {
    try {
      const res = await productApi.getAll();
      if (res.success) {
        setProducts(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await auditApi.getAuditLogs();
      if (res.success) {
        setAuditLogs(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchSessions();
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'logs') {
      fetchAuditLogs();
    }
  }, [activeTab, fetchSessions]);

  // Statistics
  const stats = {
    total: sessions.length,
    initiated: sessions.filter((s) => s.status === 'INITIATED').length,
    submitted: sessions.filter((s) => s.status === 'COUNT_SUBMITTED').length,
    approved: sessions.filter((s) => s.status === 'APPROVED').length,
  };

  const handleOpenDetail = (sessionId) => {
    setSelectedSessionId(sessionId);
    setIsDetailOpen(true);
  };

  const handleSessionCreated = () => {
    fetchSessions();
    setActiveTab('sessions');
  };

  const handleSessionUpdated = () => {
    fetchSessions();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'logs') fetchAuditLogs();
  };

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.sessionCode.toLowerCase().includes(q) ||
      (s.notes && s.notes.toLowerCase().includes(q)) ||
      (s.createdBy?.name && s.createdBy.name.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'INITIATED':
        return <span className="status-badge status-initiated">Menunggu Hitung</span>;
      case 'COUNT_SUBMITTED':
        return <span className="status-badge status-submitted">Siap Direview</span>;
      case 'RECONCILING':
        return <span className="status-badge status-reconciling">Proses Rekonsiliasi...</span>;
      case 'APPROVED':
        return <span className="status-badge status-approved">Disetujui</span>;
      case 'REJECTED':
        return <span className="status-badge status-rejected">Ditolak</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="manager-dashboard">
      {/* Header Banner */}
      <div className="dashboard-header-card">
        <div className="header-info">
          <div className="header-badge">
            <ShieldCheck size={16} color="#2563eb" />
            <span>Warehouse Manager Console</span>
          </div>
          <h1 className="header-title">Manajemen Stock Opname & Baseline Stok</h1>
          <p className="header-desc">
            Inisiasi audit fisik berkala, kunci snapshot baseline inventori, review selisih fisik, dan setujui rekonsiliasi asinkron.
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary btn-action-create"
          >
            <Plus size={18} />
            <span>Inisiasi Sesi Audit Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-subtle">
            <Layers size={20} color="#2563eb" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Sesi Audit</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-subtle">
            <Clock size={20} color="#d97706" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.initiated}</div>
            <div className="stat-label">Menunggu Input Fisik Staf</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-indigo-subtle">
            <FileText size={20} color="#4f46e5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.submitted}</div>
            <div className="stat-label">Perlu Review & Persetujuan</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-subtle">
            <CheckCircle2 size={20} color="#059669" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Sesi Disetujui & Terekonsiliasi</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <Layers size={16} />
          <span>Daftar Sesi Audit ({sessions.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={16} />
          <span>Katalog & Stok Master Produk</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <History size={16} />
          <span>Riwayat Audit Log (Audit Trail)</span>
        </button>
      </div>

      {/* Tab Content: Sesi Audit */}
      {activeTab === 'sessions' && (
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

            <div className="filter-group">
              <span className="filter-label">Filter Status:</span>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="INITIATED">INITIATED (Menunggu Input)</option>
                <option value="COUNT_SUBMITTED">COUNT_SUBMITTED (Siap Review)</option>
                <option value="RECONCILING">RECONCILING (Proses)</option>
                <option value="APPROVED">APPROVED (Disetujui)</option>
                <option value="REJECTED">REJECTED (Ditolak)</option>
              </select>

              <button onClick={fetchSessions} className="btn-icon" title="Segarkan Data">
                <RefreshCw size={16} color="#64748b" />
              </button>
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
              <RefreshCw size={24} className="spin-icon" color="#2563eb" />
              <p>Memuat daftar sesi audit...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="empty-state">
              <Package size={40} color="#cbd5e1" />
              <h3>Belum ada sesi audit ditemukan</h3>
              <p>Klik tombol "+ Inisiasi Sesi Audit Baru" untuk memulai siklus stock opname.</p>
            </div>
          ) : (
            <div className="table-card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Kode Sesi</th>
                      <th>Tanggal Inisiasi</th>
                      <th style={{ textAlign: 'center' }}>Total Produk</th>
                      <th>Status</th>
                      <th>Inisiator</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => (
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
                          <span className="badge-pill">
                            {session.items?.length || 0} item
                          </span>
                        </td>
                        <td>{getStatusBadge(session.status)}</td>
                        <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                          {session.createdBy?.name || 'Manager'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {session.status === 'COUNT_SUBMITTED' ? (
                            <button
                              onClick={() => handleOpenDetail(session.id)}
                              className="btn-review-highlight"
                            >
                              <ShieldCheck size={14} />
                              <span>Review Selisih</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenDetail(session.id)}
                              className="btn-secondary btn-sm"
                            >
                              Detail Sesi
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
      )}

      {/* Tab Content: Master Produk */}
      {activeTab === 'products' && (
        <div className="tab-panel">
          <div className="table-controls" style={{ justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.9rem', color: '#475569' }}>
              Daftar stok fisik terkini di database master produk gudang.
            </div>
            <button onClick={fetchProducts} className="btn-icon" title="Segarkan Data Produk">
              <RefreshCw size={16} color="#64748b" />
            </button>
          </div>

          <div className="table-card">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode SKU</th>
                    <th>Nama Produk</th>
                    <th style={{ textAlign: 'right' }}>Stok Fisik Terkini</th>
                    <th>Satuan</th>
                    <th>Terakhir Diperbarui</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={p.id}>
                      <td style={{ color: '#94a3b8', width: '40px' }}>{idx + 1}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem' }}>
                          {p.sku}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: p.currentStock < 10 ? '#dc2626' : '#0f172a' }}>
                        {p.currentStock}
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{p.unit}</td>
                      <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                        {new Date(p.updatedAt).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="tab-panel">
          <div className="table-controls" style={{ justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.9rem', color: '#475569' }}>
              Catatan historis permanen setiap perubahan stok (Audit Trail) hasil dari sesi rekonsiliasi.
            </div>
            <button onClick={fetchAuditLogs} className="btn-icon" title="Segarkan Log">
              <RefreshCw size={16} color="#64748b" />
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <div className="empty-state">
              <History size={40} color="#cbd5e1" />
              <h3>Belum ada riwayat rekonsiliasi tercatat</h3>
              <p>Log akan tercatat secara otomatis ketika Manager melakukan persetujuan (Approve) sesi audit.</p>
            </div>
          ) : (
            <div className="table-card">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Produk / SKU</th>
                      <th style={{ textAlign: 'right' }}>Sebelum</th>
                      <th style={{ textAlign: 'right' }}>Sesudah</th>
                      <th style={{ textAlign: 'right' }}>Penyesuaian</th>
                      <th>Alasan / Sesi</th>
                      <th>Eksekutor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => {
                      const changeQty = log.changeQty;
                      const isPositive = changeQty > 0;
                      return (
                        <tr key={log.id}>
                          <td style={{ color: '#64748b', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                            {new Date(log.createdAt).toLocaleString('id-ID')}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.product?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.product?.sku}</div>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{log.beforeStock}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{log.afterStock}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={`badge-variance ${isPositive ? 'variance-surplus' : 'variance-loss'}`}>
                              {isPositive ? `+${changeQty}` : changeQty}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                            {log.reason || 'Rekonsiliasi Stock Opname'}
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                            {log.actionBy?.name || 'Manager'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateSessionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleSessionCreated}
      />

      <SessionDetailModal
        sessionId={selectedSessionId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdated={handleSessionUpdated}
      />
    </div>
  );
};
