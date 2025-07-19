import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['pillar', 'cluster', 'faq', 'guide', 'comparison']),
    keyword: z.string(),
    seo_score: z.number().optional(),
    word_count: z.number().optional(),
    generated_at: z.string(),
    status: z.enum(['draft', 'ready_for_review', 'published']).default('draft'),
    author: z.string().default('SizeGenetics Team'),
    publishDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    pillar_topic: z.string().optional(),
    related_articles: z.array(z.string()).optional()
  })
});

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    guide_type: z.enum(['beginner', 'advanced', 'troubleshooting', 'maintenance']),
    keyword: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    estimated_time: z.string().optional(),
    generated_at: z.string(),
    status: z.enum(['draft', 'ready_for_review', 'published']).default('draft'),
    author: z.string().default('SizeGenetics Team'),
    publishDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional()
  })
});

const faq = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['safety', 'effectiveness', 'usage', 'comparison', 'lifestyle']),
    questions: z.array(z.string()),
    generated_at: z.string(),
    status: z.enum(['draft', 'ready_for_review', 'published']).default('draft'),
    author: z.string().default('SizeGenetics Team'),
    publishDate: z.date().optional(),
    priority: z.number().default(1)
  })
});

export const collections = {
  articles,
  guides,
  faq
};

