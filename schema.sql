-- LexConnect - Plataforma de Servicios Legales
-- Base de datos PostgreSQL completa para conectar clientes con abogados

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tipos de datos personalizados
CREATE TYPE user_role AS ENUM ('cliente', 'abogado', 'administrador');
CREATE TYPE service_status AS ENUM ('activo', 'inactivo', 'suspendido');
CREATE TYPE consultation_status AS ENUM ('pendiente', 'aceptada', 'en_proceso', 'completada', 'cancelada');
CREATE TYPE payment_status AS ENUM ('pendiente', 'procesando', 'completado', 'fallido', 'reembolsado');
CREATE TYPE appointment_status AS ENUM ('programada', 'confirmada', 'en_proceso', 'completada', 'cancelada', 'no_asistio');
CREATE TYPE blog_status AS ENUM ('borrador', 'publicado', 'archivado');
CREATE TYPE notification_type AS ENUM ('system', 'appointment', 'payment', 'message', 'review');

-- Tabla de usuarios principal
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'cliente',
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Perfiles de abogados
CREATE TABLE lawyer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    bar_association VARCHAR(100),
    years_experience INTEGER,
    education TEXT,
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    consultation_rate DECIMAL(10,2),
    is_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_consultations INTEGER DEFAULT 0,
    availability_schedule JSONB, -- Horarios disponibles
    office_address TEXT,
    languages VARCHAR(200), -- Idiomas que habla
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Especialidades legales
CREATE TABLE legal_specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Para mostrar iconos en el frontend
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relación muchos a muchos entre abogados y especialidades
CREATE TABLE lawyer_specialties (
    lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    specialty_id UUID REFERENCES legal_specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (lawyer_id, specialty_id)
);

-- Servicios que ofrecen los abogados
CREATE TABLE lawyer_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER, -- Duración estimada en minutos
    service_type VARCHAR(50), -- 'consultation', 'document_review', 'representation', etc.
    status service_status DEFAULT 'activo',
    requirements TEXT, -- Que necesita el cliente para este servicio
    deliverables TEXT, -- Que recibe el cliente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Consultas/solicitudes de servicios
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES lawyer_services(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    status consultation_status DEFAULT 'pendiente',
    estimated_price DECIMAL(10,2),
    final_price DECIMAL(10,2),
    deadline DATE,
    client_notes TEXT,
    lawyer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Citas entre clientes y abogados
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_type VARCHAR(20) DEFAULT 'video_call', -- video_call, phone, in_person
    meeting_url TEXT, -- Para videollamadas
    office_address TEXT, -- Para citas presenciales
    status appointment_status DEFAULT 'programada',
    notes TEXT,
    client_rating INTEGER CHECK (client_rating BETWEEN 1 AND 5),
    client_review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documentos asociados a consultas
CREATE TABLE consultation_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    description TEXT,
    is_confidential BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sistema de pagos
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    lawyer_earnings DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    payment_method VARCHAR(50), -- stripe, paypal, transfer, etc.
    payment_intent_id VARCHAR(255), -- ID de Stripe/PayPal
    status payment_status DEFAULT 'pendiente',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog/artículos
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    category VARCHAR(100),
    tags TEXT[], -- Array de tags
    status blog_status DEFAULT 'borrador',
    views INTEGER DEFAULT 0,
    reading_time INTEGER, -- Tiempo estimado de lectura en minutos
    meta_title VARCHAR(300),
    meta_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sistema de mensajería
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, file, system
    file_path TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reseñas y calificaciones
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    comment TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    lawyer_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    related_id UUID, -- ID relacionado (consultation, appointment, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Configuración del sistema
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Actividad del sistema (logs)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_lawyer_profiles_user_id ON lawyer_profiles(user_id);
CREATE INDEX idx_lawyer_profiles_rating ON lawyer_profiles(rating DESC);
CREATE INDEX idx_lawyer_services_lawyer_id ON lawyer_services(lawyer_id);
CREATE INDEX idx_lawyer_services_status ON lawyer_services(status);
CREATE INDEX idx_consultations_client_id ON consultations(client_id);
CREATE INDEX idx_consultations_lawyer_id ON consultations(lawyer_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_lawyer_id ON appointments(lawyer_id);
CREATE INDEX idx_appointments_scheduled_date ON appointments(scheduled_date);
CREATE INDEX idx_payments_consultation_id ON payments(consultation_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_messages_consultation_id ON messages(consultation_id);
CREATE INDEX idx_reviews_lawyer_id ON reviews(lawyer_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Función para actualizar timestamps automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lawyer_profiles_updated_at BEFORE UPDATE ON lawyer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lawyer_services_updated_at BEFORE UPDATE ON lawyer_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar rating de abogados
CREATE OR REPLACE FUNCTION update_lawyer_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE lawyer_profiles 
    SET rating = (
        SELECT COALESCE(AVG(rating::DECIMAL), 0)
        FROM reviews 
        WHERE lawyer_id = NEW.lawyer_id AND is_public = true
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM reviews 
        WHERE lawyer_id = NEW.lawyer_id AND is_public = true
    )
    WHERE id = NEW.lawyer_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar rating cuando se agrega/modifica una reseña
CREATE TRIGGER update_lawyer_rating_trigger 
    AFTER INSERT OR UPDATE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_lawyer_rating();

-- Datos iniciales para especialidades legales
INSERT INTO legal_specialties (name, description, icon) VALUES
('Derecho Civil', 'Contratos, sucesiones, responsabilidad civil', 'Scale'),
('Derecho Penal', 'Defensa penal, delitos, proceso penal', 'Shield'),
('Derecho Laboral', 'Relaciones laborales, despidos, demandas', 'Briefcase'),
('Derecho Mercantil', 'Sociedades, contratos comerciales, concursos', 'Building'),
('Derecho Familiar', 'Divorcios, custodia, pensiones alimenticias', 'Heart'),
('Derecho Fiscal', 'Impuestos, procedimientos fiscales, auditorías', 'Calculator'),
('Derecho Inmobiliario', 'Compraventa, arrendamiento, desarrollo', 'Home'),
('Derecho Administrativo', 'Trámites gubernamentales, recursos', 'FileText'),
('Propiedad Intelectual', 'Marcas, patentes, derechos de autor', 'Lightbulb'),
('Derecho Migratorio', 'Visas, residencias, ciudadanía', 'Globe');

-- Configuraciones del sistema iniciales
INSERT INTO system_settings (key, value, description) VALUES
('platform_fee_percentage', '10', 'Porcentaje de comisión de la plataforma'),
('min_consultation_price', '500', 'Precio mínimo de consulta en MXN'),
('max_consultation_price', '10000', 'Precio máximo de consulta en MXN'),
('appointment_duration_options', '[30, 60, 90, 120]', 'Opciones de duración de citas en minutos'),
('supported_languages', '["Español", "Inglés", "Francés"]', 'Idiomas soportados'),
('email_notifications', 'true', 'Notificaciones por email habilitadas'),
('maintenance_mode', 'false', 'Modo de mantenimiento');

-- Usuario administrador inicial (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) VALUES
('admin@lexconnect.mx', crypt('admin123', gen_salt('bf')), 'Administrador', 'Sistema', 'administrador', true);

COMMENT ON DATABASE postgres IS 'LexConnect - Base de datos para plataforma de servicios legales que conecta clientes con abogados';