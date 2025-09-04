import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getBlogPostBySlug, getBlogPostById, updateBlogPost, deleteBlogPost, publishBlogPost } from '@/lib/blog';
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

// GET /api/blog/[id] - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await getBlogPostById(params.id);
    
    if (!post) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Artículo no encontrado' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
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

// PUT /api/blog/[id] - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    
    const data = await request.json();
    
    // Add the ID to the update data
    const updateData = {
      ...data,
      id: params.id
    };
    
    const updatedPost = await updateBlogPost(updateData, user.userId, user.role);
    
    if (!updatedPost) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Artículo no encontrado o no autorizado para editar' 
        },
        { status: 404 }
      );
    }

    // Revalidar páginas del blog para actualización inmediata
    revalidatePath('/blog');
    revalidatePath(`/blog/${updatedPost.slug}`);
    revalidatePath('/blog/[slug]', 'page');

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: 'Artículo actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al actualizar artículo',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[id] - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    
    const deleted = await deleteBlogPost(params.id, user.userId, user.role);
    
    if (!deleted) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Artículo no encontrado o no autorizado para eliminar' 
        },
        { status: 404 }
      );
    }

    // Revalidar páginas del blog para actualización inmediata
    revalidatePath('/blog');
    revalidatePath('/blog/[slug]', 'page');

    return NextResponse.json({
      success: true,
      message: 'Artículo eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al eliminar artículo',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// PATCH /api/blog/[id] - Publish/unpublish blog post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authorization
    verifyAdminAuth(request);
    
    const { action } = await request.json();
    
    if (action === 'publish') {
      const publishedPost = await publishBlogPost(params.id);
      
      if (!publishedPost) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Artículo no encontrado o ya está publicado' 
          },
          { status: 404 }
        );
      }

      // Revalidar páginas del blog para actualización inmediata
      revalidatePath('/blog');
      revalidatePath(`/blog/${publishedPost.slug}`);
      revalidatePath('/blog/[slug]', 'page');

      return NextResponse.json({
        success: true,
        data: publishedPost,
        message: 'Artículo publicado exitosamente'
      });
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Acción no válida' 
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating blog post status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al cambiar estado del artículo',
        message: error.message 
      },
      { status: 500 }
    );
  }
}