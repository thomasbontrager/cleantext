import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const signup = async (email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const passwordHash = await bcryptjs.hash(password, 12);
  
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email,
      passwordHash,
      role: 'USER',
      subscription: {
        create: {
          id: uuidv4(),
          plan: 'FREE',
          status: 'ACTIVE',
        },
      },
    },
    include: { subscription: true },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );

  return { user, token };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcryptjs.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );

  return { user, token };
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
};
