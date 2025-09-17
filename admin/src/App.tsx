import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatus from './components/NetworkStatus';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentList from './pages/ContentList';
import ContentEditor from './pages/ContentEditor';
import AIContentApproval from './pages/AIContentApproval';

const queryClient = new QueryClient();

// Simple UsersPage component - can be moved to separate file later
function UsersPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">User Management</h2>
      <p className="text-gray-600">User management features coming soon...</p>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/content" element={<ContentList />} />
                          <Route path="/content/:id" element={<ContentEditor />} />
                          <Route path="/ai-content" element={<AIContentApproval />} />
                          <Route path="/users" element={<UsersPage />} />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
            <NetworkStatus />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
