import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { generateToken } from '@/lib/jwt';
import type { User, AuthResponse } from '@/lib/models';

const VENDOR_EMAILS = (process.env.VENDOR_EMAILS || 'vendor@cuet.com').split(',').map(e => e.trim());

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Determine role (vendor emails take priority)
    const role = VENDOR_EMAILS.includes(email.toLowerCase()) ? 'vendor' : user.role;

    // Update role if it changed
    if (role !== user.role) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { role, updatedAt: new Date() } }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      role,
    });

    const response: AuthResponse = {
      success: true,
      user: {
        id: user._id!.toString(),
        email: user.email,
        displayName: user.displayName,
        role,
      },
      token,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to login' },
      { status: 500 }
    );
  }
}
