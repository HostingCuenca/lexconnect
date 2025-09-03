import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check database encoding
    const encodingResult = await query(`
      SELECT 
        pg_encoding_to_char(encoding) as database_encoding,
        datname as database_name
      FROM pg_database 
      WHERE datname = current_database();
    `);

    // Check client encoding
    const clientEncodingResult = await query('SHOW client_encoding;');
    
    // Check server encoding
    const serverEncodingResult = await query('SHOW server_encoding;');
    
    // Test UTF-8 characters
    const testResult = await query(`
      SELECT 
        'áéíóúñü' as test_spanish,
        'evaluación' as test_word
    `);

    return NextResponse.json({
      success: true,
      data: {
        database: encodingResult.rows[0],
        client_encoding: clientEncodingResult.rows[0],
        server_encoding: serverEncodingResult.rows[0],
        test_characters: testResult.rows[0]
      }
    });

  } catch (error: any) {
    console.error('Error checking encoding:', error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}