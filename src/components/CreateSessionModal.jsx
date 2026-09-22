import React, { useState, useEffect } from 'react';
import { productApi } from '../api/product.api';
import { auditApi } from '../api/audit.api';
import { X, Check, AlertCircle, ShieldCheck } from './Icons';

export const CreateSessionModal = ({ isOpen, onClose, onSuccess }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [notes, setNotes] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Auto-generate session code
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setSessionCode(`AUD-${timestamp}-${randomSuffix}`);
      setNotes('');
      setError('');
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const res = await productApi.getAll();
      if (res.success && res.data) {
        setProducts(res.data);
        // Default: select all products for ease of use
        setSelectedProductIds(res.data.map((p) => p.id));
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar master produk');
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleToggleProduct = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!sessionCode.trim()) {
      setError('Kode sesi audit wajib diisi');
      return;
    }

    if (selectedProductIds.length === 0) {
      setError('Pilih minimal 1 produk untuk diaudit');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        sessionCode: sessionCode.trim(),
        notes: notes.trim() || undefined,
        productIds: selectedProductIds,
      };

      const res = await auditApi.createSession(payload);
      if (res.success) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Gagal menginisiasi sesi audit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#2563eb" />
            <h3 className="modal-title">Inisiasi Sesi Audit Baru (Snapshotting)</h3>
          </div>
          <button onClick={onClose} className="btn-close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="alert-box alert-danger">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Kode Sesi Audit</label>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '12px' }}
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              placeholder="Contoh: AUD-20260922-001"
              required
            />
            <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              Kode unik untuk menandai sesi audit fisik ini.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Catatan / Keterangan (Opsional)</label>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '12px' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Audit Rutin Bulanan Gudang Utama"
            />
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Pilih Produk yang Akan Di-snapshot Baseline ({selectedProductIds.length} dipilih)
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                style={{ background: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600 }}
              >
                {selectedProductIds.length === products.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </button>
            </div>

            <div className="product-checklist-box">
              {fetchingProducts ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  Memuat katalog produk...
                </div>
              ) : products.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  Belum ada master produk terdaftar di sistem.
                </div>
              ) : (
                products.map((p) => {
                  const isChecked = selectedProductIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`checklist-item ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleToggleProduct(p.id)}
                    >
                      <div className={`checkbox-custom ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <Check size={12} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{p.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                            {p.sku}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                          Stok Sistem Saat Ini: <strong>{p.currentStock} {p.unit}</strong> (akan dikunci sebagai snapshot baseline)
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Batal
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px', marginTop: 0 }} disabled={loading || selectedProductIds.length === 0}>
              {loading ? 'Mengunci Snapshot...' : 'Inisiasi Sesi & Kunci Baseline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
