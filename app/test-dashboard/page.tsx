'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function TestDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Dashboard</h1>
      
      {user ? (
        <div className="space-y-4">
          <p><strong>Usuario autenticado:</strong> {user.email}</p>
          <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Rol:</strong> {user.role}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Activo:</strong> {user.is_active ? 'Sí' : 'No'}</p>
          <p><strong>Email verificado:</strong> {user.email_verified ? 'Sí' : 'No'}</p>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Prueba de navegación:</h2>
            <a href="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded">
              Ir al Dashboard Principal
            </a>
          </div>
        </div>
      ) : (
        <p>No hay usuario autenticado</p>
      )}
    </div>
  );
}