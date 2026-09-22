import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ManagerDashboard } from './ManagerDashboard';
import { StaffDashboard } from './StaffDashboard';

export const DashboardHome = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'WAREHOUSE_MANAGER';

  if (isManager) {
    return <ManagerDashboard />;
  }

  return <StaffDashboard />;
};
