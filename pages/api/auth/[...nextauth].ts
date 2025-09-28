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
    async redirect({ url, baseUrl }) {
      // If there's a callbackUrl in the URL params, use it for existing users
      const urlObj = new URL(url.startsWith("http") ? url : `${baseUrl}${url}`);
      const callbackUrl = urlObj.searchParams.get("callbackUrl");

      // For existing users with a specific callback URL, redirect there
      if (callbackUrl && callbackUrl.startsWith("/") && callbackUrl !== "/") {
        return `${baseUrl}${callbackUrl}`;
      }

      // For new sign-ins without a specific callback, go to onboarding
      // This will be handled by the onboarding page to redirect completed users to classes
      if (
        url === baseUrl ||
        url === `${baseUrl}/` ||
        url.includes("/api/auth/callback")
      ) {
        return `${baseUrl}/onboarding`;
      }

      // Allow same origin redirects
      if (url.startsWith(baseUrl)) return url;
      // Allow relative callback urls
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
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
