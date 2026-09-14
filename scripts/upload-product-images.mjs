import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@insforge/sdk';

const admin = createAdminClient({
  baseUrl: 'https://w2f3s8c4.ap-southeast.insforge.app',
  apiKey: 'ik_be61f611ad4e692fc8769fbd46ee9bcb',
});

async function main() {
  const dir = path.resolve('public/images/products');
  if (!fs.existsSync(dir)) {
    console.log('No public/images/products directory found.');
    return;
  }

  const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
  if (files.length === 0) {
    console.log('No images found in public/images/products. Skipping image upload.');
    return;
  }

  console.log(`Found ${files.length} images to upload...`);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const buffer = fs.readFileSync(filePath);
    const { data, error } = await admin.storage.from('product-images').upload(file, buffer);
    if (error) {
      console.warn(`Failed to upload ${file}:`, error);
    } else {
      console.log(`Uploaded ${file}: ${data?.url || data?.key}`);
    }
  }
}

main().catch(console.error);

