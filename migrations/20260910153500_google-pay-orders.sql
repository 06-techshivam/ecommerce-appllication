-- Add payment_status and payment_method to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'google pay';

-- Update status check constraint to support the 4-stage lifecycle (pending -> confirmed -> shipped -> delivered)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'paid', 'shipped', 'delivered'));

-- Enable RLS UPDATE policy so users can update their own orders upon completing payment
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders 
  FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() IS NULL) 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

