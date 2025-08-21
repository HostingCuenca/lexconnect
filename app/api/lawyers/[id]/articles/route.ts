import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostsByAuthor } from '@/lib/blog';
import { query } from '@/lib/database';

// GET /api/lawyers/[id]/articles - Get articles by lawyer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lawyerId = params.id;
    
    // First, get the user_id from the lawyer_profile
    const lawyerResult = await query(`
      SELECT user_id 
      FROM lawyer_profiles 
      WHERE id = $1
    `, [lawyerId]);
    
    if (lawyerResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Abogado no encontrado' 
        },
        { status: 404 }
      );
    }
    
    const userId = lawyerResult.rows[0].user_id;
    
    // Get published articles by this lawyer
    const articles = await getBlogPostsByAuthor(userId);
    
    // Filter only published articles for public access
    const publishedArticles = articles.filter(article => article.status === 'publicado');
    
    return NextResponse.json({
      success: true,
      data: publishedArticles,
      total: publishedArticles.length
    });
  } catch (error: any) {
    console.error('Error fetching lawyer articles:', error);
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