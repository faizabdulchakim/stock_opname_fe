import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from '../App';

describe('App Root Render Test', () => {
  it('renders login page when user is not authenticated', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Stock Opname System/i)).toBeInTheDocument();
    expect(screen.getByText(/Masuk ke Akun/i)).toBeInTheDocument();
  });
});
