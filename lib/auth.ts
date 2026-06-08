// lib/auth.ts
// Configurazione NextAuth v4

import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from './prisma';
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const utente = await prisma.utente.findUnique({ where: { email } });
        if (!utente) return null;

        const valido = await bcrypt.compare(password, utente.passwordHash);
        if (!valido) return null;

        return {
          id: utente.id,
          email: utente.email,
          name: `${utente.nome} ${utente.cognome}`,
          role: utente.ruolo,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper per Server Components / Route Handlers (equivalente di auth() in v5)
export const auth = () => getServerSession(authOptions);

export default NextAuth(authOptions);
