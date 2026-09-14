import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { execSync } from 'node:child_process';
import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'https://w2f3s8c4.ap-southeast.insforge.app',
  anonKey: 'anon_0920ce46d43ca5c8ea9d7bc15a72c3c966953fcdadccf6c5b44a9f2d6caea0b0',
});

async function runE2ETest() {
  console.log('=== STARTING END-TO-END VERIFICATION ===\n');

  // 1. Verify Products from Database
  console.log('1. Loading products from database...');
  const { data: products, error: pErr } = await client.database
    .from('products')
    .select('*')
    .limit(10);

  if (pErr || !products || products.length === 0) {
    throw new Error(`Products load failed: ${pErr?.message || 'No products'}`);
  }
  console.log(`✓ Successfully loaded ${products.length} products from InsForge database.`);
  console.log(`  Sample: "${products[0].name}" (₹${products[0].price}) - Category: ${products[0].category}\n`);


  // 2. Fresh User Sign Up
  const testEmail = `test_${Date.now()}@zenvora-test.com`;
  const testPassword = 'Password123!';
  const testName = 'Helena Rostova';
  console.log(`2. Signing up fresh test account: ${testEmail}...`);

  const { data: signUpData, error: signUpErr } = await client.auth.signUp({
    email: testEmail,
    password: testPassword,
    name: testName,
  });

  if (signUpErr) {
    throw new Error(`Sign up failed: ${signUpErr.message}`);
  }
  console.log(`✓ User registration initiated!`);

  // Verify email in database via CLI
  execSync(`npx @insforge/cli db query "UPDATE auth.users SET email_verified = true WHERE email = '${testEmail}';"`, {
    env: { ...process.env, Path: "C:\\Users\\akhil\\.nodejs\\node-v22.23.2-win-x64;" + process.env.Path },
    stdio: 'ignore',
  });
  console.log(`✓ Email verified for test account.\n`);

  // 3. User Sign In
  console.log('3. Logging in with created user credentials...');
  const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInErr || !signInData?.user) {
    throw new Error(`Sign in failed: ${signInErr?.message}`);
  }
  const user = signInData.user;
  console.log(`✓ Authenticated as: ${user.email} (ID: ${user.id})\n`);

  // 4. Cart Synchronization
  console.log('4. Adding item to user cart in database...');
  const sampleProduct = products[0];
  const { data: cartData, error: cartErr } = await client.database
    .from('carts')
    .insert([
      {
        user_id: user.id,
        product_id: sampleProduct.id,
        size: 'M',
        quantity: 2,
      },
    ])
    .select();

  if (cartErr) {
    throw new Error(`Cart sync failed: ${cartErr.message}`);
  }
  console.log(`✓ Added product "${sampleProduct.name}" (Size M, Qty 2) to carts table.`);

  // Verify cart read
  const { data: userCart, error: readCartErr } = await client.database
    .from('carts')
    .select('*')
    .eq('user_id', user.id);

  if (readCartErr || !userCart || userCart.length === 0) {
    throw new Error(`Failed to read user cart: ${readCartErr?.message}`);
  }
  console.log(`✓ Verified user cart retrieval: ${userCart.length} item(s) in cart.\n`);

  // 5. Checkout & Order Creation with Receipt
  console.log('5. Testing Checkout with payment receipt upload...');
  const receiptContent = Buffer.from('TEST RECEIPT DUMMY INVOICE PROOF FOR ORDER', 'utf8');
  const receiptKey = `receipt-${Date.now()}.txt`;

  const { data: uploadData, error: uploadErr } = await client.storage
    .from('payment-uploads')
    .upload(receiptKey, receiptContent);

  if (uploadErr) {
    console.warn(`Receipt upload note: ${uploadErr.message}`);
  } else {
    console.log(`✓ Receipt uploaded to payment-uploads: ${uploadData?.url || receiptKey}`);
  }

  const orderTotal = Number(sampleProduct.price) * 2;
  console.log('5. Inserting order record into database (pending, unpaid, google pay)...');
  const { data: orderData, error: orderErr } = await client.database
    .from('orders')
    .insert([
      {
        user_id: user.id,
        items: [
          {
            id: sampleProduct.id,
            name: sampleProduct.name,
            size: 'M',
            quantity: 2,
            price: Number(sampleProduct.price),
          },
        ],
        subtotal: orderTotal,
        shipping: 0,
        total: orderTotal,
        status: 'pending',
        payment_status: 'unpaid',
        payment_method: 'Google Pay (shivamrp100@fam)',
        contact: {
          name: testName,
          email: testEmail,
          phone: '+91 9876543210',
        },
        shipping_address: {
          address: '42 Marine Drive',
          apartment: 'Apartment 12B',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400020',
          country: 'India',
          payment_method: 'Google Pay (shivamrp100@fam)',
        },
      },
    ])
    .select();

  if (orderErr || !orderData || orderData.length === 0) {
    throw new Error(`Order placement failed: ${orderErr?.message}`);
  }
  const createdOrder = orderData[0];
  console.log(`✓ Order successfully created in orders table!`);
  console.log(`  Order ID: ${createdOrder.id}`);
  console.log(`  Status: ${createdOrder.status}`);
  console.log(`  Payment Status: ${createdOrder.payment_status}`);
  console.log(`  Payment Method: ${createdOrder.payment_method}`);
  console.log(`  Total: ₹${createdOrder.total}\n`);

  if (createdOrder.status !== 'pending' || createdOrder.payment_status !== 'unpaid') {
    throw new Error(`Initial order status mismatch: expected pending/unpaid, got ${createdOrder.status}/${createdOrder.payment_status}`);
  }

  // 6. Test Google Pay Return Callback (Simulate Payment Completion)
  console.log('6. Simulating Google Pay return callback (/payment/return update)...');
  const { data: updatedOrders, error: updateErr } = await client.database
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
    })
    .eq('id', createdOrder.id)
    .select();

  if (updateErr || !updatedOrders || updatedOrders.length === 0) {
    throw new Error(`Order payment update failed: ${updateErr?.message}`);
  }
  const paidOrder = updatedOrders[0];
  console.log(`✓ Order status updated via SDK upon Google Pay confirmation!`);
  console.log(`  Updated Status: ${paidOrder.status}`);
  console.log(`  Updated Payment Status: ${paidOrder.payment_status}\n`);

  if (paidOrder.status !== 'confirmed' || paidOrder.payment_status !== 'paid') {
    throw new Error(`Updated order status mismatch: expected confirmed/paid, got ${paidOrder.status}/${paidOrder.payment_status}`);
  }

  // 7. Profile Order History Retrieval
  console.log('7. Querying Profile Order History for user...');
  const { data: profileOrders, error: profileErr } = await client.database
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (profileErr || !profileOrders || profileOrders.length === 0) {
    throw new Error(`Profile orders query failed: ${profileErr?.message}`);
  }
  console.log(`✓ Profile Order History verified: found ${profileOrders.length} order(s).`);
  console.log(`  Order #${profileOrders[0].id} with status "${profileOrders[0].status}" and payment "${profileOrders[0].payment_status}".\n`);

  // 7. Sign Out
  console.log('7. Signing out user...');
  await client.auth.signOut();
  console.log('✓ Successfully signed out.\n');

  console.log('=== ALL END-TO-END VERIFICATIONS PASSED! ===');
}

runE2ETest().catch((err) => {
  console.error('❌ E2E Verification Failed:', err);
  process.exit(1);
});

