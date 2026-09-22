import React, { useState } from 'react';
import { auditApi } from '../api/audit.api';
import { X, CheckCircle2, AlertCircle, ShieldCheck, RefreshCw } from './Icons';

export const SessionDetailModal = ({ session, isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen || !session) return null;

  const handleApprove = async () => {
    if (!window.confirm(`Yakin ingin menyetujui sesi ${session.sessionCode}? Stok resmi master produk akan direkonsiliasi otomatis.`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await auditApi.approveSession(session.id);
      setSuccessMsg(res.message || 'Sesi berhasil disetujui dan proses rekonsiliasi sedang berjalan.');
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Gagal menyetujui sesi audit');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await auditApi.rejectSession(session.id, rejectReason.trim());
      if (res.success) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Gagal menolak sesi audit');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'INITIATED':
        return <span className="status-badge status-initiated">1. INITIATED (Menunggu Staf)</span>;
      case 'COUNT_SUBMITTED':
        return <span className="status-badge status-submitted">2. COUNT SUBMITTED (Siap Review)</span>;
      case 'RECONCILING':
        return <span className="status-badge status-reconciling">3. RECONCILING...</span>;
      case 'APPROVED':
        return <span className="status-badge status-approved">4. APPROVED (Selesai Rekonsiliasi)</span>;
      case 'REJECTED':
        return <span className="status-badge status-rejected">REJECTED (Ditolak)</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-large">
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="modal-title">{session.sessionCode}</h3>
              {getStatusBadge(session.status)}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Dibuat oleh: {session.createdBy?.name || 'Manager'} • {new Date(session.createdAt).toLocaleString('id-ID')}
            </p>
          </div>
          <button onClick={onClose} className="btn-close">
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

          {session.notes && (
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <strong>Catatan Sesi:</strong> {session.notes}
            </div>
          )}

          {/* Rincian Status Banner */}
          {session.status === 'INITIATED' && (
            <div className="info-callout">
              <AlertCircle size={18} color="#f59e0b" />
              <span>Sesi ini baru diinisiasi. Menunggu staf gudang memasukkan hasil hitungan fisik barang.</span>
            </div>
          )}

          {session.status === 'COUNT_SUBMITTED' && (
            <div className="info-callout" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}>
              <ShieldCheck size={18} color="#2563eb" />
              <span>Hitungan fisik staf telah masuk! Silakan tinjau kolom <strong>Selisih (Variance)</strong> di bawah sebelum melakukan persetujuan (Approval).</span>
            </div>
          )}

          {session.status === 'APPROVED' && (
            <div className="info-callout" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>Sesi ini telah <strong>Disetujui</strong>. Stok resmi master produk telah diperbarui dan tercatat permanen di <em>Inventory Audit Logs</em>.</span>
            </div>
          )}

          {/* Tabel Items Variance */}
          <div className="table-responsive" style={{ marginTop: '14px' }}>
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
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Belum dihitung</span>
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

          {/* Prompt Reject Section */}
          {showRejectPrompt && (
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
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Tutup
          </button>

          {session.status === 'COUNT_SUBMITTED' && !showRejectPrompt && (
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
