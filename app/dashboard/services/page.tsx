'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Trash2, DollarSign } from 'lucide-react';

const mockServices = [
  {
    id: 1,
    title: 'Consulta Legal - Derecho Civil',
    description: 'Asesoría especializada en casos de derecho civil, contratos y disputas.',
    price: 200,
    category: 'Derecho Civil',
    status: 'active',
    clients: 5,
    rating: 4.8
  },
  {
    id: 2,
    title: 'Constitución de Empresas',
    description: 'Servicio completo para la creación y registro de sociedades.',
    price: 500,
    category: 'Derecho Comercial',
    status: 'active',
    clients: 12,
    rating: 4.9
  },
  {
    id: 3,
    title: 'Defensa Penal',
    description: 'Representación legal en casos penales con amplia experiencia.',
    price: 800,
    category: 'Derecho Penal',
    status: 'draft',
    clients: 0,
    rating: 0
  }
];

export default function ServicesPage() {
  const [services] = useState(mockServices);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Borrador</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactivo</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Servicios</h1>
            <p className="text-gray-600">
              Gestiona tus servicios legales y monitorea su rendimiento.
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nuevo Servicio</span>
          </Button>
        </div>

        <div className="grid gap-6">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Categoría: {service.category}</span>
                      <span>•</span>
                      <span>{service.clients} clientes</span>
                      {service.rating > 0 && (
                        <>
                          <span>•</span>
                          <span>⭐ {service.rating}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-2xl font-bold text-green-600">
                    <DollarSign className="h-6 w-6" />
                    <span>${service.price}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="h-12 w-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No tienes servicios aún</h3>
                  <p className="text-gray-500">
                    Comienza creando tu primer servicio legal para ofrecer a tus clientes.
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Servicio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}