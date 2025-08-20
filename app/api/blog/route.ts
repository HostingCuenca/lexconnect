import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogPosts, getPublishedBlogPosts, createBlogPost, searchBlogPosts } from '@/lib/blog';
import { getAuthenticatedUser } from '@/lib/auth';

// Helper to verify authentication (simplified - any authenticated user)
function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Token de autorización requerido');
  }
  return user;
}

// Helper to verify admin authorization (for admin-only operations)
function verifyAdminAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Token de autorización requerido');
  }
  if (user.role !== 'administrador') {
    throw new Error('Se requieren permisos de administrador');
  }
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let posts;
    
    if (search) {
      posts = await searchBlogPosts(search, category || undefined);
    } else if (status === 'all') {
      posts = await getAllBlogPosts();
    } else {
      posts = await getPublishedBlogPosts();
    }

    return NextResponse.json({
      success: true,
      data: posts,
      total: posts.length
    });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
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

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (any authenticated user can create)
    const user = verifyAuth(request);
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'excerpt', 'content', 'featured_image', 'category', 'tags'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { 
            success: false,
            error: `Campo requerido: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Validate tags is array
    if (!Array.isArray(data.tags)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Tags debe ser un array' 
        },
        { status: 400 }
      );
    }
    
    const newPost = await createBlogPost(data, user.userId);
    
    return NextResponse.json({
      success: true,
      data: newPost,
      message: 'Artículo creado exitosamente'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al crear artículo',
        message: error.message 
      },
      { status: 500 }
    );
  }
}