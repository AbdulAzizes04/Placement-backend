import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { User, Role } from '@prisma/client';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { encrypt, decrypt, hash } from '../../utils/encryption';

export class AuthService {
  async register(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const emailHash = data.email ? hash(data.email) : undefined;

    // Check Email Duplicate (Blind Index)
    if (emailHash) {
      const existing = await prisma.user.findFirst({ where: { email_hash: emailHash } });
      if (existing) throw new Error("Email already in use");
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email ? encrypt(data.email) : null,
        email_hash: emailHash,
        password: hashedPassword,
        phone: data.phone ? encrypt(data.phone) : null,
        phone_hash: data.phone ? hash(data.phone) : null,
        role: data.role as Role,
        college_id: data.college_id,
        username: null, // Default username to null for non-students or explicit register
        mustChangePassword: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college_id: true,
        created_at: true,
      },
    });

    // Decrypt return value
    return {
      ...user,
      email: decrypt(user.email || '')
    };
  }

  async login(data: LoginDto) {
    const { identifier, password } = data;
    const identifierHash = hash(identifier);

    // 2️⃣ Authentication Update: Support Email OR Username via Blind Index
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email_hash: identifierHash },
          { username_hash: identifierHash }
        ]
      },
      include: {
        faculty_profile: true
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, faculty_profile, ...baseUser } = user as any;

    // Extract first branch as managedBranch for legacy frontend support
    const managedBranch = faculty_profile?.assignedBranches?.[0] || null;

    // Decrypt PII for Token and Response
    const decryptedEmail = decrypt(user.email || '');
    const decryptedUsername = decrypt(user.username || '');
    const decryptedPhone = user.phone ? decrypt(user.phone) : null;

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: decryptedEmail,
        username: decryptedUsername,
        phone: decryptedPhone, // Add phone to token if needed, or just return in user object
        college_id: user.college_id,
        managedBranch, // Also include in token
        mustChangePassword: user.mustChangePassword // Critical Security Flag
      },
      process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET is not defined"); })(),
      { expiresIn: '7d' }
    );

    return {
      user: {
        ...baseUser,
        email: decryptedEmail,
        username: decryptedUsername,
        phone: decryptedPhone,
        managedBranch
      },
      token
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { faculty_profile: true }
    });

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      throw new Error('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and reset flag
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false
      },
      include: { faculty_profile: true }
    });

    // Generate new token with updated mustChangePassword flag
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, faculty_profile, ...baseUser } = updatedUser as any;
    const managedBranch = faculty_profile?.assignedBranches?.[0] || null;
    const decryptedEmail = decrypt(updatedUser.email || '');
    const decryptedUsername = decrypt(updatedUser.username || '');

    const token = jwt.sign(
      {
        id: updatedUser.id,
        role: updatedUser.role,
        email: decryptedEmail,
        username: decryptedUsername,
        college_id: updatedUser.college_id,
        managedBranch,
        mustChangePassword: false // Explicitly false now
      },
      process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET is not defined"); })(),
      { expiresIn: '7d' }
    );

    return {
      user: {
        ...baseUser,
        email: decryptedEmail,
        username: decryptedUsername,
        managedBranch
      },
      token
    };
  }
  async resetPasswordDirect(identifier: string, newPassword: string) {
    const identifierHash = hash(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email_hash: identifierHash },
          { username_hash: identifierHash }
        ]
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false
      }
    });

    return { message: 'Password reset successfully' };
  }
}
