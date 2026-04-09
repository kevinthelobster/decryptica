import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), '../data/prompts/prompts.db');

export async function GET() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  const prompts = db.prepare(`
    SELECT slug, updated_at FROM prompts
    ORDER BY updated_at DESC
  `).all() as { slug: string; updated_at: number }[];

  db.close();

  const baseUrl = 'https://decryptica.com';
  const items = prompts.map(p => `    <url>
      <loc>${baseUrl}/prompts/${p.slug}</loc>
      <lastmod>${new Date(p.updated_at * 1000).toISOString().split('T')[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
