import { NextRequest, NextResponse } from 'next/server';
import { testConnection, checkTables } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando test de conexión a la base de datos...');
    
    // Test de conexión básica
    const connectionTest = await testConnection();
    
    if (!connectionTest.success) {
      console.error('❌ Error de conexión:', connectionTest.details);
      return NextResponse.json({
        success: false,
        message: 'Error de conexión a la base de datos',
        error: connectionTest.details,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Verificar tablas existentes
    const tablesCheck = await checkTables();
    
    const response = {
      success: true,
      message: 'Conexión exitosa a PostgreSQL',
      connection: {
        status: 'connected',
        database: connectionTest.details.database,
        host: connectionTest.details.host,
        port: connectionTest.details.port,
        currentTime: connectionTest.details.currentTime,
        version: connectionTest.details.version
      },
      tables: {
        count: tablesCheck.tables.length,
        list: tablesCheck.tables,
        message: tablesCheck.message
      },
      timestamp: new Date().toISOString()
    };

    console.log('📊 Respuesta completa:', {
      tablesFound: tablesCheck.tables.length,
      database: connectionTest.details.database
    });

    return NextResponse.json(response, { status: 200 });
    
  } catch (error: any) {
    console.error('💥 Error en test de base de datos:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'detailed-check') {
      // Hacer un check más detallado
      const connectionTest = await testConnection();
      
      if (!connectionTest.success) {
        return NextResponse.json({
          success: false,
          message: 'Error de conexión',
          details: connectionTest.details
        }, { status: 500 });
      }

      const tablesCheck = await checkTables();

      // Lista de tablas esperadas según nuestro schema
      const expectedTables = [
        'users',
        'lawyer_profiles', 
        'legal_specialties',
        'lawyer_specialties',
        'lawyer_services',
        'consultations',
        'appointments',
        'consultation_documents',
        'payments',
        'blog_posts',
        'messages',
        'reviews',
        'notifications',
        'system_settings',
        'activity_logs'
      ];

      const missingTables = expectedTables.filter(
        table => !tablesCheck.tables.includes(table)
      );

      const extraTables = tablesCheck.tables.filter(
        table => !expectedTables.includes(table)
      );

      return NextResponse.json({
        success: true,
        message: 'Check detallado completado',
        schema: {
          expectedTables: expectedTables.length,
          foundTables: tablesCheck.tables.length,
          missingTables,
          extraTables,
          isSchemaComplete: missingTables.length === 0
        },
        connection: connectionTest.details,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Acción no reconocida'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error en POST /api/test-db:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error en la solicitud',
      error: error.message
    }, { status: 500 });
  }
}