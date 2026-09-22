import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Navbar } from './components/Navbar';
import { DashboardHome } from './components/DashboardHome';
import './styles/App.css';

const MainContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <span>Memuat sesi pengguna...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <DashboardHome />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
