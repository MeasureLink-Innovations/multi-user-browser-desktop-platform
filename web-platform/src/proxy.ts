import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Protect all routes except login, public assets, and API routes
  matcher: ['/dashboard/:path*', '/admin/:index*', '/desktop/:path*'],
};
