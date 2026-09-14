import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { createAdminClient } from '@insforge/sdk';

const admin = createAdminClient({
  baseUrl: 'https://w2f3s8c4.ap-southeast.insforge.app',
  apiKey: 'ik_be61f611ad4e692fc8769fbd46ee9bcb',
});

async function main() {
  console.log('Updating images for pleated-wide-leg-trousers-sand in InsForge database...');
  const newImages = [
    'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',
  ];

  const { data, error } = await admin.database
    .from('products')
    .update({ images: newImages })
    .eq('id', 'pleated-wide-leg-trousers-sand')
    .select();

  if (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }

  console.log('Successfully updated product in database:', data);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});

