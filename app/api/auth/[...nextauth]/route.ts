import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'r_liteprofile r_emailaddress',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Store access token for LinkedIn API calls
      if (account?.provider === 'linkedin') {
        token.linkedinAccessToken = account.access_token;
        token.linkedinProfile = profile;
      }
      return token;
    },
    async session({ session, token }) {
      // Preserve all user information including image
      if (session.user) {
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
      }
      // Add LinkedIn access token to session for API calls
      if (token.linkedinAccessToken) {
        (session as any).linkedinAccessToken = token.linkedinAccessToken;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 