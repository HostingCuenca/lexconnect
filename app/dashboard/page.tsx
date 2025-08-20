'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Bell
} from 'lucide-react';

const statsData = [
  {
    title: 'Casos Activos',
    value: '12',
    description: '+2 desde el mes pasado',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    title: 'Clientes',
    value: '8',
    description: '+1 nuevo cliente',
    icon: Users,
    color: 'text-green-600'
  },
  {
    title: 'Ingresos',
    value: '$15,420',
    description: '+12% este mes',
    icon: DollarSign,
    color: 'text-yellow-600'
  },
  {
    title: 'Crecimiento',
    value: '23%',
    description: 'Último trimestre',
    icon: TrendingUp,
    color: 'text-purple-600'
  }
];

const recentActivities = [
  {
    id: 1,
    title: 'Nueva consulta recibida',
    description: 'Caso de derecho comercial',
    time: 'Hace 2 horas',
    type: 'consultation'
  },
  {
    id: 2,
    title: 'Pago procesado',
    description: '$500 - Caso #12345',
    time: 'Hace 4 horas',
    type: 'payment'
  },
  {
    id: 3,
    title: 'Cita programada',
    description: 'Cliente: María García',
    time: 'Mañana 10:00 AM',
    type: 'appointment'
  }
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user.name}
          </h1>
          <p className="text-gray-600">
            Aquí tienes un resumen de tu actividad reciente en la plataforma.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
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

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Actividad Reciente</span>
              </CardTitle>
              <CardDescription>
                Últimas actualizaciones en tus casos y servicios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Próximas Citas</span>
              </CardTitle>
              <CardDescription>
                Tus reuniones y consultas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">15</div>
                    <div className="text-xs text-gray-500">ENE</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Consulta - Derecho Civil</p>
                    <p className="text-sm text-gray-600">10:00 AM - María González</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">16</div>
                    <div className="text-xs text-gray-500">ENE</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Audiencia - Caso #12345</p>
                    <p className="text-sm text-gray-600">2:30 PM - Tribunal Civil</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}