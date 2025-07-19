/**
 * Content integration utilities for SizeGenetics website
 * Handles integration between content generator and Astro content collections
 */

import fs from 'fs';
import path from 'path';

export interface GeneratedContent {
  type: 'pillar' | 'cluster' | 'faq' | 'guide' | 'comparison';
  topic: string;
  keyword: string;
  content: string;
  seo_elements?: string;
  word_count: number;
  generated_at: string;
  filename: string;
  pillar_topic?: string;
  guide_type?: string;
  category?: string;
  questions?: string[];
  products?: string[];
  seo_score?: number;
}

export interface ContentMetadata {
  title: string;
  description: string;
  type: string;
  keyword: string;
  seo_score?: number;
  word_count?: number;
  generated_at: string;
  status: 'draft' | 'ready_for_review' | 'published';
  author?: string;
  publishDate?: Date;
  tags?: string[];
  featured?: boolean;
  pillar_topic?: string;
  related_articles?: string[];
}

/**
 * Convert generated content to Astro content collection format
 */
export function convertToAstroContent(generatedContent: GeneratedContent): {
  frontmatter: ContentMetadata;
  content: string;
} {
  // Extract description from content (first paragraph)
  const contentLines = generatedContent.content.split('\n').filter(line => line.trim());
  const firstParagraph = contentLines.find(line => 
    !line.startsWith('#') && 
    !line.startsWith('---') && 
    line.length > 50
  ) || generatedContent.topic;

  // Generate description
  const description = firstParagraph.length > 160 
    ? firstParagraph.substring(0, 157) + '...'
    : firstParagraph;

  // Generate tags based on content type and keyword
  const tags = generateTags(generatedContent);

  const frontmatter: ContentMetadata = {
    title: generatedContent.topic,
    description: description,
    type: generatedContent.type,
    keyword: generatedContent.keyword,
    seo_score: generatedContent.seo_score,
    word_count: generatedContent.word_count,
    generated_at: generatedContent.generated_at,
    status: 'ready_for_review',
    author: 'SizeGenetics Team',
    tags: tags,
    featured: generatedContent.type === 'pillar', // Feature pillar articles
  };

  // Add type-specific metadata
  if (generatedContent.pillar_topic) {
    frontmatter.pillar_topic = generatedContent.pillar_topic;
  }

  return {
    frontmatter,
    content: generatedContent.content
  };
}

/**
 * Generate tags based on content type and keyword
 */
