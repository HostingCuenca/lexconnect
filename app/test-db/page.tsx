'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Server,
  Table,
  Clock
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ConnectionResult {
  success: boolean;
  message: string;
  connection?: {
    status: string;
    database: string;
    host: string;
    port: number;
    currentTime: string;
    version: string;
  };
  tables?: {
    count: number;
    list: string[];
    message: string;
  };
  schema?: {
    expectedTables: number;
    foundTables: number;
    missingTables: string[];
    extraTables: string[];
    isSchemaComplete: boolean;
  };
  error?: any;
  timestamp: string;
}

export default function TestDbPage() {
  const [result, setResult] = useState<ConnectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState<'basic' | 'detailed'>('basic');

  const testConnection = async (type: 'basic' | 'detailed' = 'basic') => {
    setLoading(true);
    setTestType(type);
    
    try {
      let response;
      
      if (type === 'basic') {
        response = await fetch('/api/test-db');
      } else {
        response = await fetch('/api/test-db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'detailed-check' }),
        });
      }
      
      const data = await response.json();
      setResult(data);
      
    } catch (error) {
      setResult({
        success: false,
        message: 'Error de red al conectar con la API',
        error: { message: (error as Error).message },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Database className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test de Conexión a Base de Datos
            </h1>
            <p className="text-gray-600">
              Verifica la conexión a PostgreSQL y el estado del schema
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>Configuración de Conexión</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Host:</span>
                    <p className="text-gray-600">167.235.20.41</p>
                  </div>
                  <div>
                    <span className="font-medium">Puerto:</span>
                    <p className="text-gray-600">5432</p>
                  </div>
                  <div>
                    <span className="font-medium">Base de Datos:</span>
                    <p className="text-gray-600">lexconnectdb</p>
                  </div>
                  <div>
                    <span className="font-medium">Usuario:</span>
                    <p className="text-gray-600">postgres</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pruebas de Conexión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => testConnection('basic')}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    {loading && testType === 'basic' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>Test Básico</span>
                  </Button>
                  
                  <Button
                    onClick={() => testConnection('detailed')}
                    disabled={loading}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    {loading && testType === 'detailed' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Table className="h-4 w-4" />
                    )}
                    <span>Test Detallado de Schema</span>
                  </Button>
                  
                  {result && (
                    <Button
                      onClick={() => testConnection(testType)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Repetir</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {result && (
            <Card className={`border-l-4 ${result.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>Resultado de la Prueba</span>
                  <Badge variant={result.success ? 'default' : 'destructive'}>
                    {result.success ? 'Éxito' : 'Error'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Mensaje:</h3>
                  <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                </div>

                {result.connection && (
                  <div>
                    <h3 className="font-medium mb-3">Información de Conexión:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <Badge variant="outline">{result.connection.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Base de Datos:</span>
                        <span className="font-mono">{result.connection.database}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Servidor:</span>
                        <span className="font-mono">{result.connection.host}:{result.connection.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hora del Servidor:</span>
                        <span className="font-mono text-xs">
                          {new Date(result.connection.currentTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span>Versión de PostgreSQL:</span>
                        <span className="font-mono text-xs text-gray-600">
                          {result.connection.version}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {result.tables && (
                  <div>
                    <h3 className="font-medium mb-3">Tablas en la Base de Datos:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">
                        {result.tables.message}
                      </p>
                      {result.tables.list.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {result.tables.list.map((table, index) => (
                            <Badge key={index} variant="outline" className="justify-start">
                              {table}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-yellow-600 text-sm">
                          ⚠️ No se encontraron tablas. Es posible que necesites ejecutar el schema.sql
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {result.schema && (
                  <div>
                    <h3 className="font-medium mb-3">Análisis del Schema:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Tablas Esperadas:</span>
                          <p>{result.schema.expectedTables}</p>
                        </div>
                        <div>
                          <span className="font-medium">Tablas Encontradas:</span>
                          <p>{result.schema.foundTables}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Badge 
                          variant={result.schema.isSchemaComplete ? 'default' : 'destructive'}
                          className="mb-3"
                        >
                          {result.schema.isSchemaComplete ? 'Schema Completo' : 'Schema Incompleto'}
                        </Badge>
                      </div>

                      {result.schema.missingTables.length > 0 && (
                        <div>
                          <span className="font-medium text-red-600">Tablas Faltantes:</span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.schema.missingTables.map((table, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {table}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.schema.extraTables.length > 0 && (
                        <div>
                          <span className="font-medium text-blue-600">Tablas Adicionales:</span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.schema.extraTables.map((table, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {table}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.error && (
                  <div>
                    <h3 className="font-medium mb-3 text-red-600">Detalles del Error:</h3>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-700 mb-2">
                        <strong>Mensaje:</strong> {result.error.message}
                      </p>
                      {result.error.code && (
                        <p className="text-sm text-red-600">
                          <strong>Código:</strong> {result.error.code}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 flex items-center space-x-2">
                  <Clock className="h-3 w-3" />
                  <span>Ejecutado: {new Date(result.timestamp).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}