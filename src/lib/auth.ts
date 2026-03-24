import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, trigger }) {
      if (trigger === "signIn" || trigger === "update") {
        token.isAdmin = !!token.email && ADMIN_EMAILS.includes(token.email);
        // userStatus will be fetched client-side, not during login
        token.userStatus = token.isAdmin ? "active" : undefined;
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).isAdmin = token.isAdmin || false;
      (session as any).userStatus = token.userStatus || undefined;
      return session;
    },
  },
});
