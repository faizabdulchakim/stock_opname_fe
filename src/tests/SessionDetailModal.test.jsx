import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { SessionDetailModal } from '../components/SessionDetailModal';
import { auditApi } from '../api/audit.api';

// Mock auditApi
jest.mock('../api/audit.api');

const mockSubmittedSession = {
  id: 101,
  sessionCode: 'AUD-20260922-DETAIL',
  status: 'COUNT_SUBMITTED',
  notes: 'Audit bulanan area A',
  createdAt: '2026-09-22T10:00:00.000Z',
  createdBy: { id: 1, name: 'Budi Manager' },
  items: [
    {
      id: 1,
      productId: 1,
      snapshotStock: 100,
      countedStock: 95,
      variance: -5,
      notes: '5 pcs rusak bocor',
      product: { sku: 'PRD-001', name: 'Indomie Goreng', unit: 'DUS' },
    },
    {
      id: 2,
      productId: 2,
      snapshotStock: 50,
      countedStock: 52,
      variance: 2,
      notes: 'Ditemukan di lorong 3',
      product: { sku: 'PRD-002', name: 'Kopi Kapal Api', unit: 'PCS' },
    },
  ],
};

describe('SessionDetailModal Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auditApi.getSessionById.mockResolvedValue({ success: true, data: mockSubmittedSession });
    auditApi.approveSession.mockResolvedValue({ success: true, message: 'Disetujui' });
    auditApi.rejectSession.mockResolvedValue({ success: true, message: 'Ditolak' });
  });

  it('renders session summary cards and variance details correctly', async () => {
    await act(async () => {
      render(<SessionDetailModal sessionId={101} isOpen={true} onClose={jest.fn()} isManager={true} />);
    });

    // Session code and creator
    expect(await screen.findByText('AUD-20260922-DETAIL')).toBeInTheDocument();
    expect(screen.getByText(/Budi Manager/i)).toBeInTheDocument();

    // Summary cards
    expect(screen.getByText('2 Item')).toBeInTheDocument();
    expect(screen.getByText('150 Qty')).toBeInTheDocument();
    expect(screen.getByText('147 Qty')).toBeInTheDocument();

    // Items table content
    expect(screen.getByText('Indomie Goreng')).toBeInTheDocument();
    expect(screen.getByText('5 pcs rusak bocor')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows action buttons for Manager and hides them for Staff', async () => {
    // Render as Staff
    const { rerender } = render(
      <SessionDetailModal sessionId={101} isOpen={true} onClose={jest.fn()} isManager={false} />
    );

    expect(await screen.findByText('AUD-20260922-DETAIL')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Approve & Rekonsiliasi Stok/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tolak \(Reject\)/i })).not.toBeInTheDocument();

    // Rerender as Manager
    rerender(<SessionDetailModal sessionId={101} isOpen={true} onClose={jest.fn()} isManager={true} />);

    expect(await screen.findByRole('button', { name: /Approve & Rekonsiliasi Stok/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tolak \(Reject\)/i })).toBeInTheDocument();
  });
});
