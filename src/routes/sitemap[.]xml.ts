import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { SITE } from '@/lib/constants'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = SITE.baseUrl || 'https://www.egg-rate.today';
        
        const [states, cities, posts, pages] = await Promise.all([
          supabase.from('states').select('slug, updated_at').eq('status', 'active'),
          supabase.from('cities').select('slug, updated_at').eq('status', 'active'),
          supabase.from('posts').select('slug, updated_at').eq('is_published', true),
          supabase.from('pages').select('slug, updated_at').eq('is_published', true)
        ]);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Home
        xml += `
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

        // States
        states.data?.forEach(s => {
          xml += `
  <url>
    <loc>${baseUrl}/state/${s.slug}</loc>
    <lastmod>${(s.updated_at || new Date().toISOString()).split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // Cities
        cities.data?.forEach(c => {
          xml += `
  <url>
    <loc>${baseUrl}/city/${c.slug}</loc>
    <lastmod>${(c.updated_at || new Date().toISOString()).split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        // Blog Posts
        posts.data?.forEach(p => {
          xml += `
  <url>
    <loc>${baseUrl}/blog/${p.slug}</loc>
    <lastmod>${(p.updated_at || new Date().toISOString()).split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });

        // Static Pages
        pages.data?.forEach(p => {
          xml += `
  <url>
    <loc>${baseUrl}/${p.slug}</loc>
    <lastmod>${(p.updated_at || new Date().toISOString()).split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`;
        });

        xml += '\n</urlset>';

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
