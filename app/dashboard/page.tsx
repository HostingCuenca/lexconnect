'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LawyerVerificationStatus from '@/components/dashboard/LawyerVerificationStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Bell
} from 'lucide-react';

interface Activity {
  type: string;
  title: string;
  description: string;
  time: string;
  user_name: string;
}

interface Appointment {
  id: string;
  title: string;
  description: string;
  status: string;
  date: {
    day: string;
    month: string;
  };
  appointment_date: string;
}

interface DashboardStats {
  role: string;
  verification_status?: boolean;
  metrics: Array<{
    title: string;
    value: string | number;
    description: string;
    icon: string;
    color: string;
    trend?: string;
    format?: string;
  }>;
}

export default function DashboardPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const currentToken = token || localStorage.getItem('lexconnect_token');
        if (!currentToken) {
          console.error('No hay token de autenticación');
          return;
        }

        const response = await fetch('/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          }
        });
        const result = await response.json();
        
        if (result.success) {
          setStats(result.data);
        } else {
          console.error('Error fetching stats:', result.error);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchActivities = async () => {
      if (!user) return;
      
      try {
        const currentToken = token || localStorage.getItem('lexconnect_token');
        if (!currentToken) {
          console.error('No hay token de autenticación');
          return;
        }

        const response = await fetch('/api/dashboard/activities', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          }
        });
        const result = await response.json();
        
        if (result.success) {
          setActivities(result.data);
        } else {
          console.error('Error fetching activities:', result.error);
        }
      } catch (error) {
        console.error('Error fetching dashboard activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };

    const fetchAppointments = async () => {
      if (!user) return;
      
      try {
        const currentToken = token || localStorage.getItem('lexconnect_token');
        if (!currentToken) {
          console.error('No hay token de autenticación');
          return;
        }

        const response = await fetch('/api/dashboard/appointments', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          }
        });
        const result = await response.json();
        
        if (result.success) {
          setAppointments(result.data);
        } else {
          console.error('Error fetching appointments:', result.error);
        }
      } catch (error) {
        console.error('Error fetching dashboard appointments:', error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    if (user) {
      fetchStats();
      fetchActivities();
      fetchAppointments();
    }
  }, [user]);

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
            Bienvenido, {user.first_name} {user.last_name}
          </h1>
          <p className="text-gray-600">
            Aquí tienes un resumen de tu actividad reciente en la plataforma.
          </p>
        </div>

        {/* Lawyer Verification Status - Only for lawyers */}
        {user.role === 'abogado' && (
          <LawyerVerificationStatus />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingStats ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </CardTitle>
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </CardContent>
              </Card>
            ))
          ) : stats?.metrics ? (
            stats.metrics.map((stat, index) => {
              const getIconComponent = (iconName: string) => {
                switch (iconName) {
                  case 'FileText': return FileText;
                  case 'Users': return Users;
                  case 'DollarSign': return DollarSign;
                  case 'TrendingUp': return TrendingUp;
                  default: return FileText;
                }
              };
              
              const IconComponent = getIconComponent(stat.icon);
              const displayValue = stat.format === 'currency' 
                ? `$${Number(stat.value).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
                : stat.value.toString();
              
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{displayValue}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-4 text-center text-gray-500">
              No se pudieron cargar las estadísticas
            </div>
          )}
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
                {loadingActivities ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 animate-pulse"></div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded animate-pulse w-1/4"></div>
                      </div>
                    </div>
                  ))
                ) : activities.length > 0 ? (
                  activities.map((activity, index) => {
                    const getActivityColor = (type: string) => {
                      switch (type) {
                        case 'consultation': return 'bg-blue-600';
                        case 'payment': return 'bg-green-600';
                        case 'consultation_update': return 'bg-yellow-600';
                        case 'user': return 'bg-purple-600';
                        default: return 'bg-gray-600';
                      }
                    };

                    return (
                      <div key={index} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2`}></div>
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
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No hay actividad reciente
                  </div>
                )}
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
                {loadingAppointments ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  ))
                ) : appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {appointment.date.day}
                        </div>
                        {appointment.date.month && (
                          <div className="text-xs text-gray-500">
                            {appointment.date.month}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{appointment.title}</p>
                        <p className="text-sm text-gray-600">{appointment.description}</p>
                        <p className="text-xs text-blue-600 mt-1">{appointment.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No hay citas próximas programadas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}