import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LoginForm } from '../components/LoginForm';
import { AuthProvider } from '../context/AuthContext';
import { authApi } from '../api/auth.api';

// Mock auth API
jest.mock('../api/auth.api', () => ({
  authApi: {
    login: jest.fn(),
    getProfile: jest.fn().mockResolvedValue({ success: false }),
  },
}));

describe('LoginForm Component Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form elements correctly', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );
    });

    expect(screen.getByText(/Masuk ke Akun/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk Sekarang/i })).toBeInTheDocument();
    expect(screen.getByText(/Akun Demo Cepat/i)).toBeInTheDocument();
  });

  it('shows error message when form is submitted empty', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );
    });

    const submitBtn = screen.getByRole('button', { name: /Masuk Sekarang/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(await screen.findByTestId('error-alert')).toHaveTextContent(/Email dan password wajib diisi/i);
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('auto-fills credentials when Quick Demo button is clicked', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );
    });

    const managerDemoBtn = screen.getByRole('button', { name: /Manager Gudang/i });
    await act(async () => {
      fireEvent.click(managerDemoBtn);
    });

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    expect(emailInput.value).toBe('manager@warehouse.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls authApi.login and handles successful login', async () => {
    authApi.login.mockResolvedValueOnce({
      success: true,
      data: {
        user: {
          id: 'user-mgr-1',
          name: 'Budi Santoso',
          email: 'manager@warehouse.com',
          role: 'WAREHOUSE_MANAGER',
        },
        token: 'mock-jwt-token-123',
      },
    });

    await act(async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );
    });

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Masuk Sekarang/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'manager@warehouse.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('manager@warehouse.com', 'password123');
    });
  });

  it('displays API error message when login fails', async () => {
    authApi.login.mockRejectedValueOnce(new Error('Email atau password salah'));

    await act(async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );
    });

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Masuk Sekarang/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'wrong@warehouse.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitBtn);
    });

    expect(await screen.findByTestId('error-alert')).toHaveTextContent(/Email atau password salah/i);
  });
});