function generateTags(content: GeneratedContent): string[] {
  const tags: string[] = [];

  // Add type-based tags
  switch (content.type) {
    case 'pillar':
      tags.push('comprehensive guide', 'education');
      break;
    case 'cluster':
      tags.push('detailed guide', 'specific topic');
      break;
    case 'faq':
      tags.push('frequently asked questions', 'quick answers');
      break;
    case 'guide':
      tags.push('step-by-step', 'how-to guide');
      break;
    case 'comparison':
      tags.push('comparison', 'product review');
      break;
  }

  // Add keyword-based tags
  const keyword = content.keyword.toLowerCase();
  if (keyword.includes('safety')) tags.push('safety');
  if (keyword.includes('clinical')) tags.push('clinical studies');
  if (keyword.includes('device')) tags.push('devices');
  if (keyword.includes('enhancement')) tags.push('male enhancement');
  if (keyword.includes('results')) tags.push('results');
  if (keyword.includes('beginner')) tags.push('beginner-friendly');

  // Add general tags
  tags.push('sizegenetics', 'male health');

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Save content to Astro content collection
 */
export async function saveToContentCollection(
  generatedContent: GeneratedContent,
  contentDir: string = 'src/content'
): Promise<string> {
  const { frontmatter, content } = convertToAstroContent(generatedContent);
  
  // Determine collection based on content type
  let collection: string;
  switch (generatedContent.type) {
    case 'guide':
      collection = 'guides';
      break;
    case 'faq':
      collection = 'faq';
      break;
    default:
      collection = 'articles';
  }

  // Generate filename
  const slug = generateSlug(generatedContent.topic);
  const filename = `${slug}.md`;
  const filepath = path.join(contentDir, collection, filename);

  // Create frontmatter YAML
  const yamlFrontmatter = createYAMLFrontmatter(frontmatter);

  // Create full markdown content
  const markdownContent = `---\n${yamlFrontmatter}\n---\n\n${content}`;

  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(filepath, markdownContent, 'utf-8');

  return filepath;
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Create YAML frontmatter from metadata
 */
function createYAMLFrontmatter(metadata: ContentMetadata): string {
  const yaml: string[] = [];

  yaml.push(`title: "${metadata.title.replace(/"/g, '\\"')}"`);
  yaml.push(`description: "${metadata.description.replace(/"/g, '\\"')}"`);
  yaml.push(`type: ${metadata.type}`);
  yaml.push(`keyword: "${metadata.keyword}"`);
  
  if (metadata.seo_score !== undefined) {
    yaml.push(`seo_score: ${metadata.seo_score}`);
  }
  
  if (metadata.word_count !== undefined) {
    yaml.push(`word_count: ${metadata.word_count}`);
  }
  
  yaml.push(`generated_at: "${metadata.generated_at}"`);
  yaml.push(`status: ${metadata.status}`);
  yaml.push(`author: "${metadata.author}"`);
  
  if (metadata.publishDate) {
    yaml.push(`publishDate: ${metadata.publishDate.toISOString().split('T')[0]}`);
  }
  
  if (metadata.tags && metadata.tags.length > 0) {
    yaml.push(`tags:`);
    metadata.tags.forEach(tag => {
      yaml.push(`  - "${tag}"`);
    });
  }
  
  if (metadata.featured !== undefined) {
    yaml.push(`featured: ${metadata.featured}`);
  }
  
  if (metadata.pillar_topic) {
    yaml.push(`pillar_topic: "${metadata.pillar_topic}"`);
  }
  
  if (metadata.related_articles && metadata.related_articles.length > 0) {
    yaml.push(`related_articles:`);
    metadata.related_articles.forEach(article => {
      yaml.push(`  - "${article}"`);
    });
  }

  return yaml.join('\n');
}

/**
 * Batch import generated content to Astro collections
 */
export async function batchImportContent(
  generatedContentDir: string,
  astroContentDir: string = 'src/content'
): Promise<{ imported: string[]; errors: string[] }> {
  const imported: string[] = [];
  const errors: string[] = [];

  try {
    const files = fs.readdirSync(generatedContentDir);
    const metadataFiles = files.filter(file => file.endsWith('_metadata.json'));

    for (const metadataFile of metadataFiles) {
      try {
        const metadataPath = path.join(generatedContentDir, metadataFile);
        const contentFile = metadataFile.replace('_metadata.json', '.md');
        const contentPath = path.join(generatedContentDir, contentFile);

        // Read metadata
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        
        // Read content
        if (!fs.existsSync(contentPath)) {
          errors.push(`Content file not found: ${contentFile}`);
          continue;
        }
        
        const content = fs.readFileSync(contentPath, 'utf-8');
        
        // Extract content (remove frontmatter if present)
        const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');

        // Create GeneratedContent object
        const generatedContent: GeneratedContent = {
          type: metadata.type,
          topic: metadata.topic || metadata.title,
          keyword: metadata.keyword,
          content: contentWithoutFrontmatter,
          seo_elements: metadata.seo_elements,
          word_count: metadata.word_count,
          generated_at: metadata.generated_at,
          filename: metadata.filename,
          seo_score: metadata.seo_score,
          pillar_topic: metadata.pillar_topic,
          guide_type: metadata.guide_type,
          category: metadata.category,
          questions: metadata.questions,
          products: metadata.products
        };

        // Save to Astro content collection
        const savedPath = await saveToContentCollection(generatedContent, astroContentDir);
        imported.push(savedPath);

      } catch (error) {
        errors.push(`Error processing ${metadataFile}: ${error.message}`);
      }
    }

  } catch (error) {
    errors.push(`Error reading directory ${generatedContentDir}: ${error.message}`);
  }

  return { imported, errors };
}

/**
 * Update content status (draft -> ready_for_review -> published)
 */
export async function updateContentStatus(
  contentPath: string,
  newStatus: 'draft' | 'ready_for_review' | 'published'
): Promise<void> {
  const content = fs.readFileSync(contentPath, 'utf-8');
  
  // Update status in frontmatter
  const updatedContent = content.replace(
    /^status: .+$/m,
    `status: ${newStatus}`
  );
  
  // Add publish date if publishing
  if (newStatus === 'published') {
    const publishDate = new Date().toISOString().split('T')[0];
    const withPublishDate = updatedContent.replace(
      /^(status: published)$/m,
      `$1\npublishDate: ${publishDate}`
    );
    fs.writeFileSync(contentPath, withPublishDate, 'utf-8');
  } else {
    fs.writeFileSync(contentPath, updatedContent, 'utf-8');
  }
}

/**
 * Generate sitemap entries for all content
 */
export async function generateSitemapEntries(
  contentDir: string = 'src/content'
): Promise<Array<{ url: string; lastmod: string; priority: number; changefreq: string }>> {
  const entries: Array<{ url: string; lastmod: string; priority: number; changefreq: string }> = [];

  const collections = ['articles', 'guides', 'faq'];
  
  for (const collection of collections) {
    const collectionDir = path.join(contentDir, collection);
    
    if (!fs.existsSync(collectionDir)) continue;
    
    const files = fs.readdirSync(collectionDir).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      try {
        const filePath = path.join(collectionDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) continue;
        
        const frontmatter = frontmatterMatch[1];
        const statusMatch = frontmatter.match(/^status:\s*(.+)$/m);
        const typeMatch = frontmatter.match(/^type:\s*(.+)$/m);
        const generatedAtMatch = frontmatter.match(/^generated_at:\s*"(.+)"$/m);
        
        // Only include published content
        if (statusMatch && statusMatch[1] !== 'published') continue;
        
        const slug = file.replace('.md', '');
        const url = collection === 'articles' ? `/articles/${slug}` : `/${collection}/${slug}`;
        const lastmod = generatedAtMatch ? generatedAtMatch[1] : new Date().toISOString();
        
        // Set priority based on content type
        let priority = 0.8;
        if (typeMatch) {
          const type = typeMatch[1];
          switch (type) {
            case 'pillar':
              priority = 1.0;
              break;
            case 'guide':
              priority = 0.9;
              break;
            case 'cluster':
              priority = 0.8;
              break;
            case 'faq':
              priority = 0.7;
              break;
            case 'comparison':
              priority = 0.8;
              break;
          }
        }
        
        entries.push({
          url,
          lastmod,
          priority,
          changefreq: 'monthly'
        });
        
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }
  
  return entries;
}

