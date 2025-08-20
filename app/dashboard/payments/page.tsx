'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Settings,
  Plus,
  Download,
  Eye
} from 'lucide-react';

const paymentStats = [
  {
    title: 'Ingresos del Mes',
    value: '$12,450',
    description: '+18% vs mes anterior',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Transacciones',
    value: '47',
    description: '12 pendientes',
    icon: CreditCard,
    color: 'text-blue-600'
  },
  {
    title: 'Tasa de Éxito',
    value: '98.2%',
    description: '+2.1% este mes',
    icon: TrendingUp,
    color: 'text-purple-600'
  },
  {
    title: 'Comisiones',
    value: '$1,245',
    description: '10% de ingresos',
    icon: AlertCircle,
    color: 'text-orange-600'
  }
];

const recentTransactions = [
  {
    id: 'TXN-001',
    client: 'María García',
    service: 'Consulta Legal - Derecho Civil',
    amount: 200,
    status: 'completed',
    date: '2024-01-15',
    paymentMethod: 'Tarjeta de Crédito'
  },
  {
    id: 'TXN-002',
    client: 'Carlos López',
    service: 'Constitución de Empresa',
    amount: 500,
    status: 'pending',
    date: '2024-01-14',
    paymentMethod: 'Transferencia'
  },
  {
    id: 'TXN-003',
    client: 'Ana Martínez',
    service: 'Revisión de Contrato',
    amount: 150,
    status: 'completed',
    date: '2024-01-13',
    paymentMethod: 'PayPal'
  },
  {
    id: 'TXN-004',
    client: 'Roberto Silva',
    service: 'Defensa Penal',
    amount: 800,
    status: 'failed',
    date: '2024-01-12',
    paymentMethod: 'Tarjeta de Débito'
  }
];

export default function PaymentsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pagos y Facturación</h1>
            <p className="text-gray-600">
              Gestiona tus ingresos, transacciones y configuración de pagos.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Stripe
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentStats.map((stat, index) => {
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

        {/* Stripe Integration Status */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Integración de Stripe</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Configura Stripe para procesar pagos de forma segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h3 className="font-medium text-gray-900">Estado de Configuración</h3>
                  <p className="text-sm text-gray-600">Stripe no configurado</p>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Pendiente
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Beneficios de Stripe:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Procesamiento seguro de pagos</li>
                    <li>• Soporte para múltiples métodos de pago</li>
                    <li>• Protección contra fraudes</li>
                    <li>• Reportes detallados</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Métodos Soportados:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Tarjetas de crédito y débito</li>
                    <li>• Transferencias bancarias</li>
                    <li>• PayPal y wallets digitales</li>
                    <li>• Pagos en efectivo (OXXO)</li>
                  </ul>
                </div>
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Configurar Stripe Ahora
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Transacciones Recientes</CardTitle>
                <CardDescription>
                  Historial de pagos y transacciones de tus servicios
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{transaction.client}</h3>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{transaction.service}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>ID: {transaction.id}</span>
                      <span>{transaction.paymentMethod}</span>
                      <span>{new Date(transaction.date).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.status === 'completed' ? 'text-green-600' :
                      transaction.status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      ${transaction.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago Activos</CardTitle>
              <CardDescription>
                Configura los métodos de pago disponibles para tus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Tarjetas de Crédito/Débito</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Activo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Transferencias Bancarias</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Activo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-500">PayPal</span>
                </div>
                <Badge variant="outline">Inactivo</Badge>
              </div>
              
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Método de Pago
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Comisiones</CardTitle>
              <CardDescription>
                Tarifas y comisiones de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Comisión de Plataforma</span>
                  <span className="text-lg font-bold text-blue-600">10%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Comisión de Stripe</span>
                  <span className="text-lg font-bold text-gray-600">2.9% + $3</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-medium text-green-800">Tu Ganancia Neta</span>
                  <span className="text-lg font-bold text-green-600">~87%</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  Las comisiones se deducen automáticamente de cada transacción exitosa.
                </p>
                <Button variant="outline" className="w-full">
                  Ver Detalles de Comisiones
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}