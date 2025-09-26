import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if database connection is available
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      success: false,
      error:
        "Database connection not configured. Please set DATABASE_URL in .env.local",
    });
  }

  if (req.method === "GET") {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      // First, check if purchases table exists, if not create it
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'purchases'
        );
      `;

      if (!tableExists[0].exists) {
        console.log("Creating purchases table...");

        // Create the purchases table
        await sql`
          CREATE TABLE purchases (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
            user_package_id UUID REFERENCES user_packages(id) ON DELETE CASCADE,
            
            -- Purchase details
            package_type VARCHAR(255) NOT NULL,
            sessions_included INTEGER NOT NULL,
            amount_paid DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'USD',
            
            -- Payment information
            payment_method VARCHAR(50),
            stripe_payment_intent_id VARCHAR(255),
            stripe_charge_id VARCHAR(255),
            payment_status VARCHAR(50) DEFAULT 'completed',
            
            -- Timestamps
            purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            payment_completed_at TIMESTAMP WITH TIME ZONE,
            refunded_at TIMESTAMP WITH TIME ZONE,
            refund_amount DECIMAL(10,2),
            
            -- Purchase metadata
            purchase_source VARCHAR(50) DEFAULT 'website',
            notes TEXT,
            
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;

        // Add indexes
        await sql`CREATE INDEX idx_purchases_user_id ON purchases(user_id);`;
        await sql`CREATE INDEX idx_purchases_date ON purchases(purchase_date);`;
        await sql`CREATE INDEX idx_purchases_status ON purchases(payment_status);`;

        console.log("Purchases table created successfully");

        // Insert some sample data for the current user
        const users =
          await sql`SELECT id FROM users WHERE email = ${user_id} LIMIT 1;`;

        if (users.length > 0) {
          const userId = users[0].id;

          await sql`
            INSERT INTO purchases (
              user_id, 
              package_type, 
              sessions_included, 
              amount_paid, 
              payment_method, 
              payment_status,
              purchase_date,
              payment_completed_at
            ) VALUES 
            (
              ${userId},
              '4-Class Package',
              4,
              90.00,
              'stripe',
              'completed',
              NOW() - INTERVAL '15 days',
              NOW() - INTERVAL '15 days'
            ),
            (
              ${userId},
              '8-Class Package',
              8,
              160.00,
              'stripe',
              'completed',
              NOW() - INTERVAL '30 days',
              NOW() - INTERVAL '30 days'
            ),
            (
              ${userId},
              'Single Drop-In',
              1,
              25.00,
              'cash',
              'completed',
              NOW() - INTERVAL '7 days',
              NOW() - INTERVAL '7 days'
            )
          `;

          console.log("Sample purchase data inserted");
        }
      }

      // Fetch purchase history for the user
      const purchases = await sql`
        SELECT 
          id,
          package_type,
          sessions_included,
          amount_paid,
          currency,
          payment_method,
          payment_status,
          purchase_date,
          payment_completed_at,
          purchase_source
        FROM purchases 
        WHERE user_id = (SELECT id FROM users WHERE email = ${user_id})
        ORDER BY purchase_date DESC
      `;

      return res.status(200).json({
        success: true,
        data: purchases,
      });
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch purchase history",
      });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        user_id,
        package_type,
        sessions_included,
        amount_paid,
        payment_method,
        payment_status,
        stripe_payment_intent_id,
        notes,
      } = req.body;

      if (!user_id || !package_type || !sessions_included || !amount_paid) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: user_id, package_type, sessions_included, amount_paid",
        });
      }

      // Preserve price precision - use the exact amount without conversion
      const preciseAmount = amount_paid;

      // Get user ID from email
      const users =
        await sql`SELECT id FROM users WHERE email = ${user_id} LIMIT 1;`;

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      const userId = users[0].id;

      // Start a transaction to ensure both purchase and user_package are created
      await sql`BEGIN`;

      try {
        // Insert new purchase
        const purchase = await sql`
          INSERT INTO purchases (
            user_id,
            package_type,
            sessions_included,
            amount_paid,
            payment_method,
            payment_status,
            stripe_payment_intent_id,
            notes,
            payment_completed_at
          ) VALUES (
            ${userId},
            ${package_type},
            ${sessions_included},
            ${preciseAmount},
            ${payment_method || "stripe"},
            ${payment_status || "completed"},
            ${stripe_payment_intent_id || null},
            ${notes || null},
            ${payment_status === "completed" ? sql`NOW()` : null}
          )
          RETURNING *
        `;

        // Create user_package record to add sessions to user's account
        const userPackage = await sql`
          INSERT INTO user_packages (
            user_id,
            sessions_remaining,
            purchase_date,
            expiry_date,
            is_active
          ) VALUES (
            ${userId},
            ${sessions_included},
            NOW(),
            NOW() + INTERVAL '90 days',
            true
          )
          RETURNING *
        `;

        // Add sessions to user's account based on package type
        if (
          package_type.toLowerCase().includes("weightlifting") ||
          package_type.toLowerCase().includes("strength")
        ) {
          // Add to weightlifting classes
          await sql`
            UPDATE users 
            SET weightlifting_classes_remaining = COALESCE(weightlifting_classes_remaining, 0) + ${sessions_included}
            WHERE id = ${userId}
          `;
        } else if (
          package_type.toLowerCase().includes("private") ||
          package_type.toLowerCase().includes("personal")
        ) {
          // Add to private sessions
          await sql`
            UPDATE users 
            SET private_sessions_remaining = COALESCE(private_sessions_remaining, 0) + ${sessions_included}
            WHERE id = ${userId}
          `;
        } else {
          // Default to weightlifting classes for general packages
          await sql`
            UPDATE users 
            SET weightlifting_classes_remaining = COALESCE(weightlifting_classes_remaining, 0) + ${sessions_included}
            WHERE id = ${userId}
          `;
        }

        await sql`COMMIT`;

        return res.status(201).json({
          success: true,
          data: {
            purchase: purchase[0],
            user_package: userPackage[0],
            sessions_added: sessions_included,
          },
        });
      } catch (error) {
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      console.error("Error creating purchase:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create purchase record",
      });
    }
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} not allowed`,
  });
}
