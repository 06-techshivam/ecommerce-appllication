-- Update default payment method and orders to Google UPI (8451093907@ybl)
ALTER TABLE orders ALTER COLUMN payment_method SET DEFAULT 'Google UPI (8451093907@ybl)';
UPDATE orders SET payment_method = 'Google UPI (8451093907@ybl)' WHERE payment_method = 'google pay' OR payment_method LIKE '%Google Pay%';

