-- Database schema for FL Best Trainer Classes system

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages table (class packages users can purchase)
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sessions_included INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User packages (purchased packages)
CREATE TABLE IF NOT EXISTS user_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    sessions_remaining INTEGER NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    stripe_payment_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255) NOT NULL DEFAULT 'Gavin Stanifer',
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 8,
    current_participants INTEGER DEFAULT 0,
    location VARCHAR(255) NOT NULL,
    class_type VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(50) DEFAULT 'All Levels',
    equipment_needed TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    user_package_id UUID REFERENCES user_packages(id) ON DELETE CASCADE,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, class_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_date ON classes(date);
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_user_packages_user_id ON user_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_packages_active ON user_packages(is_active);

-- Insert sample packages
INSERT INTO packages (name, description, sessions_included, price, duration_days) VALUES
('Single Drop-In', 'Perfect for trying out our classes', 1, 25.00, 7),
('4-Class Package', 'Great for regular attendees', 4, 90.00, 30),
('8-Class Package', 'Best value for committed fitness enthusiasts', 8, 160.00, 60),
('Unlimited Monthly', 'Unlimited classes for one month', 999, 200.00, 30)
ON CONFLICT DO NOTHING;

-- Insert sample classes for demonstration
INSERT INTO classes (title, description, date, start_time, end_time, max_participants, location, class_type, difficulty_level, equipment_needed) VALUES
('HIIT Bootcamp', 'High-intensity interval training for maximum calorie burn', CURRENT_DATE + INTERVAL '1 day', '06:00:00', '07:00:00', 8, 'Sarasota Beach Park', 'HIIT', 'Intermediate', 'Water bottle, towel'),
('Strength & Conditioning', 'Build muscle and improve functional movement', CURRENT_DATE + INTERVAL '2 days', '18:00:00', '19:00:00', 6, 'Home Studio', 'Strength', 'All Levels', 'None - equipment provided'),
('Yoga Flow', 'Gentle yoga to improve flexibility and reduce stress', CURRENT_DATE + INTERVAL '3 days', '08:00:00', '09:00:00', 10, 'Longboat Key Community Center', 'Yoga', 'Beginner', 'Yoga mat'),
('Cardio Blast', 'Heart-pumping cardio workout', CURRENT_DATE + INTERVAL '4 days', '19:00:00', '20:00:00', 8, 'Sarasota Beach Park', 'Cardio', 'Intermediate', 'Water bottle, comfortable shoes'),
('Core & Flexibility', 'Focus on core strength and flexibility', CURRENT_DATE + INTERVAL '5 days', '07:00:00', '08:00:00', 8, 'Home Studio', 'Core', 'All Levels', 'Yoga mat')
ON CONFLICT DO NOTHING;

-- Function to update current_participants count
CREATE OR REPLACE FUNCTION update_class_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
        UPDATE classes 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.class_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
            UPDATE classes 
            SET current_participants = current_participants - 1 
            WHERE id = NEW.class_id;
        ELSIF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
            UPDATE classes 
            SET current_participants = current_participants + 1 
            WHERE id = NEW.class_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
        UPDATE classes 
        SET current_participants = current_participants - 1 
        WHERE id = OLD.class_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic participant count updates
DROP TRIGGER IF EXISTS update_participants_trigger ON bookings;
CREATE TRIGGER update_participants_trigger
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_class_participants();

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_packages_updated_at BEFORE UPDATE ON user_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();