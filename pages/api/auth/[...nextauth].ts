import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import sql from "../../../lib/database";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    isAdmin?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      // Fetch admin status for the user
      if (token.email) {
        try {
          const user = await sql`
            SELECT is_admin FROM users WHERE email = ${token.email}
          `;
          if (user.length > 0) {
            token.isAdmin = user[0].is_admin || false;
          }
        } catch (error) {
          console.error("Error fetching admin status:", error);
          token.isAdmin = false;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.isAdmin = token.isAdmin || false;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) return false;

        // Check if user already exists
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${user.email}
        `;

        if (existingUser.length === 0) {
          // Create new user record
          await sql`
            INSERT INTO users (
              email, 
              name, 
              google_id,
              first_name,
              last_name,
              onboarding_completed,
              waiver_signed
            ) VALUES (
              ${user.email},
              ${user.name || ""},
              ${account?.providerAccountId || ""},
              ${user.name?.split(" ")[0] || ""},
              ${user.name?.split(" ").slice(1).join(" ") || ""},
              false,
              false
            )
          `;
          console.log(`✅ Created new user: ${user.email}`);
        } else {
          // Update existing user's Google ID if needed
          await sql`
            UPDATE users 
            SET 
              google_id = ${account?.providerAccountId || ""},
              updated_at = NOW()
            WHERE email = ${user.email} AND google_id IS NULL
          `;
        }

        return true;
      } catch (error) {
        console.error("❌ Error in signIn callback:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
