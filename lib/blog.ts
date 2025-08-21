import 'server-only';
import { updateSitemap } from './sitemap';
import { query, withTransaction, PoolClient } from './database';
import { BlogPost, CreateBlogPostData, UpdateBlogPostData, BLOG_CATEGORIES } from './blog-types';

// Re-export types and constants for server components
export type { BlogPost, CreateBlogPostData, UpdateBlogPostData };
export { BLOG_CATEGORIES };

// Generate URL-friendly slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Calculate estimated reading time in minutes
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Validate image URL
export function validateImageUrl(url: string): boolean {
  try {
    const validUrl = new URL(url);
    const allowedHosts = ['images.pexels.com', 'unsplash.com', 'pixabay.com', 'i.imgur.com', 'via.placeholder.com'];
    return allowedHosts.some(host => validUrl.hostname.includes(host)) || 
           validUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

// Create new blog post
export async function createBlogPost(data: CreateBlogPostData, authorId: string): Promise<BlogPost> {
  return withTransaction(async (client: PoolClient) => {
    // Validate image URL
    if (!validateImageUrl(data.featured_image)) {
      throw new Error('URL de imagen no válida. Use URLs de https://images.pexels.com, Unsplash, o similares.');
    }

    const slug = generateSlug(data.title);
    const readingTime = calculateReadTime(data.content);
    const status = data.status || 'borrador';
    const publishedAt = status === 'publicado' ? new Date().toISOString() : null;
    
    const result = await client.query(`
      INSERT INTO blog_posts (
        author_id, title, slug, excerpt, content, featured_image, 
        category, tags, status, views, reading_time, meta_title, 
        meta_description, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      authorId,
      data.title,
      slug,
      data.excerpt,
      data.content,
      data.featured_image,
      data.category,
      data.tags,
      status,
      0, // initial views
      readingTime,
      data.meta_title || data.title,
      data.meta_description || data.excerpt,
      publishedAt
    ]);

    const newPost = result.rows[0];

    // Update sitemap when post is published
    if (status === 'publicado') {
      await updateSitemap({
        id: newPost.id,
        slug: newPost.slug,
        title: newPost.title,
        date: newPost.published_at,
        category: newPost.category
      });
    }

    return newPost;
  });
}

// Update existing blog post
export async function updateBlogPost(data: UpdateBlogPostData, authorId: string, userRole?: string): Promise<BlogPost | null> {
  return withTransaction(async (client: PoolClient) => {
    try {
      
      // Validate image URL if provided
      if (data.featured_image && !validateImageUrl(data.featured_image)) {
        throw new Error('URL de imagen no válida. Use URLs de https://images.pexels.com, Unsplash, o similares.');
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.title) {
        updateFields.push(`title = $${paramIndex++}, slug = $${paramIndex++}`);
        values.push(data.title, generateSlug(data.title));
      }
      if (data.excerpt) {
        updateFields.push(`excerpt = $${paramIndex++}`);
        values.push(data.excerpt);
      }
      if (data.content) {
        updateFields.push(`content = $${paramIndex++}, reading_time = $${paramIndex++}`);
        values.push(data.content, calculateReadTime(data.content));
      }
      if (data.featured_image) {
        updateFields.push(`featured_image = $${paramIndex++}`);
        values.push(data.featured_image);
      }
      if (data.category) {
        updateFields.push(`category = $${paramIndex++}`);
        values.push(data.category);
      }
      if (data.tags) {
        updateFields.push(`tags = $${paramIndex++}`);
        values.push(data.tags);
      }
      if (data.meta_title) {
        updateFields.push(`meta_title = $${paramIndex++}`);
        values.push(data.meta_title);
      }
      if (data.meta_description) {
        updateFields.push(`meta_description = $${paramIndex++}`);
        values.push(data.meta_description);
      }
      if (data.status) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(data.status);
        if (data.status === 'publicado') {
          updateFields.push(`published_at = $${paramIndex++}`);
          values.push(new Date().toISOString());
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(data.id);
      
      let query = `
        UPDATE blog_posts 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex++}`;
      
      // Solo verificar autor si no es administrador
      if (userRole !== 'administrador') {
        query += ` AND author_id = $${paramIndex++}`;
        values.push(authorId);
      }
      
      query += ` RETURNING *`;
      
      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      const updatedPost = result.rows[0];

      // Update sitemap when post is published
      if (data.status === 'publicado') {
        await updateSitemap({
          id: updatedPost.id,
          slug: updatedPost.slug,
          title: updatedPost.title,
          date: updatedPost.published_at,
          category: updatedPost.category
        });
      }

      return updatedPost;
    } catch (error) {
      console.error('Error en updateBlogPost:', error);
      throw error;
    }
  });
}

// Publish blog post
export async function publishBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const result = await query(`
      UPDATE blog_posts 
      SET status = 'publicado', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'borrador'
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const publishedPost = result.rows[0];

    // Update sitemap when post is published
    await updateSitemap({
      id: publishedPost.id,
      slug: publishedPost.slug,
      title: publishedPost.title,
      date: publishedPost.published_at,
      category: publishedPost.category
    });

    return publishedPost;
  } catch (error) {
    console.error('Error publishing blog post:', error);
    throw error;
  }
}

// Get all blog posts with author info
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const result = await query(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      ORDER BY bp.created_at DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching all blog posts:', error);
    throw error;
  }
}

// Get published blog posts with author info
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const result = await query(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.email as author_email,
        CASE 
          WHEN bp.reading_time > 0 THEN bp.reading_time || ' min'
          ELSE '5 min'
        END as read_time,
        COALESCE(u.first_name || ' ' || u.last_name, 'Autor Anónimo') as author_role
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.status = 'publicado'
      ORDER BY bp.published_at DESC, bp.created_at DESC
    `);
    
    return result.rows.map(row => ({
      ...row,
      author_role: row.author_role || 'Especialista Legal'
    }));
  } catch (error) {
    console.error('Error fetching published blog posts:', error);
    throw error;
  }
}

// Get blog post by slug with author info
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const result = await query(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.email as author_email,
        CASE 
          WHEN bp.reading_time > 0 THEN bp.reading_time || ' min'
          ELSE '5 min'
        END as read_time,
        COALESCE(u.first_name || ' ' || u.last_name, 'Autor Anónimo') as author_role
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.slug = $1
    `, [slug]);
    
    const post = result.rows[0];
    if (!post) return null;
    
    return {
      ...post,
      author_role: post.author_role || 'Especialista Legal'
    };
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    throw error;
  }
}

