import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { ManagerDashboard } from '../components/ManagerDashboard';
import { auditApi } from '../api/audit.api';
import { productApi } from '../api/product.api';

// Mock APIs
jest.mock('../api/audit.api');
jest.mock('../api/product.api');

const mockSessions = [
  {
    id: 1,
    sessionCode: 'AUD-20260922-001',
    status: 'INITIATED',
    notes: 'Audit Rutin Gudang Utama',
    createdAt: '2026-09-22T10:00:00.000Z',
    createdBy: { id: 1, name: 'Budi Manager' },
    items: [
      { id: 1, snapshotStock: 100, countedStock: null, variance: null, product: { sku: 'PRD-001', name: 'Indomie', unit: 'DUS' } }
    ],
  },
  {
    id: 2,
    sessionCode: 'AUD-20260922-002',
    status: 'COUNT_SUBMITTED',
    notes: 'Audit Mingguan',
    createdAt: '2026-09-22T11:00:00.000Z',
    createdBy: { id: 1, name: 'Budi Manager' },
    items: [
      { id: 2, snapshotStock: 50, countedStock: 48, variance: -2, product: { sku: 'PRD-002', name: 'Kopi', unit: 'PCS' } }
    ],
  },
];

const mockProducts = [
  { id: 1, sku: 'PRD-001', name: 'Indomie Goreng', currentStock: 100, unit: 'DUS', updatedAt: '2026-09-22T10:00:00.000Z' },
  { id: 2, sku: 'PRD-002', name: 'Kopi Kapal Api', currentStock: 50, unit: 'PCS', updatedAt: '2026-09-22T10:00:00.000Z' },
];

const mockAuditLogs = [
  {
    id: 1,
    beforeStock: 50,
    afterStock: 48,
    changeQty: -2,
    reason: 'Stock Opname AUD-20260922-002',
    createdAt: '2026-09-22T12:00:00.000Z',
    product: { sku: 'PRD-002', name: 'Kopi Kapal Api' },
    actionBy: { name: 'Budi Manager' },
  },
];

describe('ManagerDashboard Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auditApi.getAllSessions.mockResolvedValue({ success: true, data: mockSessions });
    productApi.getAll.mockResolvedValue({ success: true, data: mockProducts });
    auditApi.getAuditLogs.mockResolvedValue({ success: true, data: mockAuditLogs });
  });

  it('renders manager header, stats, and audit sessions table', async () => {
    await act(async () => {
      render(<ManagerDashboard />);
    });

    expect(screen.getByText(/Warehouse Manager Console/i)).toBeInTheDocument();
    expect(screen.getByText(/Manajemen Stock Opname & Baseline Stok/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Sesi Audit/i)).toBeInTheDocument();

    // Verify session code is rendered
    expect(await screen.findByText('AUD-20260922-001')).toBeInTheDocument();
    expect(screen.getByText('AUD-20260922-002')).toBeInTheDocument();

    // Verify status badges
    expect(screen.getByText(/Menunggu Hitung/i)).toBeInTheDocument();
    expect(screen.getByText(/Siap Direview/i)).toBeInTheDocument();
  });

  it('allows switching to product catalog tab and audit logs tab', async () => {
    await act(async () => {
      render(<ManagerDashboard />);
    });

    // Switch to Products Tab
    const productTabBtn = screen.getByRole('button', { name: /Katalog & Stok Master Produk/i });
    await act(async () => {
      fireEvent.click(productTabBtn);
    });

    expect(await screen.findByText('Indomie Goreng')).toBeInTheDocument();
    expect(screen.getByText('PRD-001')).toBeInTheDocument();

    // Switch to Audit Logs Tab
    const logsTabBtn = screen.getByRole('button', { name: /Riwayat Audit Log/i });
    await act(async () => {
      fireEvent.click(logsTabBtn);
    });

    expect(await screen.findByText('Stock Opname AUD-20260922-002')).toBeInTheDocument();
  });

  it('opens Create Session Modal when clicking Inisiasi Sesi Audit Baru', async () => {
    await act(async () => {
      render(<ManagerDashboard />);
    });

    const createBtn = screen.getByRole('button', { name: /Inisiasi Sesi Audit Baru/i });
    await act(async () => {
      fireEvent.click(createBtn);
    });

    expect(await screen.findByText(/Inisiasi Sesi Audit Baru \(Snapshotting\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contoh: AUD-/i)).toBeInTheDocument();
  });
});
