import { NextRequest, NextResponse } from 'next/server';
import { getAllLegalSpecialties } from '@/lib/lawyers';

export async function GET(request: NextRequest) {
  try {
    const specialties = await getAllLegalSpecialties();

    return NextResponse.json({
      success: true,
      data: specialties,
      total: specialties.length
    });
  } catch (error: any) {
    console.error('Error fetching legal specialties:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        message: error.message 
      },
      { status: 500 }
    );
  }
}