// Get blog post by ID with author info
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const result = await query(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.email as author_email,
        CASE 
          WHEN bp.reading_time > 0 THEN bp.reading_time || ' min'
          ELSE '5 min'
        END as read_time,
        COALESCE(u.first_name || ' ' || u.last_name, 'Autor Anónimo') as author_role
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.id = $1
    `, [id]);
    
    const post = result.rows[0];
    if (!post) return null;
    
    return {
      ...post,
      author_role: post.author_role || 'Especialista Legal'
    };
  } catch (error) {
    console.error('Error fetching blog post by ID:', error);
    throw error;
  }
}

// Get blog posts by category
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  try {
    const result = await query(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.category = $1 AND bp.status = 'publicado'
      ORDER BY bp.published_at DESC, bp.created_at DESC
    `, [category]);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching blog posts by category:', error);
    throw error;
  }
}

// Update blog post views
export async function incrementBlogPostViews(slug: string): Promise<void> {
  try {
    await query(`
      UPDATE blog_posts 
      SET views = views + 1 
      WHERE slug = $1
    `, [slug]);
  } catch (error) {
    console.error('Error incrementing blog post views:', error);
    // Don't throw error for view counting failures
  }
}

// Delete blog post
export async function deleteBlogPost(id: string, authorId: string, userRole?: string): Promise<boolean> {
  try {
    let queryText = 'DELETE FROM blog_posts WHERE id = $1';
    const params = [id];
    
    // Solo verificar autor si no es administrador
    if (userRole !== 'administrador') {
      queryText += ' AND author_id = $2';
      params.push(authorId);
    }
    
    queryText += ' RETURNING id';
    
    const result = await query(queryText, params);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
}

// Get blog posts by author
export async function getBlogPostsByAuthor(authorId: string): Promise<BlogPost[]> {
  try {
    const result = await query(`
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.author_id = $1
      ORDER BY bp.created_at DESC
    `, [authorId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching blog posts by author:', error);
    throw error;
  }
}

// Search blog posts
export async function searchBlogPosts(searchTerm: string, category?: string): Promise<BlogPost[]> {
  try {
    let query_text = `
      SELECT 
        bp.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.status = 'publicado'
        AND (bp.title ILIKE $1 OR bp.excerpt ILIKE $1 OR bp.content ILIKE $1)
    `;
    
    const params = [`%${searchTerm}%`];
    
    if (category && category !== 'Todos') {
      query_text += ` AND bp.category = $2`;
      params.push(category);
    }
    
    query_text += ` ORDER BY bp.published_at DESC, bp.created_at DESC`;
    
    const result = await query(query_text, params);
    return result.rows;
  } catch (error) {
    console.error('Error searching blog posts:', error);
    throw error;
  }
}