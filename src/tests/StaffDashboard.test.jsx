import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { StaffDashboard } from '../components/StaffDashboard';
import { auditApi } from '../api/audit.api';

// Mock auditApi
jest.mock('../api/audit.api');

const mockSessions = [
  {
    id: 10,
    sessionCode: 'AUD-STAFF-001',
    status: 'INITIATED',
    notes: 'Penugasan hitung fisik gudang A',
    createdAt: '2026-09-22T10:00:00.000Z',
    createdBy: { id: 1, name: 'Budi Manager' },
    items: [
      {
        id: 1,
        productId: 1,
        snapshotStock: 100,
        countedStock: null,
        variance: null,
        product: { id: 1, sku: 'PRD-001', name: 'Indomie Goreng', unit: 'DUS' },
      },
      {
        id: 2,
        productId: 2,
        snapshotStock: 50,
        countedStock: null,
        variance: null,
        product: { id: 2, sku: 'PRD-002', name: 'Kopi Kapal Api', unit: 'PCS' },
      },
    ],
  },
  {
    id: 11,
    sessionCode: 'AUD-STAFF-002',
    status: 'COUNT_SUBMITTED',
    notes: 'Sudah dihitung kemarin',
    createdAt: '2026-09-21T09:00:00.000Z',
    createdBy: { id: 1, name: 'Budi Manager' },
    items: [
      {
        id: 3,
        productId: 1,
        snapshotStock: 80,
        countedStock: 80,
        variance: 0,
        product: { id: 1, sku: 'PRD-001', name: 'Indomie Goreng', unit: 'DUS' },
      },
    ],
  },
];

describe('StaffDashboard Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auditApi.getAllSessions.mockResolvedValue({ success: true, data: mockSessions });
    auditApi.getSessionById.mockImplementation((id) => {
      const found = mockSessions.find((s) => s.id === id);
      return Promise.resolve({ success: true, data: found });
    });
    auditApi.submitCounts.mockResolvedValue({
      success: true,
      data: { ...mockSessions[0], status: 'COUNT_SUBMITTED' },
    });
  });

  it('renders staff dashboard header, counters, and pending task list', async () => {
    await act(async () => {
      render(<StaffDashboard />);
    });

    expect(screen.getByText(/Warehouse Staff Console/i)).toBeInTheDocument();
    expect(screen.getByText(/Tugas Stock Opname & Perhitungan Fisik/i)).toBeInTheDocument();
    expect(screen.getByText(/Tugas Perlu Dihitung Segera/i)).toBeInTheDocument();

    // Verify the pending session is in the list
    expect(await screen.findByText('AUD-STAFF-001')).toBeInTheDocument();
    expect(screen.getByText('Menunggu Input Fisik')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Input Hitungan Fisik/i })).toBeInTheDocument();
  });

  it('can switch between pending tasks and history tabs', async () => {
    await act(async () => {
      render(<StaffDashboard />);
    });

    const historyTab = screen.getByRole('button', { name: /Riwayat Sesi Dikerjakan/i });
    await act(async () => {
      fireEvent.click(historyTab);
    });

    expect(await screen.findByText('AUD-STAFF-002')).toBeInTheDocument();
    expect(screen.getByText('Sudah Disubmit (Review Manager)')).toBeInTheDocument();
  });

  it('opens SubmitCountModal and submits physical counts successfully', async () => {
    await act(async () => {
      render(<StaffDashboard />);
    });

    const inputCountBtn = screen.getByRole('button', { name: /Input Hitungan Fisik/i });
    await act(async () => {
      fireEvent.click(inputCountBtn);
    });

    // Modal should appear
    expect(await screen.findByText(/Input Hasil Hitungan Fisik \(AUD-STAFF-001\)/i)).toBeInTheDocument();
    expect(screen.getByText('Indomie Goreng')).toBeInTheDocument();
    expect(screen.getByText('Kopi Kapal Api')).toBeInTheDocument();

    // Find input fields
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBe(2);

    // Enter physical counts
    fireEvent.change(inputs[0], { target: { value: '98' } });
    fireEvent.change(inputs[1], { target: { value: '52' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Kirim Hasil Hitungan Fisik/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(auditApi.submitCounts).toHaveBeenCalledWith(10, [
      { productId: 1, countedStock: 98, notes: undefined },
      { productId: 2, countedStock: 52, notes: undefined },
    ]);
  });
});
