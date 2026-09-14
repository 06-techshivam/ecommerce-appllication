import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { createAdminClient } from '@insforge/sdk';
import { BASE_PRODUCTS } from '../lib/data.ts';

const admin = createAdminClient({
  baseUrl: 'https://w2f3s8c4.ap-southeast.insforge.app',
  apiKey: 'ik_be61f611ad4e692fc8769fbd46ee9bcb',
});

async function seed() {
  console.log(`Preparing to seed ${BASE_PRODUCTS.length} products...`);

  const rows = BASE_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    compare_at_price: p.compareAtPrice || null,
    description: p.description,
    sizes: p.sizes,
    images: p.images,
    featured: Boolean(p.featured),
    is_new: Boolean(p.isNew),
    trending: Boolean(p.trending),
  }));

  const { data, error } = await admin.database
    .from('products')
    .insert(rows)
    .select();

  if (error) {
    console.error('Error inserting products:', error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} products into products table.`);
}

seed().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});

