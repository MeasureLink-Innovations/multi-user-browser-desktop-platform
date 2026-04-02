'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

async function checkAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
}

export async function createUser(formData: FormData) {
  await checkAdmin();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string || 'standard_user';

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });
    revalidatePath('/admin/users');
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user. It might already exist.');
  }
}

export async function deleteUser(id: string) {
  await checkAdmin();
  
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/users');
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw new Error('Failed to delete user.');
  }
}

export async function getUsers() {
  await checkAdmin();
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}
