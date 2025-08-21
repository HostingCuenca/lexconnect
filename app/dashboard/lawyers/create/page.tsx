'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft,
  Save,
  AlertCircle,
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';

interface LegalSpecialty {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface FormData {
  // User data
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  
  // Lawyer profile data
  license_number: string;
  bar_association: string;
  years_experience: number;
  education: string;
  bio: string;
  hourly_rate: number;
  consultation_rate: number;
  office_address: string;
  languages: string;
  is_verified: boolean;
  
  // Specialties
  specialties: string[];
  
  // Schedule
  availability_schedule: Record<string, Array<{start: string; end: string}>>;
}

const initialFormData: FormData = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  license_number: '',
  bar_association: '',
  years_experience: 0,
  education: '',
  bio: '',
  hourly_rate: 0,
  consultation_rate: 0,
  office_address: '',
  languages: 'Español',
  is_verified: false,
  specialties: [],
  availability_schedule: {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  }
};

const daysOfWeek = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

export default function CreateLawyerPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [specialties, setSpecialties] = useState<LegalSpecialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    if (!loading && user && user.role !== 'administrador') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/legal-specialties/');
      if (response.ok) {
        const data = await response.json();
        setSpecialties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSpecialtyToggle = (specialtyId: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyId)
        ? prev.specialties.filter(id => id !== specialtyId)
        : [...prev.specialties, specialtyId]
    }));
  };

  const handleScheduleChange = (day: string, timeSlots: Array<{start: string; end: string}>) => {
    setFormData(prev => ({
      ...prev,
      availability_schedule: {
        ...prev.availability_schedule,
        [day]: timeSlots
      }
    }));
  };

  const addTimeSlot = (day: string) => {
    const currentSlots = formData.availability_schedule[day] || [];
    handleScheduleChange(day, [...currentSlots, { start: '09:00', end: '17:00' }]);
  };

  const removeTimeSlot = (day: string, index: number) => {
    const currentSlots = formData.availability_schedule[day] || [];
    handleScheduleChange(day, currentSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const currentSlots = formData.availability_schedule[day] || [];
    const updatedSlots = currentSlots.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    handleScheduleChange(day, updatedSlots);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.email) newErrors.email = 'Email es requerido';
    if (!formData.password) newErrors.password = 'Contraseña es requerida';
    if (!formData.first_name) newErrors.first_name = 'Nombre es requerido';
    if (!formData.last_name) newErrors.last_name = 'Apellido es requerido';
    if (!formData.license_number) newErrors.license_number = 'Cédula profesional es requerida';
    if (!formData.bar_association) newErrors.bar_association = 'Colegio de abogados es requerido';
    if (!formData.education) newErrors.education = 'Educación es requerida';
    if (!formData.bio) newErrors.bio = 'Biografía es requerida';
    if (!formData.office_address) newErrors.office_address = 'Dirección es requerida';

    // Numeric validations
    if (formData.years_experience < 0) newErrors.years_experience = 'Experiencia debe ser positiva';
    if (formData.hourly_rate < 0) newErrors.hourly_rate = 'Tarifa por hora debe ser positiva';
    if (formData.consultation_rate < 0) newErrors.consultation_rate = 'Tarifa de consulta debe ser positiva';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Contraseña debe tener al menos 6 caracteres';
    }

    // Specialties validation
    if (formData.specialties.length === 0) {
      newErrors.specialties = 'Debe seleccionar al menos una especialidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/lawyers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard/lawyers');
      } else {
        setErrors({ general: data.message || 'Error al crear abogado' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión. Intente nuevamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingSpecialties) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando formulario...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'administrador') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard/lawyers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Abogado</h1>
              <p className="text-gray-600">Complete la información para registrar un nuevo abogado</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{errors.general}</span>
            </div>
          )}

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información Personal</span>
              </CardTitle>
              <CardDescription>
                Datos básicos del usuario y contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Ej: María"
                    className={errors.first_name ? 'border-red-500' : ''}
                  />
                  {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Ej: González"
                    className={errors.last_name ? 'border-red-500' : ''}
                  />
                  {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="abogado@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+593 99 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languages">Idiomas</Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => handleInputChange('languages', e.target.value)}
                    placeholder="Español, Inglés"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="office_address">Dirección de Oficina *</Label>
                <Input
                  id="office_address"
                  value={formData.office_address}
                  onChange={(e) => handleInputChange('office_address', e.target.value)}
                  placeholder="Av. Amazonas 1234, Quito, Ecuador"
                  className={errors.office_address ? 'border-red-500' : ''}
                />
                {errors.office_address && <p className="text-sm text-red-600">{errors.office_address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Describe la experiencia y especialización del abogado..."
                  rows={4}
                  className={errors.bio ? 'border-red-500' : ''}
                />
                {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Información Profesional</span>
              </CardTitle>
              <CardDescription>
                Credenciales y experiencia profesional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_number">Cédula Profesional *</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    placeholder="Ej: LIC-001-2024"
                    className={errors.license_number ? 'border-red-500' : ''}
                  />
                  {errors.license_number && <p className="text-sm text-red-600">{errors.license_number}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bar_association">Colegio de Abogados *</Label>
                  <Input
                    id="bar_association"
                    value={formData.bar_association}
                    onChange={(e) => handleInputChange('bar_association', e.target.value)}
                    placeholder="Ej: Foro de Abogados de Pichincha"
                    className={errors.bar_association ? 'border-red-500' : ''}
                  />
                  {errors.bar_association && <p className="text-sm text-red-600">{errors.bar_association}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years_experience">Años de Experiencia</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    value={formData.years_experience || ''}
                    onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || 0)}
                    placeholder="15"
                    className={errors.years_experience ? 'border-red-500' : ''}
                  />
                  {errors.years_experience && <p className="text-sm text-red-600">{errors.years_experience}</p>}
                </div>

                <div className="space-y-2 flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="is_verified"
                    checked={formData.is_verified}
                    onCheckedChange={(checked) => handleInputChange('is_verified', checked)}
                  />
                  <Label htmlFor="is_verified">Perfil Verificado</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Educación *</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Ej: Licenciatura en Derecho - Universidad Central del Ecuador, Maestría en Derecho Civil"
                  rows={3}
                  className={errors.education ? 'border-red-500' : ''}
                />
                {errors.education && <p className="text-sm text-red-600">{errors.education}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Especialidades</span>
              </CardTitle>
              <CardDescription>
                Seleccione las áreas de especialización legal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {specialties.map((specialty) => (
                  <div key={specialty.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={specialty.id}
                      checked={formData.specialties.includes(specialty.id)}
                      onCheckedChange={() => handleSpecialtyToggle(specialty.id)}
                    />
                    <Label htmlFor={specialty.id} className="text-sm">
                      {specialty.name}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.specialties && <p className="text-sm text-red-600 mt-2">{errors.specialties}</p>}
            </CardContent>
          </Card>

          {/* Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Tarifas</span>
              </CardTitle>
              <CardDescription>
                Configure las tarifas de servicios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Tarifa por Hora ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate || ''}
                    onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                    placeholder="850.00"
                    className={errors.hourly_rate ? 'border-red-500' : ''}
                  />
                  {errors.hourly_rate && <p className="text-sm text-red-600">{errors.hourly_rate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultation_rate">Tarifa de Consulta ($)</Label>
                  <Input
                    id="consultation_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.consultation_rate || ''}
                    onChange={(e) => handleInputChange('consultation_rate', parseFloat(e.target.value) || 0)}
                    placeholder="200.00"
                    className={errors.consultation_rate ? 'border-red-500' : ''}
                  />
                  {errors.consultation_rate && <p className="text-sm text-red-600">{errors.consultation_rate}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Horarios de Disponibilidad</span>
              </CardTitle>
              <CardDescription>
                Configure los horarios de atención por día
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">{day.label}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(day.key)}
                    >
                      Agregar Horario
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {(formData.availability_schedule[day.key] || []).map((slot, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(day.key, index, 'start', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-gray-500">a</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(day.key, index, 'end', e.target.value)}
                          className="w-32"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTimeSlot(day.key, index)}
                          className="text-red-600"
                        >
                          Eliminar
                        </Button>
                      </div>
                    ))}
                    
                    {(formData.availability_schedule[day.key] || []).length === 0 && (
                      <p className="text-sm text-gray-500">Sin horarios configurados</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/lawyers')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Abogado
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}