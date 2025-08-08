import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import "next-auth/jwt";
import { addUser } from "./utils/actions/supabase/post/post";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization:{
        prams:{
          scope: 'https://www.googleapis.com/auth/spreadsheets'
        }
      }
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // async signIn({user,account,profile}){
    //   await addUser(user.name,user.email)
    //   console.log({
    //     user:user,
    //     account:account,
    //     profile:profile
    //   },"user joined the data")
      
     
    //   return true
    // },
    jwt({ token, trigger, session, account }) {
  
      if (account) {
        token.accessToken = account.access_token;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
      }

      return token;
    },
    session({ session, token }) {
      
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
