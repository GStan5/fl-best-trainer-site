-- Add purchase history table to track all user purchases

-- Purchases table for comprehensive purchase history
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    user_package_id UUID REFERENCES user_packages(id) ON DELETE CASCADE,
    
    -- Purchase details
    package_type VARCHAR(255) NOT NULL, -- Store package name at time of purchase
    sessions_included INTEGER NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment information
    payment_method VARCHAR(50), -- 'stripe', 'cash', 'bank_transfer', etc.
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
    
    -- Timestamps
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_completed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10,2),
    
    -- Purchase metadata
    purchase_source VARCHAR(50) DEFAULT 'website', -- 'website', 'in_person', 'phone', etc.
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(payment_status);

-- Add trigger for updated_at
CREATE TRIGGER update_purchases_updated_at 
    BEFORE UPDATE ON purchases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add some sample purchase history data for testing
INSERT INTO purchases (
    user_id, 
    package_type, 
    sessions_included, 
    amount_paid, 
    payment_method, 
    payment_status,
    purchase_date,
    payment_completed_at
) 
SELECT 
    u.id,
    'Sample 4-Class Package',
    4,
    90.00,
    'stripe',
    'completed',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
FROM users u 
WHERE u.email IS NOT NULL
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO purchases (
    user_id, 
    package_type, 
    sessions_included, 
    amount_paid, 
    payment_method, 
    payment_status,
    purchase_date,
    payment_completed_at
) 
SELECT 
    u.id,
    'Sample 8-Class Package',
    8,
    160.00,
    'stripe',
    'completed',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
FROM users u 
WHERE u.email IS NOT NULL
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add a foreign key relationship from user_packages to purchases (optional)
-- This helps track which purchase created which package
ALTER TABLE user_packages 
ADD COLUMN IF NOT EXISTS purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL;

-- Create an index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_user_packages_purchase_id ON user_packages(purchase_id);