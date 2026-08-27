import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { SideBar } from './SideBar';

export function AdminLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <SideBar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}