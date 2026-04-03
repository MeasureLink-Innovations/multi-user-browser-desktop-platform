import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function getUser(email: string) {
  try {
    console.log('Fetching user for email:', email);
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found:', user ? 'Yes' : 'No');
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Handle cases where credentials might be FormData or plain object
        const creds = credentials instanceof FormData 
          ? Object.fromEntries(credentials) 
          : credentials;

        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(creds);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) {
            console.log('User not found in DB');
            return null;
          }
          
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          console.log('Password matches:', passwordsMatch);

          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials for:', (creds as any)?.email);
        return null;
      },
    }),
  ],
});
