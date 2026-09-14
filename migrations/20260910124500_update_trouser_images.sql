-- Update trouser product images to high-resolution, clear imagery
UPDATE products 
SET images = '["https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80"]'::jsonb 
WHERE id = 'pleated-wide-leg-trousers-sand';

UPDATE products 
SET images = '["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80"]'::jsonb 
WHERE id = 'tailored-cigarette-trousers';

