'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Users, 
  DollarSign, 
  Settings,
  LogOut,
  User,
  ShoppingCart,
  BookOpen,
  Briefcase,
  Shield
} from 'lucide-react';

const getNavigationItems = (userRole: string) => {
  const baseItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/services', label: 'Mis Servicios', icon: FileText },
    { href: '/dashboard/payments', label: 'Pagos', icon: DollarSign },
  ];

  if (userRole === 'administrador') {
    return [
      ...baseItems,
      { href: '/dashboard/lawyers', label: 'Administrar Abogados', icon: Briefcase },
      { href: '/dashboard/users', label: 'Usuarios', icon: Users },
      { href: '/dashboard/consultations', label: 'Todas las Consultas', icon: Shield },
      { href: '/dashboard/blog', label: 'Blog', icon: BookOpen },
      { href: '/dashboard/ecommerce', label: 'E-commerce', icon: ShoppingCart },
      { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
    ];
  }

  if (userRole === 'abogado') {
    return [
      ...baseItems,
      { href: '/dashboard/clients', label: 'Clientes', icon: Users },
      { href: '/dashboard/consultations', label: 'Mis Consultas', icon: Shield },
      { href: '/dashboard/blog', label: 'Mis Artículos', icon: BookOpen },
      { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
    ];
  }

  // Cliente
  return [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/consultations', label: 'Mis Consultas', icon: FileText },
    { href: '/dashboard/payments', label: 'Pagos', icon: DollarSign },
    { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
  ];
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const navigationItems = getNavigationItems(user.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`}>
          <div className="absolute inset-0" onClick={() => setSidebarOpen(false)}></div>
        </div>
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link href="/" className="flex items-center">
                <span className="font-display text-2xl text-primary font-bold tracking-tight hover:text-secondary transition-colors">
                  LexConnect
                </span>
              </Link>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <IconComponent className="mr-4 h-6 w-6" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">{user.first_name} {user.last_name}</p>
                  <p className="text-sm font-medium text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link href="/" className="flex items-center">
                <span className="font-display text-2xl text-primary font-bold tracking-tight hover:text-secondary transition-colors">
                  LexConnect
                </span>
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <IconComponent className="mr-3 h-6 w-6" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user.first_name} {user.last_name}</p>
                <p className="text-xs font-medium text-gray-500 capitalize">{user.role}</p>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}