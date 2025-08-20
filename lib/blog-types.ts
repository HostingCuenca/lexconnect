// Types and constants that can be used in both client and server components

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string[];
  status: 'borrador' | 'publicado' | 'archivado';
  views: number;
  reading_time: number;
  read_time: string; // Formatted reading time (e.g., "5 min")
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields from users table
  author_name?: string;
  author_email?: string;
  author_role?: string;
}

export interface CreateBlogPostData {
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  status?: 'borrador' | 'publicado' | 'archivado';
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}

// Valid categories for blog posts
export const BLOG_CATEGORIES = [
  'Derecho Civil',
  'Derecho Penal', 
  'Derecho Laboral',
  'Derecho Mercantil',
  'Derecho Familiar',
  'Derecho Fiscal',
  'Derecho Inmobiliario',
  'Derecho Administrativo',
  'Propiedad Intelectual',
  'Derecho Migratorio'
] as const;