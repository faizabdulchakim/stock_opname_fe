import React, { useState, useEffect, useContext } from 'react';
import { auditApi } from '../api/audit.api';
import { AuthContext } from '../context/AuthContext';
import {
  X,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Clock
} from './Icons';

export const SessionDetailModal = ({ sessionId, isOpen, onClose, onUpdated, isManager: isManagerProp }) => {
  const auth = useContext(AuthContext);
  const isManager = isManagerProp !== undefined ? isManagerProp : (auth?.user?.role === 'WAREHOUSE_MANAGER');

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchDetail();
      setShowRejectPrompt(false);
      setRejectReason('');
      setSuccessMsg('');
    } else {
      setSession(null);
      setError('');
    }
  }, [isOpen, sessionId]);

  const fetchDetail = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await auditApi.getSessionById(sessionId);
      if (res.success && res.data) {
        setSession(res.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat rincian sesi audit');
    } finally {
      setFetching(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui sesi audit ini? Stok produk akan otomatis diperbarui dan dicatat dalam riwayat audit log.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await auditApi.approveSession(sessionId);
      if (res.success) {
        setSuccessMsg(res.message || 'Sesi audit disetujui! Rekonsiliasi stok berjalan di latar belakang.');
        if (onUpdated) onUpdated();
        setTimeout(() => {
          fetchDetail();
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Gagal menyetujui sesi audit');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setError('Mohon masukkan alasan penolakan sesi audit');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await auditApi.rejectSession(sessionId, rejectReason.trim());
      if (res.success) {
        setSuccessMsg('Sesi audit berhasil ditolak.');
        setShowRejectPrompt(false);
        if (onUpdated) onUpdated();
        fetchDetail();
      }
    } catch (err) {
      setError(err.message || 'Gagal menolak sesi audit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'INITIATED':
        return <span className="status-badge status-initiated">Menunggu Hitung Fisik</span>;
      case 'COUNT_SUBMITTED':
        return <span className="status-badge status-submitted">Siap Direview</span>;
      case 'RECONCILING':
        return <span className="status-badge status-reconciling">Proses Rekonsiliasi...</span>;
      case 'APPROVED':
        return <span className="status-badge status-approved">Disetujui & Selesai</span>;
      case 'REJECTED':
        return <span className="status-badge status-rejected">Ditolak / Batal</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  // Calculate summary metrics
  const totalItems = session?.items?.length || 0;
  const totalSnapshot = session?.items?.reduce((acc, curr) => acc + (curr.snapshotStock || 0), 0) || 0;
  const totalCounted = session?.items?.reduce((acc, curr) => acc + (curr.countedStock !== null ? curr.countedStock : 0), 0) || 0;
  const totalVariance = session?.items?.reduce((acc, curr) => acc + (curr.variance !== null ? curr.variance : 0), 0) || 0;
  const hasCountData = session?.items?.some((item) => item.countedStock !== null);

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-large">
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="modal-title">{session?.sessionCode || 'Rincian Sesi Audit'}</h3>
              {session && getStatusBadge(session.status)}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Dibuat oleh: <strong>{session?.createdBy?.name || 'Manager'}</strong> • {session?.createdAt ? new Date(session.createdAt).toLocaleString('id-ID') : '-'}
            </p>
          </div>
          <button onClick={onClose} className="btn-close" aria-label="Tutup Modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert-box alert-danger">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-box alert-success" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{successMsg}</span>
            </div>
          )}

          {fetching ? (
            <div className="loading-state" style={{ padding: '30px' }}>
              <RefreshCw size={24} className="spin-icon" color="#2563eb" />
              <p style={{ marginTop: '10px' }}>Memuat rincian sesi audit...</p>
            </div>
          ) : session ? (
            <>
              {/* Info Cards / Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Produk</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{totalItems} Item</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Snapshot Sistem</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{totalSnapshot} Qty</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Hitungan Fisik</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    {hasCountData ? `${totalCounted} Qty` : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Belum Dihitung</span>}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Net Selisih</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: totalVariance > 0 ? '#047857' : totalVariance < 0 ? '#dc2626' : '#64748b' }}>
                    {hasCountData ? (totalVariance > 0 ? `+${totalVariance}` : totalVariance) : '-'}
                  </div>
                </div>
              </div>

              {/* Status Specific Callouts */}
              {session.status === 'INITIATED' && (
                <div className="info-callout">
                  <Clock size={18} color="#d97706" />
                  <div>
                    <strong>Menunggu Input Fisik:</strong> Baseline stok telah dikunci sebagai snapshot baseline. Menunggu staf gudang memasukkan hasil hitungan fisik barang.
                  </div>
                </div>
              )}

              {session.status === 'COUNT_SUBMITTED' && (
                <div className="info-callout" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}>
                  <ShieldCheck size={18} color="#2563eb" />
                  <div>
                    <strong>Hitungan Fisik Siap Direview:</strong> Data hitungan dari staf lapangan telah masuk.
                    {isManager
                      ? ' Silakan periksa kolom Selisih (Variance) di bawah sebelum menyetujui (Approve) rekonsiliasi stok.'
                      : ' Menunggu Warehouse Manager melakukan peninjauan selisih dan persetujuan (Approval).'}
                  </div>
                </div>
              )}

              {session.status === 'RECONCILING' && (
                <div className="info-callout" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#6d28d9' }}>
                  <RefreshCw size={18} className="spin-icon" color="#6d28d9" />
                  <div>
                    <strong>Proses Rekonsiliasi Berjalan (Non-blocking):</strong> Sistem sedang memperbarui stok master produk dan mencatat log mutasi di database.
                  </div>
                </div>
              )}

              {session.status === 'APPROVED' && (
                <div className="info-callout" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <div>
                    <strong>Sesi Disetujui & Terekonsiliasi:</strong> Stok master produk telah diperbarui secara resmi di sistem dan tercatat permanen di <em>Inventory Audit Logs</em>.
                  </div>
                </div>
              )}

              {session.status === 'REJECTED' && (
                <div className="info-callout" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
                  <AlertCircle size={18} color="#dc2626" />
                  <div>
                    <strong>Sesi Ditolak:</strong> {session.rejectionReason ? `Alasan: "${session.rejectionReason}"` : 'Sesi audit ini telah dibatalkan / ditolak oleh Manager.'}
                  </div>
                </div>
              )}

              {session.notes && (
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                  <strong>Catatan Inisiasi:</strong> {session.notes}
                </div>
              )}

              {/* Items Table */}
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Produk / SKU</th>
                      <th style={{ textAlign: 'right' }}>Snapshot Baseline</th>
                      <th style={{ textAlign: 'right' }}>Hitungan Fisik Staf</th>
                      <th style={{ textAlign: 'right' }}>Selisih (Variance)</th>
                      <th>Keterangan Staf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.items?.map((item, idx) => {
                      const hasCount = item.countedStock !== null;
                      const variance = item.variance;

                      let varianceBadgeClass = 'variance-neutral';
                      if (variance > 0) varianceBadgeClass = 'variance-surplus';
                      if (variance < 0) varianceBadgeClass = 'variance-loss';

                      return (
                        <tr key={item.id || idx}>
                          <td style={{ color: '#94a3b8', width: '40px' }}>{idx + 1}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.product?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.product?.sku}</div>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            {item.snapshotStock} {item.product?.unit || 'PCS'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            {hasCount ? (
                              <span>{item.countedStock} {item.product?.unit || 'PCS'}</span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.82rem' }}>Belum dihitung</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {hasCount ? (
                              <span className={`badge-variance ${varianceBadgeClass}`}>
                                {variance > 0 ? `+${variance}` : variance}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>-</span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {item.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Form Reject Prompt (Manager Only) */}
              {isManager && showRejectPrompt && (
                <form onSubmit={handleReject} style={{ marginTop: '16px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#991b1b', marginBottom: '6px' }}>
                    Alasan Penolakan Sesi Audit:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '12px', background: '#fff', borderColor: '#fca5a5' }}
                    placeholder="Contoh: Selisih terlalu besar, butuh hitung ulang fisik"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setShowRejectPrompt(false)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                      Batal
                    </button>
                    <button type="submit" className="btn-logout" style={{ padding: '6px 14px', fontSize: '0.82rem' }} disabled={loading}>
                      Konfirmasi Tolak Sesi
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="empty-state">
              <AlertCircle size={32} color="#dc2626" />
              <h3>Data sesi tidak ditemukan</h3>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Tutup
          </button>

          {/* Action Buttons: Manager Only when status is COUNT_SUBMITTED */}
          {isManager && session?.status === 'COUNT_SUBMITTED' && !showRejectPrompt && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowRejectPrompt(true)}
                className="btn-danger-outline"
                disabled={loading}
              >
                Tolak (Reject)
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="btn-success"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Approve & Rekonsiliasi Stok'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
