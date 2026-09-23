import React, { useState, useEffect } from 'react';
import { auditApi } from '../api/audit.api';
import { X, ClipboardList, Send, AlertCircle, CheckCircle2, RefreshCw } from './Icons';

export const SubmitCountModal = ({ isOpen, sessionId, onClose, onSuccess }) => {
  const [session, setSession] = useState(null);
  const [formItems, setFormItems] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSessionData();
    } else {
      setSession(null);
      setFormItems([]);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, sessionId]);

  const fetchSessionData = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await auditApi.getSessionById(sessionId);
      if (res.success && res.data) {
        setSession(res.data);
        const mappedItems = (res.data.items || []).map((item) => ({
          productId: item.productId,
          productName: item.product?.name || 'Produk',
          sku: item.product?.sku || '-',
          unit: item.product?.unit || 'PCS',
          countedStock: item.countedStock !== null ? String(item.countedStock) : '',
          notes: item.notes || '',
        }));
        setFormItems(mappedItems);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat rincian sesi audit');
    } finally {
      setFetching(false);
    }
  };

  const handleCountChange = (index, value) => {
    const updated = [...formItems];
    updated[index].countedStock = value;
    setFormItems(updated);
  };

  const handleNotesChange = (index, value) => {
    const updated = [...formItems];
    updated[index].notes = value;
    setFormItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validations
    for (let i = 0; i < formItems.length; i++) {
      const item = formItems[i];
      if (item.countedStock === '' || item.countedStock === undefined) {
        setError(`Mohon isi jumlah fisik untuk produk "${item.productName}" (${item.sku})`);
        return;
      }
      const num = Number(item.countedStock);
      if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
        setError(`Jumlah fisik untuk "${item.productName}" harus berupa bilangan bulat positif (>= 0)`);
        return;
      }
    }

    setLoading(true);
    try {
      const payloadItems = formItems.map((item) => ({
        productId: item.productId,
        countedStock: parseInt(item.countedStock, 10),
        notes: item.notes.trim() || undefined,
      }));

      const res = await auditApi.submitCounts(sessionId, payloadItems);
      if (res.success) {
        setSuccessMsg('Hasil hitungan fisik berhasil disimpan dan siap direview oleh Manager!');
        setTimeout(() => {
          onSuccess(res.data);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengirim hasil hitungan fisik');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-large">
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={20} color="#059669" />
              <h3 className="modal-title">
                Input Hasil Hitungan Fisik ({session?.sessionCode || 'Memuat...'})
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Masukkan jumlah fisik riil barang yang dihitung langsung di rak gudang secara batch.
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

          {session?.notes && (
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <strong>Instruksi / Catatan Manager:</strong> {session.notes}
            </div>
          )}

          {fetching ? (
            <div className="loading-state" style={{ padding: '30px' }}>
              <RefreshCw size={24} className="spin-icon" color="#059669" />
              <p style={{ marginTop: '10px' }}>Memuat daftar item yang harus dihitung...</p>
            </div>
          ) : (
            <form id="count-form" onSubmit={handleSubmit}>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>SKU</th>
                      <th>Nama Produk</th>
                      <th style={{ width: '150px' }}>Hitungan Fisik (Qty)</th>
                      <th style={{ width: '240px' }}>Catatan / Kondisi Barang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formItems.map((item, idx) => (
                      <tr key={item.productId || idx}>
                        <td style={{ color: '#94a3b8', width: '40px' }}>{idx + 1}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                            {item.sku}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.productName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Satuan: {item.unit}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              className="form-input form-input-table"
                              placeholder="0"
                              value={item.countedStock}
                              onChange={(e) => handleCountChange(idx, e.target.value)}
                              required
                              disabled={loading}
                              aria-label={`Hitungan fisik ${item.productName}`}
                            />
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                              {item.unit}
                            </span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input form-input-table"
                            placeholder="Opsional (cth: Rak A-01, 1 rusak)"
                            value={item.notes}
                            onChange={(e) => handleNotesChange(idx, e.target.value)}
                            disabled={loading}
                            aria-label={`Catatan ${item.productName}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Batal
          </button>
          <button
            type="submit"
            form="count-form"
            className="btn-success"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            disabled={loading || fetching || formItems.length === 0}
          >
            <Send size={16} />
            <span>{loading ? 'Menyimpan Hitungan...' : 'Kirim Hasil Hitungan Fisik'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
