'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  DollarSign,
  Plus,
  Eye,
  Edit
} from 'lucide-react';

const ecommerceStats = [
  {
    title: 'Productos Activos',
    value: '8',
    description: '+2 este mes',
    icon: Package,
    color: 'text-blue-600'
  },
  {
    title: 'Ventas Totales',
    value: '$12,450',
    description: '+18% vs mes anterior',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Pedidos',
    value: '24',
    description: '6 pendientes',
    icon: ShoppingCart,
    color: 'text-purple-600'
  },
  {
    title: 'Tasa Conversión',
    value: '3.2%',
    description: '+0.5% este mes',
    icon: TrendingUp,
    color: 'text-orange-600'
  }
];

const products = [
  {
    id: 1,
    name: 'Consulta Legal Express',
    description: 'Consulta rápida de 30 minutos por videollamada',
    price: 150,
    category: 'Consultoría',
    sales: 15,
    status: 'active',
    image: 'https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 2,
    name: 'Revisión de Contratos',
    description: 'Análisis detallado de contratos comerciales',
    price: 300,
    category: 'Documentos',
    sales: 8,
    status: 'active',
    image: 'https://images.pexels.com/photos/5668800/pexels-photo-5668800.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 3,
    name: 'Paquete Startup Legal',
    description: 'Kit completo para nuevas empresas',
    price: 1200,
    category: 'Paquetes',
    sales: 3,
    status: 'active',
    image: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=200'
  }
];

export default function EcommercePage() {
  const [productList] = useState(products);

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
            <h1 className="text-3xl font-bold text-gray-900">E-commerce</h1>
            <p className="text-gray-600">
              Gestiona tus productos y servicios en la tienda online.
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nuevo Producto</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ecommerceStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Products Section */}
        <Card>
          <CardHeader>
            <CardTitle>Productos y Servicios</CardTitle>
            <CardDescription>
              Lista de todos tus productos disponibles en la tienda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productList.map((product) => (
                <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      {getStatusBadge(product.status)}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Categoría: {product.category}</span>
                      <span>•</span>
                      <span>{product.sales} ventas</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${product.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${product.price * product.sales} total
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Integration Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Integración de Pagos</CardTitle>
            <CardDescription className="text-blue-700">
              Para procesar pagos de forma segura, necesitas configurar Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 mb-2">
                  Configura tu cuenta de Stripe para comenzar a recibir pagos por tus servicios legales.
                </p>
                <p className="text-sm text-blue-600">
                  Stripe es la plataforma de pagos más confiable para profesionales.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Configurar Stripe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}